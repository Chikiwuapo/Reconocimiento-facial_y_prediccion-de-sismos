# Reconocimiento facial y predicción de sismos

Este proyecto combina dos backends y un frontend:

- Backend (Django) para exponer datos de sismos desde `prediction.db`.
- Backend (FastAPI) para registro y login con reconocimiento facial.
- Frontend (Vite + React/TS) que consume ambos backends.

A continuación se explica la arquitectura, los directorios importantes y cómo se comunican.

---

## Backend (Django) — Predicción de sismos

- Ruta: `Backend/`
- Proyecto Django: `logic/`
  - `logic/settings.py`: configuración global de Django.
    - Base de datos principal: `prediction.db` (SQLite) vía `DATABASES['default']`.
    - Apps instaladas: `api`, `rest_framework`, `corsheaders`, etc.
    - CORS habilitado para desarrollo.
  - `logic/urls.py`: enruta las URLs del proyecto hacia la app `api`.
  - `logic/wsgi.py` y `logic/asgi.py`: entrypoints WSGI/ASGI.
  - Qué pasaría si se elimina `logic/`:
    - El proyecto Django no arrancará (errores de import), y ningún endpoint de sismos funcionará.

- Aplicación Django: `api/`
  - `api/models.py`:
    - Modelo `EarthquakePrediction` mapea la tabla SQLite `prediction` (con `managed = False`).
      - Campos relevantes: `country_code`, `event_date`, `max_mag_last90d`, `prob_m45_next7d`, etc.
    - `CountrySummary` (modelo auxiliar para cálculos agregados).
    - Qué pasaría si se elimina `models.py` o la clase `EarthquakePrediction`:
      - Las consultas SQL directas en las vistas podrían seguir funcionando, pero se perderían representaciones y utilidades del ORM.
  - `api/views.py`: expone endpoints REST (Django REST Framework) consultando `prediction.db` mediante SQL.
    - GET `/api/countries/south-american/` → resumen por país sudamericano.
    - GET `/api/countries/{country_code}/` → últimos eventos del país.
    - GET `/api/statistics/` → estadísticas generales.
    - GET `/api/statistics/year/{year}/` → estadísticas por año.
    - GET `/api/countries/{country_code}/year/{year}/` → estadísticas por país y año.
    - GET `/api/statistics/all-years/` → estadísticas agregadas todos los años.
    - GET `/api/countries/{country_code}/all-years/` → estadísticas históricas por país.
    - GET `/api/dashboard/?range=24h|7d|30d` → datos para dashboard (mapa, top países, etc.).
    - Qué pasaría si se elimina `views.py` o se rompen estas funciones:
      - El frontend dejaría de recibir datos para mapas, tablas y estadísticas.
  - `api/urls.py`: mapea los endpoints anteriores bajo el prefijo `/api`.
  - Qué pasaría si se elimina `api/` completa:
    - No existirían endpoints REST de sismos, el frontend fallaría al consumirlos.

- Base de datos de sismos: `Backend/prediction.db`
  - Contiene la tabla `prediction` con registros históricos (país, fecha, magnitudes, probabilidades, etc.).
  - Qué pasaría si se elimina `prediction.db`:
    - Los endpoints que consultan la base devolverán errores o datos vacíos. Debe restaurarse desde una copia o regenerarse.

- Cómo ejecutar (desarrollo):
  - Requisitos: Python 3.10+, pip.
  - Instalar dependencias:
    ```bash
    pip install -r Backend/requirements.txt
    ```
  - Ejecutar servidor Django (por defecto 8000):
    ```bash
    python Backend/manage.py runserver 0.0.0.0:8000
    ```

---

## Backend (FastAPI) — Autenticación por rostro

- Ruta: `Backend/fastapi_auth/`
- Propósito: registrar usuarios y autenticarlos por reconocimiento facial (hash de rostro) para emitir tokens.
- Archivos principales:
  - `fastapi_auth/main.py`:
    - Crea la app FastAPI, configura CORS para `http://localhost:3000` y `http://localhost:5173`.
    - Incluye router `auth` bajo el prefijo `/auth`.
    - `/health` para ver estado y `/test-face-processing` para probar procesamiento facial.
    - En evento `startup` crea tablas si no existen.
  - `fastapi_auth/routers/auth.py` (endpoints):
    - POST `/auth/register` (form): `username`, `face_image` (dataURL base64), opcional `dni`, `email` → crea/actualiza usuario con `face_hash`.
    - GET `/auth/users` → lista de usuarios.
    - DELETE `/auth/users/by-username/{username}` → elimina un usuario.
    - DELETE `/auth/users/by-username/{username}/all` → elimina todas las entradas con ese `username`.
    - POST `/auth/login/face` (form): `face_image` → compara hashes y devuelve `{ access_token, token_type }`.
    - GET `/auth/me?token=...` → devuelve el usuario asociado al token.
  - `fastapi_auth/security.py`:
    - Lógica de hashing/comparación de rostros y emisión/validación de JWT.
  - `fastapi_auth/models.py`, `fastapi_auth/schemas.py`, `fastapi_auth/db.py`:
    - Modelos SQLAlchemy, Pydantic y conexión/creación de BD.
  - Base de datos de usuarios: `fastapi_auth/user.db` (SQLite) (+ WAL/SHM).
    - Qué pasaría si se elimina `user.db`:
      - Se pierden usuarios registrados. El servicio se re-creará vacío al iniciar; será necesario registrar rostros otra vez.

