from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models, schemas
from ..security import compute_face_hash_from_base64, is_same_face, create_access_token, hamming_distance
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
    Login solo con la cara: comparar pHash del rostro provisto con todos los almacenados.
    Seleccionar SIEMPRE la mejor coincidencia global y validar contra el umbral.
    """
    from ..security import FACE_MATCH_THRESHOLD

    provided_hash = compute_face_hash_from_base64(face_image)
    print(f"Provided face hash: {provided_hash}")

    best_match_distance = 64
    best_match_user = None

    for candidate in db.query(models.User).all():
        distance = hamming_distance(candidate.face_hash, provided_hash)
        print(f"Comparing with user {candidate.username} (id={candidate.id}): distance={distance}")
        if distance < best_match_distance:
            best_match_distance = distance
            best_match_user = candidate

    if not best_match_user or best_match_distance > FACE_MATCH_THRESHOLD:
        print(
            "No match under threshold. Best match: "
            f"{best_match_user.username if best_match_user else 'None'} with distance {best_match_distance},"
            f" threshold={FACE_MATCH_THRESHOLD}"
        )
        raise HTTPException(
            status_code=401,
            detail=f"Rostro no coincide con ningún usuario registrado. Mejor coincidencia: distancia {best_match_distance}",
        )

    token = create_access_token(subject=best_match_user.email)
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


# ====== Edición de usuarios (solo datos básicos) ======
from pydantic import BaseModel


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    dni: Optional[str] = None


@router.put("/users/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Validaciones de unicidad básicas si cambian email o dni
    if payload.email and payload.email != user.email:
        exists_email = db.query(models.User).filter(models.User.email == payload.email).first()
        if exists_email:
            raise HTTPException(status_code=400, detail="Email ya está en uso")
        user.email = payload.email

    if payload.dni and payload.dni != user.dni:
        exists_dni = db.query(models.User).filter(models.User.dni == payload.dni).first()
        if exists_dni:
            raise HTTPException(status_code=400, detail="DNI ya está en uso")
        user.dni = payload.dni

    if payload.username:
        user.username = payload.username

    db.commit()
    db.refresh(user)
    return user
