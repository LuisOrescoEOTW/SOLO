from fastapi import BackgroundTasks, FastAPI, Depends, HTTPException
import re, os
from sqlalchemy.orm import Session
from crud_base import CRUDBase
import models, schemas
from database import SessionLocal
from fastapi.middleware.cors import CORSMiddleware
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import SecretStr
from typing import cast
from dotenv import load_dotenv
from datetime import datetime, timedelta
from auth import hash_password, verify_password, create_access_token, get_current_user

load_dotenv()
FRONTEND_URL = os.getenv("FRONTEND_URL","")
USER_KEY = os.getenv("USER_KEY","")
MAIL_USERNAME = os.getenv("MAIL_USERNAME","")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD","")
MAIL_SERVER = os.getenv("MAIL_SERVER","")
MAIL_PORT = int(os.getenv("MAIL_PORT","587"))

conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME, MAIL_PASSWORD=SecretStr(MAIL_PASSWORD),
    MAIL_FROM=MAIL_USERNAME, MAIL_PORT=MAIL_PORT, MAIL_SERVER=MAIL_SERVER,
    MAIL_STARTTLS=True, MAIL_SSL_TLS=False, USE_CREDENTIALS=True
)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=[FRONTEND_URL], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# ==== DICCIONARIO CENTRAL DE TABLAS ====
TABLAS = {
    "metodo": {"model": models.Metodo, "schema": schemas.Metodo},
    "frecuencia": {"model": models.Frecuencia, "schema": schemas.Frecuencia},
    "bias": {"model": models.Bias, "schema": schemas.Bias},
    "funcion": {"model": models.Funcion, "schema": schemas.Funcion},
    "selector": {"model": models.Selector, "schema": schemas.Selector},
    "item": {"model": models.Item, "schema": schemas.Item},
    "perfil": {"model": models.Perfil, "schema": schemas.Perfil},
    "canal": {"model": models.Canal, "schema": schemas.Canal},
    "usuario": {"model": models.Usuario, "schema": schemas.UsuarioResponse},
    "configuracion": {"model": models.Configuracion, "schema": schemas.Configuracion},
    "pin_gpio": {"model": models.Pin_Gpio, "schema": schemas.Pin_Gpio},
    "medicion": {"model": models.Medicion, "schema": schemas.Medicion},
    "selector_configuracion": {"model": models.Selector_Configuracion, "schema": schemas.Selector_Configuracion},
    "item_perfil": {"model": models.Item_Perfil, "schema": schemas.Item_Perfil},
}
def get_model(tabla: str):
    if tabla not in TABLAS: raise HTTPException(404, "Tabla no encontrada")
    return TABLAS[tabla]["model"]
def get_schema(tabla: str):
    if tabla not in TABLAS: raise HTTPException(404, "Tabla no encontrada")
    return TABLAS[tabla]["schema"]

# ==== AUTH ====
def traer_items(perfil_id: int, db: Session):
    return [item.nombre for item in db.query(models.Item).join(models.Item_Perfil, models.Item.id == models.Item_Perfil.item_id).filter(models.Item_Perfil.perfil_id == perfil_id, models.Item_Perfil.borrado == False, models.Item.borrado == False).all()]