- Cómo ejecutar (desarrollo):
  ```bash
  # Recomendado en otro terminal/puerto (8001)
  uvicorn Backend.fastapi_auth.main:app --reload --host 0.0.0.0 --port 8001
  ```

---

## Frontend (Vite + React + TS)

- Ruta: `Frontend/`
- Carpetas clave:
  - `Frontend/src/auth/`
    - `FacialLogin.tsx`, `FacialLogin.css`: interfaz de login facial. Captura un frame de la cámara (dataURL) y lo envía al endpoint FastAPI `/auth/login/face`. Maneja estados visuales (detección, distancia/lejanía, etc.).
    - Qué pasaría si se elimina `src/auth/`:
      - Se pierde el flujo de login por rostro. Otras partes de la app podrían seguir, pero sin autenticación facial.
  - `Frontend/src/services/`
    - `auth.ts`:
      - `AUTH_API` configurable vía `VITE_AUTH_API` (por defecto `http://localhost:8001`).
      - `registerUser`, `loginFace`, `me` → comunican con FastAPI.
    - `earthquakeService.ts`:
      - `API_BASE_URL = 'http://localhost:8000/api'` por defecto.
      - Métodos: `getSouthAmericanCountries`, `getCountryDetails`, `getEarthquakeStatistics`, `getYearlyStatistics`, `getAllYearsStatistics`, `getCountryYearlyStatistics`, `getCountryAllYearsStatistics`, `getDashboardData`.
      - Convierten y tipan respuestas para el frontend.
    - `userService.ts`:
      - Gestión de usuarios y roles en el frontend (persistencia local, helpers de UI, etc.).
    - Qué pasaría si se elimina `src/services/` o alguno de sus archivos:
      - Las llamadas al backend fallarán; la UI no podrá cargar datos de sismos ni autenticarse.

- Variables de entorno (Frontend):
  - `VITE_AUTH_API` (opcional): URL base del backend FastAPI (p. ej., `http://localhost:8001`).
  - Si no se define, usa `http://localhost:8001` por defecto.

- Ejecución del frontend:
  ```bash
  # Desde Frontend/
  npm install
  npm run dev  # suele iniciar en http://localhost:5173
  ```

---

## Comunicación entre componentes

- Frontend → Django (sismos):
  - `earthquakeService.ts` hace `fetch` a `http://localhost:8000/api/...` para estadísticas y datos por país.
- Frontend → FastAPI (reconocimiento facial):
  - `auth.ts` envía `FormUrlEncoded` con `face_image` base64 hacia `http://localhost:8001/auth/...`.
- CORS:
  - Django habilita `CORS_ALLOW_ALL_ORIGINS = True` (desarrollo).
  - FastAPI permite orígenes `localhost:3000` y `localhost:5173` (configurable en `main.py`).

---

## Puesta en marcha rápida (desarrollo)

1) Backend de sismos (Django)
   - `pip install -r Backend/requirements.txt`
   - `python Backend/manage.py runserver 0.0.0.0:8000`

2) Backend de autenticación (FastAPI)
   - `uvicorn Backend.fastapi_auth.main:app --reload --host 0.0.0.0 --port 8001`

3) Frontend
   - `cd Frontend`
   - `npm install && npm run dev` (http://localhost:5173)
   - (opcional) `.env` en Frontend con `VITE_AUTH_API=http://localhost:8001`

---

## Notas y advertencias

- No borrar `Backend/prediction.db`: es la fuente de datos de los endpoints de sismos.
- No borrar `Backend/fastapi_auth/user.db`: contiene usuarios/rostros registrados.
- Si cambias puertos, actualiza el frontend (`VITE_AUTH_API`) y, si es necesario, CORS en ambos backends.
- Producción: desactivar `DEBUG`, restringir `ALLOWED_HOSTS` y CORS, migrar a una base de datos robusta y manejar secretos con variables de entorno.
