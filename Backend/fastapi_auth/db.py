from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'user.db'
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False,
        # Tiempo de espera para locks (segundos)
        "timeout": 10,
    },
    pool_pre_ping=True,
)

# Configurar PRAGMAs para mejorar concurrencia con SQLite
with engine.connect() as conn:
    try:
        conn.execute(text("PRAGMA journal_mode=WAL"))
        conn.execute(text("PRAGMA synchronous=NORMAL"))
        conn.execute(text("PRAGMA busy_timeout=5000"))  # milisegundos
    except Exception:
        # Si falla (otro motor o permisos), continuar sin interrumpir
        pass

    # Migración simple: asegurar columna 'role' en tabla users
    try:
        res = conn.execute(text("PRAGMA table_info(users)"))
        cols = [row[1] for row in res.fetchall()]  # (cid, name, type, ...)
        if 'role' not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'Usuario'"))
        # Backfill inicial: promover a CEO a usuarios clave por username si existen
        try:
            conn.execute(text("UPDATE users SET role='CEO' WHERE username IN ('Eduard','Leonel')"))
        except Exception:
            pass
    except Exception:
        # Si no se puede migrar automáticamente, continuar; la app puede fallar en endpoints que esperan 'role'
        # pero evitamos romper el arranque del servidor. Recomendación: revisar logs.
        pass

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
