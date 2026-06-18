from fastapi import BackgroundTasks, FastAPI, Depends, HTTPException
import re
from sqlalchemy.orm import Session
from crud_base import CRUDBase
import models, schemas
from database import SessionLocal
from fastapi.middleware.cors import CORSMiddleware
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema
import os
from dotenv import load_dotenv
from sqlalchemy.orm import joinedload, with_loader_criteria
from fastapi.security import OAuth2PasswordRequestForm
from auth import (
    hash_password,
    verify_password,
    create_access_token
)
from datetime import datetime, timedelta
from auth import get_current_user

load_dotenv()  # Carga las variables del archivo .env

FRONTEND_URL = os.getenv("FRONTEND_URL")
USER_KEY = os.getenv("USER_KEY")

# === CONFIGURACIÓN DE CORREO (Usando Variables de Entorno) ===
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_SERVER = os.getenv("MAIL_SERVER")
MAIL_PORT = int(os.getenv("MAIL_PORT", 587)) # Asegura que sea un entero, default 587

conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,
    MAIL_FROM=MAIL_USERNAME,         # El remitente será la misma cuenta de usuario
    MAIL_PORT=MAIL_PORT,
    MAIL_SERVER=MAIL_SERVER,
    MAIL_STARTTLS=True,             # Estándar para la mayoría de SMTPs
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

# ==== Inicialización FastAPI ====
app = FastAPI()

# ==== Habilitar CORS para pruebas con frontend ====
app.add_middleware(
   CORSMiddleware,
   allow_origins=[FRONTEND_URL],
   allow_credentials=True,
   allow_methods=["*"],
   allow_headers=["*"],
)

# ==== Dependencia para obtener la sesión de DB ====
def get_db():
   db = SessionLocal()
   try:
       yield db
   finally:
       db.close()

# ==== ENDPOINTS REGISTRACION USUARIOS ====
# Nuevo usuario
@app.post("/auth/register/")
def register(
    registro: schemas.UsuarioCreate,
    db: Session = Depends(get_db)
):
    # Verificar email existente
    usuario_existente = db.query(models.Usuario).filter(
        models.Usuario.email == registro.email, models.Usuario.borrado == False
    ).first()
    if usuario_existente:
        raise HTTPException(
            status_code=400,
            detail="El email ya está registrado"
        )
    # Crear usuario
    nuevo_usuario = models.Usuario(
        perfilid=registro.perfilid,
        nombre=registro.nombre,
        email=registro.email,
        password = hash_password(USER_KEY),
        telefono=registro.telefono,
        foto=registro.foto,
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return {"message": "Usuario creado correctamente"}

@app.post("/auth/cambiar-password/")
def cambiar_password(
    datos: schemas.LoginRequest,
    db: Session = Depends(get_db)
):
    usuario = db.query(models.Usuario).filter(
        models.Usuario.email == datos.email,
        models.Usuario.borrado == False
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    # Verificar que realmente sea un usuario con clave temporal
    if not verify_password(USER_KEY, usuario.password):
        raise HTTPException(
            status_code=400,
            detail="El usuario ya posee una contraseña definida"
        )
    
    # Validación dato correcto
    if len(datos.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="La contraseña debe tener al menos 6 caracteres"
        )
    if not re.search(r"[A-Za-z]", datos.password):
        raise HTTPException(
            status_code=400,
            detail="La contraseña debe contener al menos una letra"
        )
    if not re.search(r"\d", datos.password):
        raise HTTPException(
            status_code=400,
            detail="La contraseña debe contener al menos un número"
        )
    
    usuario.password = hash_password(
        datos.password
    )

    usuario.intentos = 0
    usuario.bloqueado = None
    db.commit()

    # Crear JWT
    access_token = create_access_token({
        "sub": usuario.email,
        "user_id": usuario.id
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email
        }
    }

@app.post("/auth/reset-password/")
def reset_password(
    datos: schemas.ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == datos.id, models.Usuario.borrado == False).first()
    
    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )
    usuario.password = hash_password(USER_KEY)
    usuario.intentos = 0
    usuario.bloqueado = None
    db.commit()
    return {
        "message": "Contraseña reseteada correctamente"
    }

# Desde el front mandar:
# { "email": "admin@mail.com",
#   "password": "123456" }
@app.post("/auth/login/")
def login(
    datos: schemas.LoginRequest,
    db: Session = Depends(get_db)
):
    usuario = db.query(models.Usuario).filter(models.Usuario.email == datos.email, models.Usuario.borrado == False).first()
    
    # Usuario inexistente
    if not usuario:
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña incorrectos"
        )
    
    # Verificar bloqueo
    if usuario.bloqueado:
        if usuario.bloqueado > datetime.utcnow():
            minutos = int(
                (usuario.bloqueado - datetime.utcnow()).total_seconds() / 60
            )
            raise HTTPException(
                status_code=403,
                detail=f"Cuenta bloqueada. Intente nuevamente en {minutos} minutos."
            )
        else:
            # desbloquear automáticamente
            usuario.bloqueado = None
            usuario.intentos = 0
            db.commit()
    
    # ¿Tiene contraseña temporal?
    if verify_password(USER_KEY, usuario.password):
        return {
            "cambiar_password": True,
            "email": usuario.email,
            "message": "Debe cambiar su contraseña"
        }
    
    # Verificar password
    password_correcta = verify_password(
        datos.password,
        usuario.password
    )
    if not password_correcta:
        usuario.intentos += 1
        # BLOQUEAR AL TERCER INTENTO
        if usuario.intentos >= 3:
            usuario.bloqueado = datetime.utcnow() + timedelta(minutes=15)
            usuario.intentos = 0
            db.commit()
            raise HTTPException(
                status_code=403,
                detail="Cuenta bloqueada por 15 minutos."
            )
        db.commit()
        raise HTTPException(
            status_code=401,
            detail=f"Usuario o contraseña incorrectos. Intento {usuario.intentos}/3"
        )

    
    # LOGIN CORRECTO
    usuario.intentos = 0
    usuario.bloqueado = None
    db.commit()

    access_token = create_access_token({
        "sub": usuario.email,
        "user_id": usuario.id
    })

    return {
        "cambiar_password": False,
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email
        }
    }

