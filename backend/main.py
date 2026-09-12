from fastapi import BackgroundTasks, FastAPI, Depends, HTTPException
import re
from sqlalchemy import inspect
from sqlalchemy.orm import Session
from crud_base import CRUDBase
import models, schemas
from database import SessionLocal
from fastapi.middleware.cors import CORSMiddleware
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import SecretStr
import os
from typing import cast
from dotenv import load_dotenv
from sqlalchemy.orm import joinedload, with_loader_criteria
from auth import (
    hash_password,
    verify_password,
    create_access_token
)
from datetime import datetime, timedelta
from auth import get_current_user

load_dotenv()  # Carga las variables del archivo .env

FRONTEND_URL = os.getenv("FRONTEND_URL","")
USER_KEY = os.getenv("USER_KEY","")

# === CONFIGURACIÓN DE CORREO (Usando Variables de Entorno) ===
MAIL_USERNAME = os.getenv("MAIL_USERNAME","")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD","")
MAIL_SERVER = os.getenv("MAIL_SERVER","")
MAIL_PORT = int(os.getenv("MAIL_PORT","587")) # Asegura que sea un entero, default 587

conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=SecretStr(MAIL_PASSWORD),
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

# ==== ENDPOINTS USUARIOS ====
# Traer Sectores
def traer_items(
    perfil_id: int,
    db: Session
):
    return [
        item.nombre
        for item in (
            db.query(models.Item)
            .join(
                models.Item_Perfil,
                models.Item.id == models.Item_Perfil.item_id
            )
            .filter(
                models.Item_Perfil.perfil_id == perfil_id,
                models.Item_Perfil.borrado == False,
                models.Item.borrado == False
            )
            .all()
        )
    ]

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
        perfil_id=registro.perfil_id,
        nombre=registro.nombre,
        password = hash_password(USER_KEY),
        email=registro.email,
        telefono=registro.telefono,
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return {"message": "Usuario creado correctamente"}

# Cambiar Password
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
    if not verify_password(USER_KEY, str(usuario.password)):
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
    
    setattr(usuario, "password", hash_password(datos.password))
    setattr(usuario, "intentos", 0)
    setattr(usuario, "bloqueado", None)
    db.commit()

    # Crear JWT
    access_token = create_access_token({
        "sub": usuario.email,
        "user_id": usuario.id
    })

    #Traer Items
    items = traer_items(cast(int, usuario.perfil_id), db)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "items": items
        }
    }

# Resetear Password (solo admin)
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
    setattr(usuario, "password", hash_password(USER_KEY))
    setattr(usuario, "intentos", 0)
    setattr(usuario, "bloqueado", None)
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
    bloqueado = cast(datetime | None, usuario.bloqueado)
    if bloqueado is not None:
        if bloqueado > datetime.utcnow():
            minutos = int(
                (bloqueado - datetime.utcnow()).total_seconds() / 60
            )
            raise HTTPException(
                status_code=403,
                detail=f"Cuenta bloqueada. Intente nuevamente en {minutos} minutos."
            )
        else:
            # desbloquear automáticamente
            setattr(usuario, "bloqueado", None)
            setattr(usuario, "intentos", 0)
            db.commit()
    
    # ¿Tiene contraseña temporal?
    if verify_password(USER_KEY, str(usuario.password)):
        return {
            "cambiar_password": True,
            "email": usuario.email,
            "message": "Debe cambiar su contraseña"
        }
    
    # Verificar password
    password_correcta = verify_password(
        datos.password,
        str(usuario.password)
    )
    intentando = cast(int, usuario.intentos)
    if not password_correcta:
        intentando += 1
        # BLOQUEAR AL TERCER INTENTO
        if intentando >= 3:
            setattr(usuario, "bloqueado", datetime.utcnow() + timedelta(minutes=15))
            setattr(usuario, "intentos", 0)
            db.commit()
            raise HTTPException(
                status_code=403,
                detail="Cuenta bloqueada por 15 minutos."
            )
        else:
            setattr(usuario, "intentos", intentando)
            db.commit()
        raise HTTPException(
            status_code=401,
            detail=f"Usuario o contraseña incorrectos. Intento {intentando}/3"
        )
    
    # LOGIN CORRECTO
    setattr(usuario, "intentos", 0)
    setattr(usuario, "bloqueado", None)
    db.commit()

    access_token = create_access_token({
        "sub": usuario.email,
        "user_id": usuario.id
    })

    #Traer Sectores
    items = traer_items(cast(int, usuario.perfil_id), db)

    return {
        "cambiar_password": False,
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "items": items
        }
    }

