from sqlalchemy import Column, Integer, String, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from .db import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), nullable=False)
    dni = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    # Nuevo: rol persistido en DB (CEO | Administrador | Supervisor | Usuario)
    # server_default asegura valor para filas existentes tras migración
    role = Column(String(32), nullable=False, server_default='Usuario')
    face_hash = Column(String(255), nullable=False)
    # Guardar hora local de Lima (UTC-5) al momento de insertar (independiente de la zona del servidor)
    # En SQLite, func.datetime('now', '-5 hours') aplica el offset al timestamp actual
    created_at = Column(DateTime(timezone=True), server_default=func.datetime('now', '-5 hours'))

    __table_args__ = (
        UniqueConstraint('email', name='uq_user_email'),
        UniqueConstraint('dni', name='uq_user_dni'),
    )
