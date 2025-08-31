from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models, schemas
from ..security import compute_face_hash_from_base64, is_same_face, create_access_token
from pydantic import EmailStr  # import permitido pero no se instancia
from typing import Optional, List
from uuid import uuid4
from datetime import datetime, timezone
try:
    from zoneinfo import ZoneInfo  # Python 3.9+
except Exception:
    ZoneInfo = None  # fallback

router = APIRouter()


@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register_user(
    username: str = Form(...),
    dni: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    face_image: str = Form(...),
    db: Session = Depends(get_db),
):
    # face_image debe ser un dataURL/base64 del frame de la cámara
    face_hash = compute_face_hash_from_base64(face_image)

    # Autogenerar email/dni si no se envían
    if not email:
        email = f"{username}+auto-{uuid4().hex[:6]}@local.test"
    if not dni:
        dni = f"auto-{uuid4().hex[:8]}"

    # Si ya existe el username, actualizamos su face_hash en lugar de crear duplicados
    existing_by_username = (
        db.query(models.User)
        .filter(models.User.username == username)
        .order_by(models.User.created_at.desc())
        .first()
    )
    if existing_by_username:
        existing_by_username.face_hash = face_hash
        db.commit()
        db.refresh(existing_by_username)
        # 200 OK sería semánticamente correcto, pero mantenemos 201 por compat.
        return existing_by_username

    # Validar unicidad por email y dni (para nuevos usuarios)
    existing = db.query(models.User).filter(
        (models.User.email == email) | (models.User.dni == dni)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Usuario ya existe por email o DNI")

    # Fecha/hora local de Lima al momento de registrar
    if ZoneInfo is not None:
        created_at_local = datetime.now(ZoneInfo("America/Lima"))
    else:
        # Fallback: UTC-5 manual si no hay zoneinfo
        created_at_local = datetime.utcnow().replace(tzinfo=timezone.utc)
        # Nota: si se requiere exacto UTC-5 sin DST, se podría ajustar -5h fijo.

    user = models.User(
        username=username,
        dni=dni,
        email=email,
        face_hash=face_hash,
        created_at=created_at_local,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/users", response_model=List[schemas.UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()


@router.delete("/users/by-username/{username}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_by_username(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(user)
    db.commit()
    return


@router.delete("/users/by-username/{username}/all", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_users_by_username(username: str, db: Session = Depends(get_db)):
    q = db.query(models.User).filter(models.User.username == username)
    if q.count() == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    q.delete(synchronize_session=False)
    db.commit()
    return


@router.post("/login/face", response_model=schemas.Token)
def login_face(
    face_image: str = Form(...),
    db: Session = Depends(get_db),
):
    """
    Login solo con la cara: se compara el hash del rostro provisto con los almacenados.
    Si coincide con algún usuario, emite token. Evita pedir DNI/correo en login.
    """
    provided_hash = compute_face_hash_from_base64(face_image)

    # Buscar coincidencia de rostro
    user = None
    for candidate in db.query(models.User).all():
        if is_same_face(candidate.face_hash, provided_hash):
            user = candidate
            break

    if not user:
        raise HTTPException(status_code=401, detail="Rostro no coincide con ningún usuario registrado")

    token = create_access_token(subject=user.email)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserOut)
def me(token: str, db: Session = Depends(get_db)):
    # token simple en query o header (frontend lo pasará como header Authorization normalmente)
    # Permitimos query para simplificar pruebas; en prod, usar dependency OAuth2
    from ..security import decode_token
    try:
        payload = decode_token(token)
        email = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user