@app.post("/auth/register/")
def register(registro: schemas.UsuarioBase, db: Session = Depends(get_db)):
    if db.query(models.Usuario).filter_by(email=registro.email, borrado=False).first():
        raise HTTPException(400, f"El email {registro.email} ya está registrado")
    if db.query(models.Usuario).filter_by(telefono=registro.telefono, borrado=False).first():
        raise HTTPException(400, f"El teléfono {registro.telefono} ya está registrado")
    nuevo = models.Usuario(perfil_id=registro.perfil_id, nombre=registro.nombre, password=hash_password(USER_KEY), email=registro.email, telefono=registro.telefono)
    try:
        db.add(nuevo); db.commit(); db.refresh(nuevo)
        return {"message": "Usuario creado correctamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(400, f"No se pudo crear: {e}")
    
@app.post("/auth/cambiar-password/")
def cambiar_password(datos: schemas.LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.email == datos.email, models.Usuario.borrado == False).first()
    if not usuario: raise HTTPException(404, "Usuario no encontrado")
    if not verify_password(USER_KEY, str(usuario.password)): raise HTTPException(400, "Ya posee contraseña definida")
    if len(datos.password) < 6 or not re.search(r"[A-Za-z]", datos.password) or not re.search(r"\d", datos.password):
        raise HTTPException(400, "La contraseña debe tener 6 caracteres, una letra y un número")
    setattr(usuario, "password", hash_password(datos.password)); setattr(usuario, "intentos", 0); setattr(usuario, "bloqueado", None); db.commit()
    token = create_access_token({"sub": usuario.email, "user_id": usuario.id})
    return {"access_token": token, "token_type": "bearer", "usuario": {"id": usuario.id, "nombre": usuario.nombre, "email": usuario.email, "items": traer_items(cast(int, usuario.perfil_id), db)}}

@app.post("/auth/reset-password/")
def reset_password(datos: schemas.ResetPasswordRequest, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == datos.id, models.Usuario.borrado == False).first()
    if not usuario:
        raise HTTPException(404, "Usuario no encontrado")
    setattr(usuario, "password", hash_password(USER_KEY))
    setattr(usuario, "intentos", 0)
    setattr(usuario, "bloqueado", None)
    db.commit()
    return {"message": "Contraseña reseteada a clave temporal"}

@app.post("/auth/login/")
def login(datos: schemas.LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.email == datos.email, models.Usuario.borrado == False).first()
    if not usuario: raise HTTPException(401, "Usuario o contraseña incorrectos")
    bloqueado = cast(datetime | None, usuario.bloqueado)
    if bloqueado and bloqueado > datetime.utcnow():
        raise HTTPException(403, f"Bloqueada {int((bloqueado - datetime.utcnow()).total_seconds()/60)} min")
    if verify_password(USER_KEY, str(usuario.password)):
        return {"cambiar_password": True, "email": usuario.email}
    if not verify_password(datos.password, str(usuario.password)):
        intentos = cast(int, usuario.intentos) + 1
        if intentos >= 3:
            setattr(usuario, "bloqueado", datetime.utcnow() + timedelta(minutes=15)); setattr(usuario, "intentos", 0); db.commit()
            raise HTTPException(403, "Cuenta bloqueada por 15 minutos")
        setattr(usuario, "intentos", intentos); db.commit()
        raise HTTPException(401, f"Incorrectos. Intento {intentos}/3")
    setattr(usuario, "intentos", 0); setattr(usuario, "bloqueado", None); db.commit()
    token = create_access_token({"sub": usuario.email, "user_id": usuario.id})
    return {"cambiar_password": False, "access_token": token, "token_type": "bearer", "usuario": {"id": usuario.id, "nombre": usuario.nombre, "email": usuario.email, "items": traer_items(cast(int, usuario.perfil_id), db)}}

@app.get("/auth/fecha/")
def fecha(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    vence = db.query(models.Usuario.vencimiento).filter(models.Usuario.borrado == False).order_by(models.Usuario.id.asc()).first()
    if vence is None:
        raise HTTPException(404, "No se encontró la fecha de vencimiento")
    return [{"vencimiento": vence.vencimiento}]

@app.put("/auth/habilitar/")
def habilitar(datos: schemas.LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.email == datos.email, models.Usuario.borrado == False).first()
    if not usuario: raise HTTPException(401, "Usuario o contraseña incorrectos")
    bloqueado = cast(datetime | None, usuario.bloqueado)
    if bloqueado and bloqueado > datetime.utcnow():
        raise HTTPException(403, f"Bloqueada {int((bloqueado - datetime.utcnow()).total_seconds()/60)} min")
    if verify_password(USER_KEY, str(usuario.password)):
        return {"cambiar_password": True, "email": usuario.email, "message": "Debe cambiar su contraseña"}
    if not verify_password(datos.password, str(usuario.password)):
        intentos = cast(int, usuario.intentos) + 1
        if intentos >= 3:
            setattr(usuario, "bloqueado", datetime.utcnow() + timedelta(minutes=15)); setattr(usuario, "intentos", 0); db.commit()
            raise HTTPException(403, "Cuenta bloqueada por 15 minutos")
        setattr(usuario, "intentos", intentos); db.commit()
        raise HTTPException(401, f"Incorrectos. Intento {intentos}/3")
    setattr(usuario, "intentos", 0); setattr(usuario, "bloqueado", None); setattr(usuario, "vencimiento", datos.vencimiento); db.commit()
    token = create_access_token({"sub": usuario.email, "user_id": usuario.id})
    return {"vencimiento_actualizado": True, "access_token": token, "token_type": "bearer"}

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
    message = MessageSchema(subject=registro.asunto, recipients=cast(list, [registro.email_destino]), body=html_content, subtype=MessageType.html)
    fm = FastMail(conf)
    background_tasks.add_task(fm.send_message, message)
    return {"message": f"Aviso para Luis de {registro.nombre} en cola para {registro.email_destino}"}

# ==== ENDPOINTS GENERICOS ====

# 1. LISTAS
@app.get("/{tabla}/")
def listar_tabla(tabla: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return CRUDBase(get_model(tabla)).get_all(db)

@app.get("/{tabla}/relaciones/")
def listar_relaciones(tabla: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return CRUDBase(get_model(tabla)).get_all_relaciones(db)

# 2. POR CAMPO
@app.get("/{tabla}/{campo}/{item}/campo/relaciones/")
def obtener_por_campo_y_id_relaciones(tabla: str, campo: str, item, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return CRUDBase(get_model(tabla)).get_by_campo_y_id_relaciones(db, campo, item)

@app.get("/{tabla}/{campo}/{item}/campo/")
def obtener_por_campo_y_id(tabla: str, campo: str, item, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return CRUDBase(get_model(tabla)).get_by_campo_y_id(db, campo, item)

# 3. COMPUESTAS con relaciones (4 segmentos)
@app.get("/{tabla}/{pk1}/{pk2}/relaciones/")
def obtener_compuesto_rel(tabla: str, pk1: int, pk2: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if tabla not in ["selector_configuracion", "item_perfil"]:
        raise HTTPException(404, "Esta ruta es solo para tablas con PK compuesta")
    return CRUDBase(get_model(tabla)).get_by_composite(db, pk1, pk2, True)

# 4. SIMPLE con relaciones (3 segmentos)
@app.get("/{tabla}/{item_id}/relaciones/")
def obtener_por_id_relaciones(tabla: str, item_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return CRUDBase(get_model(tabla)).get_by_id_relaciones(db, item_id)

# 5. COMPUESTAS sin relaciones (3 segmentos)
@app.get("/{tabla}/{pk1}/{pk2}/")
def obtener_compuesto(tabla: str, pk1: int, pk2: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if tabla not in ["selector_configuracion", "item_perfil"]:
        raise HTTPException(404, "Esta ruta es solo para tablas con PK compuesta")
    return CRUDBase(get_model(tabla)).get_by_composite(db, pk1, pk2, False)

# 6. SIMPLE sin relaciones (2 segmentos)
@app.get("/{tabla}/{item_id}/")
def obtener_por_id(tabla: str, item_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return CRUDBase(get_model(tabla)).get_by_id(db, item_id)

# --- ABM ---
@app.post("/{tabla}/")
def crear(tabla: str, registro: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return CRUDBase(get_model(tabla)).create(db, get_schema(tabla)(**registro))

@app.put("/{tabla}/{pk1}/{pk2}/")
def actualizar_compuesto(tabla: str, pk1: int, pk2: int, registro: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if tabla not in ["selector_configuracion", "item_perfil"]:
        raise HTTPException(404, "Esta ruta es solo para tablas con PK compuesta")
    return CRUDBase(get_model(tabla)).update_composite(db, pk1, pk2, get_schema(tabla)(**registro))

@app.put("/{tabla}/{item_id}/")
def actualizar(tabla: str, item_id: int, registro: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return CRUDBase(get_model(tabla)).update(db, item_id, get_schema(tabla)(**registro))

@app.delete("/{tabla}/{pk1}/{pk2}/fisico/")
def borrar_compuesto_fisico(tabla: str, pk1: int, pk2: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if tabla not in ["selector_configuracion", "item_perfil"]:
        raise HTTPException(404, "Esta ruta es solo para tablas con PK compuesta")
    return CRUDBase(get_model(tabla)).delete_composite(db, pk1, pk2)

@app.delete("/{tabla}/{item_id}/fisico/")
def borrar_fisico(tabla: str, item_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return CRUDBase(get_model(tabla)).delete(db, item_id)

@app.delete("/{tabla}/{pk1}/{pk2}/")
def borrar_compuesto(tabla: str, pk1: int, pk2: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if tabla not in ["selector_configuracion", "item_perfil"]:
        raise HTTPException(404, "Esta ruta es solo para tablas con PK compuesta")
    return CRUDBase(get_model(tabla)).logical_delete_composite(db, pk1, pk2)

@app.delete("/{tabla}/{item_id}/")
def borrar(tabla: str, item_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return CRUDBase(get_model(tabla)).logical_delete(db, item_id)
