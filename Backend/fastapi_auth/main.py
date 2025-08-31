from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth
from .db import Base, engine
from . import models

app = FastAPI(title="FastAPI Auth", version="0.1.0")

# CORS (ajusta origins según tu frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/test-face-processing")
def test_face_processing():
    """Endpoint de prueba para verificar que el procesamiento facial funciona"""
    try:
        from .security import compute_face_hash_from_base64
        # Probar con una imagen base64 de prueba (puede ser cualquier imagen válida)
        test_image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        face_hash = compute_face_hash_from_base64(test_image)
        return {
            "status": "ok",
            "face_processing_works": True,
            "hash_length": len(face_hash) if face_hash else 0
        }
    except Exception as e:
        return {
            "status": "error",
            "face_processing_works": False,
            "error": str(e)
        }


@app.on_event("startup")
def on_startup():
    # Crear tablas si no existen
    Base.metadata.create_all(bind=engine)