# ==== VENCIMIENTO ====
@app.get("/auth/fecha/")
def fecha(
    db: Session = Depends(get_db)
):
    vence = db.query(models.Usuario).filter(models.Usuario.borrado == False).first()
    if vence is None:
        raise HTTPException(status_code=404, detail="No se encontró la fecha de vencimiento")
    db.commit()
    return [{
        "vencimiento": vence.vencimiento 
    }]

# Desde el front mandar:
# { "email": "admin@mail.com",
#   "password": "123456",
#   "vencimiento: "2026-12-25" }
@app.put("/auth/habilitar/")
def habilitar(
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
    bloqueado = cast(datetime | None, usuario.bloqueado)
    if bloqueado is not None:
        if bloqueado > datetime.utcnow():
            minutos = int(
                (bloqueado - datetime.utcnow()).total_seconds() / 60
            )
            raise HTTPException(
                status_code=403,
                detail=f"Cuenta bloqueada. Intente nuevamente en {minutos} minutos."
            )
        else:
            # desbloquear automáticamente
            setattr(usuario, "bloqueado", None)
            setattr(usuario, "intentos", 0)
            db.commit()

    # ¿Tiene contraseña temporal?
    if verify_password(USER_KEY, str(usuario.password)):
        return {
            "cambiar_password": True,
            "email": usuario.email,
            "message": "Debe cambiar su contraseña"
        }
    
    # Verificar password
    password_correcta = verify_password(
        datos.password,
        str(usuario.password)
    )
    intentando = cast(int, usuario.intentos)
    if not password_correcta:
        intentando += 1
        # BLOQUEAR AL TERCER INTENTO
        if intentando >= 3:
            setattr(usuario, "bloqueado", datetime.utcnow() + timedelta(minutes=15))
            setattr(usuario, "intentos", 0)
            db.commit()
            raise HTTPException(
                status_code=403,
                detail="Cuenta bloqueada por 15 minutos."
            )
        else:
            setattr(usuario, "intentos", intentando)
            db.commit()
        raise HTTPException(
            status_code=401,
            detail=f"Usuario o contraseña incorrectos. Intento {intentando}/3"
        )
    
    # LOGIN CORRECTO, actualizo fecha
    setattr(usuario, "intentos", 0)
    setattr(usuario, "bloqueado", None)
    setattr(usuario, "vencimiento", datos.vencimiento)
    db.commit()

    access_token = create_access_token({
        "sub": usuario.email,
        "user_id": usuario.id
    })

    return {
        "vencimiento_actualizado": True,
        "access_token": access_token,
        "token_type": "bearer",
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
            <h5>-- Gentileza del equipo --</h5>
        </body>
    </html>
    """
    
    # Estructura del mensaje de correo
    message = MessageSchema(
        subject=registro.asunto,
        recipients=cast(list, [registro.email_destino]),
        body=html_content,
        subtype=MessageType.html
    )

    # Cliente de correo
    fm = FastMail(conf)
    
    # Agrega la tarea de envío al pool de tareas de fondo
    # Esto asegura que la respuesta sea rápida.
    background_tasks.add_task(fm.send_message, message)

    return {"message": f"Aviso para Luis de {registro.nombre} en cola para ser enviado a {registro.email_destino}"}

# ==== ENDPOINTS GENÉRICOS ====

# ==== MAPEO CENTRAL DE RELACIONES ====
# Relaciones a traer por cada tabla
RELACIONES_POR_TABLA = {
    "canal": ["metodo"],
    "usuario": ["perfil"],
    "configuracion": ["frecuencia", "bias", "funcion", "usuario"],
    "pin_gpio": ["selector"],
    "medicion": ["canal", "configuracion"],
    "selector_configuracion": ["selector", "configuracion"],
    "item_perfil": ["item", "perfil"],
    # las que no tienen FK no necesitan entrada
}

def get_options_con_relaciones(model):
    """Genera dinámicamente los joinedload + filtro de borrado=False"""
    options = []
    relaciones = RELACIONES_POR_TABLA.get(model.__tablename__, [])
    mapper = inspect(model)
    for rel_name in relaciones:
        if rel_name not in mapper.relationships:
            continue
        rel_prop = mapper.relationships[rel_name]
        related_model = rel_prop.mapper.class_
        # joinedload para la relación
        options.append(joinedload(getattr(model, rel_name)))
        # si el modelo relacionado tiene campo borrado se lo filtra
        if hasattr(related_model, 'borrado'):
            options.append(
                with_loader_criteria(
                    related_model,
                    lambda cls: cls.borrado == False,
                    include_aliases=True
                )
            )
    return options

# ==== Diccionario para mapear nombres de tabla a modelos y esquemas ====
TABLAS = {
    "metodo": {
        "model": models.Metodo,
        "schema": schemas.Metodo
    },
    "frecuencia": {
        "model": models.Frecuencia,
        "schema": schemas.Frecuencia
    },
    "bias": {
        "model": models.Bias,
        "schema": schemas.Bias
    },
    "funcion": {
        "model": models.Funcion,
        "schema": schemas.Funcion
    },
    "selector": {
        "model": models.Selector,
        "schema": schemas.Selector
    },
    "item": {
        "model": models.Item,
        "schema": schemas.Item
    },
    "perfil": {
        "model": models.Perfil,
        "schema": schemas.Perfil
    },
    "canal": {
        "model": models.Canal,
        "schema": schemas.Canal
    },
    "usuario": {
        "model": models.Usuario,
        "schema": schemas.UsuarioResponse
    },
    "configuracion": {
        "model": models.Configuracion,
        "schema": schemas.Configuracion
    },
    "pin_gpio": {
        "model": models.Pin_Gpio,
        "schema": schemas.Pin_Gpio
    },
    "medicion": {
        "model": models.Medicion,
        "schema": schemas.Medicion
    },
    "selector_configuracion": {
        "model": models.Selector_Configuracion,
        "schema": schemas.Selector_Configuracion
    },
    "item_perfil": {
        "model": models.Item_Perfil,
        "schema": schemas.Item_Perfil
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
    options = get_options_con_relaciones(model)
    if options:
        query = query.options(*options)
    return query.all()

@app.get("/{tabla}/{campo}/{item_id}/campo/")
def obtener_por_campo_y_id(tabla: str, campo: str, item_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    model = get_model(tabla)
    crud = CRUDBase(model)
    return crud.get_by_campo_y_id(db, campo, item_id)

@app.get("/{tabla}/{item_id}/")
def obtener_por_id(tabla: str, item_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    model = get_model(tabla)
    crud = CRUDBase(model)
    return crud.get_by_id(db, item_id)

@app.get("/{tabla}/{item_id}/relaciones/")
def obtener_por_id_relaciones(tabla: str, item_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    model = get_model(tabla)
    crud = CRUDBase(model)
    query = db.query(model).filter(model.id == item_id, model.borrado == False)
    options = get_options_con_relaciones(model)
    if options:
        query = query.options(*options)
    result = query.first()
    if not result:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    return result

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
