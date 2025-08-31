import os
import base64
import io
from datetime import datetime, timedelta
from typing import Optional

from jose import jwt
from PIL import Image
import imagehash

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-prod")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
FACE_MATCH_THRESHOLD = int(os.getenv("FACE_MATCH_THRESHOLD", "16"))  # Más permisivo para facilitar pruebas


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_token(token: str):
    return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])


def compute_face_hash_from_bytes(data: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(data)).convert("L").resize((256, 256))
        ph = imagehash.phash(image)
        return str(ph)
    except Exception as e:
        print(f"Error computing face hash: {e}")
        return ""


def compute_face_hash_from_base64(data_url: str) -> str:
    # expects data URL like 'data:image/jpeg;base64,...'
    try:
        header, b64data = data_url.split(",", 1) if "," in data_url else ("", data_url)
        raw = base64.b64decode(b64data)
        return compute_face_hash_from_bytes(raw)
    except Exception as e:
        print(f"Error processing base64 image: {e}")
        return ""


def hamming_distance(hash_a: str, hash_b: str) -> int:
    try:
        if not hash_a or not hash_b:
            return 64  # max distance if hashes are empty
        return imagehash.hex_to_hash(hash_a) - imagehash.hex_to_hash(hash_b)
    except Exception as e:
        print(f"Error computing hamming distance: {e}")
        return 64  # max distance for 64-bit pHash


def is_same_face(hash_a: str, hash_b: str, threshold: Optional[int] = None) -> bool:
    th = threshold if threshold is not None else FACE_MATCH_THRESHOLD
    distance = hamming_distance(hash_a, hash_b)
    print(f"Face comparison: distance={distance}, threshold={th}, match={distance <= th}")
    return distance <= th
