from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class Metodo(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   id: Optional[int] = None
   nombre: str
   borrado: bool | None = False

class Frecuencia(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   id: Optional[int] = None
   nombre: str
   tipo: int
   borrado: bool | None = False

class Bias(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   id: Optional[int] = None
   valor: float
   borrado: bool | None = False

class Funcion(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   id: Optional[int] = None
   nombre: str
   descripcion: str
   borrado: bool | None = False

class Selector(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   id: Optional[int] = None
   nombre: str
   borrado: bool | None = False

class Item(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   id: Optional[int] = None
   nombre: str
   borrado: bool | None = False

class Perfil(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   id: Optional[int] = None
   nombre: str
   borrado: bool | None = False

class Canal(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   id: Optional[int] = None
   metodo_id: int  # clave foránea
   nombre: str
   inyeccion1: int
   inyeccion2: int
   medicion1: int
   medicion2: int
   habilitado: bool | None = True
   borrado: bool | None = False
   metodo: Optional[Metodo] = None  # relación

# -------------------------------------
class UsuarioBase(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   perfil_id: int  # clave foránea
   nombre: str
   email: EmailStr
   telefono: str
   borrado: bool | None = False
   # foto: Optional[str] = None
# class UsuarioCreate(UsuarioBase):
#    password: str | None = None
class UsuarioResponse(UsuarioBase):
   id: Optional[int] = None
   perfil: Optional[Perfil] = None  # relación
class LoginRequest(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   email: EmailStr
   password: str
   vencimiento: Optional[datetime] = None
class ResetPasswordRequest(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   id: int
class Usuario(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   id: Optional[int] = None
   perfil_id: int  # clave foránea
   nombre: str
   email: EmailStr
   # password: str
   telefono: str
   intentos: int
   bloqueado: datetime | None = None
   borrado: bool | None = False
   perfil: Optional[Perfil] = None  # relación
   # foto: Optional[str] = None
   # fechacreacion: datetime | None = None
   # fechamodificacion: datetime | None = None
# -------------------------------------

class Configuracion(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   id: Optional[int] = None
   frecuencia_id: int  # clave foránea
   bias_id: int  # clave foránea
   funcion_id: int  # clave foránea
   usuario_id: int  # clave foránea
   frecuencia_inicial: int
   frecuencia_cantidad: int
   frecuencia_final: int
   voltaje: float
   borrado: bool | None = False
   frecuencia: Optional[Frecuencia] = None  # relación
   bias: Optional[Bias] = None  # relación
   funcion: Optional[Funcion] = None  # relación
   usuario: Optional[UsuarioResponse] = None # no Usuario

class Pin_Gpio(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   id: Optional[int] = None
   selector_id: int  # clave foránea
   pin_ms: int
   pin_rb: int
   gpio_rb: int
   borrado: bool | None = False
   selector: Optional[Selector] = None  # relación

class Medicion(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   id: Optional[int] = None
   canal_id: int  # clave foránea
   configuracion_id: int  # clave foránea
   valor: float
   complemento: float
   estado: float
   rango: float
   frecuencia: int
   fecha_creacion: Optional[datetime] = None
   fecha_modificacion: Optional[datetime] = None
   borrado: bool | None = False
   canal: Optional[Canal] = None  # relación
   configuracion: Optional[Configuracion] = None  # relación

class Selector_Configuracion(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   selector_id: int  # clave foránea
   configuracion_id: int  # clave foránea
   borrado: bool | None = False
   selector: Optional[Selector] = None  # relación
   configuracion: Optional[Configuracion] = None  # relación

class Item_Perfil(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   item_id: int  # clave foránea
   perfil_id: int  # clave foránea
   nivel: int
   borrado: bool | None = False
   item: Optional[Item] = None  # relación
   perfil: Optional[Perfil] = None  # relación

# === Modelo para el Envío de Correo ===
class Aviso(BaseModel):
   model_config = ConfigDict(from_attributes=True)
   asunto: str
   email_destino: EmailStr  # La dirección de correo a la que se enviará el aviso
   # Quien se contacta
   nombre: str
   mensaje: str