# ==== ENDPOINTS ENVÍO DE CORREO DE AVISO ====
@app.post("/EnviarAviso/")
async def enviar_correo_aviso(registro: schemas.Aviso, background_tasks: BackgroundTasks):
    # Contenido HTML simple
    html_content = f"""
    <html>
        <body>
            <h4>Estimado <strong>{registro.nombre}</strong>,</h4>
            <h4><strong>{registro.mensaje}</strong></h4>
            <p>Saludos cordiales.</p>
            <br>
            <br>
            <br>
            <h5>-- Gentileza del equipo de OrescoSoft --</h5>
        </body>
    </html>
    """
    
    # Estructura del mensaje de correo
    message = MessageSchema(
        subject=registro.asunto,
        recipients=[registro.email_destino],
        body=html_content,
        subtype="html"
    )

    # Cliente de correo
    fm = FastMail(conf)
    
    # Agrega la tarea de envío al pool de tareas de fondo
    # Esto asegura que la respuesta sea rápida.
    background_tasks.add_task(fm.send_message, message)

    return {"message": f"Aviso para Luis de {registro.nombre} en cola para ser enviado a {registro.email_destino}"}

# ==== ENDPOINTS GENÉRICOS ====
# ==== Diccionario para mapear nombres de tabla a modelos y esquemas ====
TABLAS = {
    "usuario": {
        "model": models.Usuario,
        "schema": schemas.UsuarioResponse
    },
    "perfil": {
        "model": models.Perfil,
        "schema": schemas.Perfil
    },
    "sector": {
        "model": models.Sector,
        "schema": schemas.Sector
    },
    "perfilxsector": {
        "model": models.Perfilxsector,
        "schema": schemas.Perfilxsector
    }
}

# Funciones auxiliares para obtener modelo y esquema según el nombre de la tabla

def get_tabla(tabla: str):
    if tabla not in TABLAS:
        raise HTTPException(status_code=404, detail="Tabla no encontrada")
    return TABLAS[tabla]

def get_model(tabla: str):
    tabla_info = get_tabla(tabla)
    return tabla_info["model"]

def get_schema(tabla: str):
    tabla_info = get_tabla(tabla)
    return tabla_info["schema"]

# Listar registros de una tabla (solo los no borrados lógicamente)

@app.get("/{tabla}/")
def listar_tabla(tabla: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    model = get_model(tabla)
    crud = CRUDBase(model)
    return crud.get_all(db)

# Relaciones genéricas
@app.get("/{tabla}/relaciones/")
def listar_relaciones(
    tabla: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    model = get_model(tabla)
    query = db.query(model).filter(model.borrado == False)
    # Cargar relaciones automáticamente
    if tabla == "usuario":
        query = query.options(
            joinedload(models.Usuario.perfil),
            with_loader_criteria(
                models.Perfil,
                lambda cls: cls.borrado == False,
                include_aliases=True
            )
        )

    elif tabla == "perfilxsector":
        query = query.options(
            joinedload(models.Perfilxsector.perfil),
            joinedload(models.Perfilxsector.sector),
            with_loader_criteria(
                models.Perfil,
                lambda cls: cls.borrado == False,
                include_aliases=True
            ),
            with_loader_criteria(
                models.Sector,
                lambda cls: cls.borrado == False,
                include_aliases=True
            )
        )

    return query.all()

@app.get("/{tabla}/{item_id}/")
def obtener_por_id(tabla: str, item_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    model = get_model(tabla)
    crud = CRUDBase(model)
    return crud.get_by_id(db, item_id)

@app.post("/{tabla}/")
def crear(tabla: str, registro: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    schema = get_schema(tabla)
    model = get_model(tabla)
    crud = CRUDBase(model)
    obj_in = schema(**registro)
    return crud.create(db, obj_in)

@app.put("/{tabla}/{item_id}/")
def actualizar(tabla: str, item_id: int, registro: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    schema = get_schema(tabla)
    model = get_model(tabla)
    crud = CRUDBase(model)
    obj_in = schema(**registro)
    return crud.update(db, item_id, obj_in)

@app.delete("/{tabla}/{item_id}/")
def borrar(tabla: str, item_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    model = get_model(tabla)
    crud = CRUDBase(model)
    return crud.logical_delete(db, item_id)

@app.delete("/{tabla}/fisico/{item_id}/")
def borrar_fisico(tabla: str, item_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    model = get_model(tabla)
    crud = CRUDBase(model)
    return crud.delete(db, item_id)

# Con Relaciones. Necesito saber el schema (response_model) para que me devuelva los datos relacionados.

# @app.get("/{tabla}/relaciones/", response_model=list[schemas.Relacion])
# def listar_relaciones(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
#     return db.query(models.Relacion).all()
