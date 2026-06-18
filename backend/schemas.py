from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class Perfil(BaseModel):
   id: Optional[int] = None
   nombre: str
   fechacreacion: datetime | None = None
   fechamodificacion: datetime | None = None
   borrado: bool | None = False
   class Config:
       from_attributes = True  # Linux
class Sector(BaseModel):
   id: Optional[int] = None
   nombre: str
   fechacreacion: datetime | None = None
   fechamodificacion: datetime | None = None
   borrado: bool | None = False
   class Config:
       from_attributes = True  # Linux
class Perfilxsector(BaseModel):
   id: Optional[int] = None
   perfilid: int  # clave foránea
   sectorid: int  # clave foránea
   nivel: int
   fechacreacion: datetime | None = None
   fechamodificacion: datetime | None = None
   borrado: bool | None = False
   perfil: Optional[Perfil] = None  # relación
   sector: Optional[Sector] = None  # relación
   class Config:
       from_attributes = True  # Linux
class UsuarioBase(BaseModel):
   perfilid: int  # clave foránea
   nombre: str
   email: EmailStr
   telefono: str
   foto: Optional[str] = None
   borrado: bool | None = False
   class Config:
       from_attributes = True  # Linux
class UsuarioCreate(UsuarioBase):
    # password: str
    password: str | None = None
class UsuarioResponse(UsuarioBase):
    id: Optional[int] = None
    fechacreacion: datetime | None = None
    fechamodificacion: datetime | None = None
    perfil: Optional[Perfil] = None  # relación
    class Config:
        from_attributes = True
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
class ResetPasswordRequest(BaseModel):
    id: int
class Usuario(BaseModel):
   id: Optional[int] = None
   perfilid: int  # clave foránea
   nombre: str
   email: EmailStr
   password: str
   telefono: str
   foto: Optional[str] = None
   intentos: int
   bloqueado: datetime | None = None
   fechacreacion: datetime | None = None
   fechamodificacion: datetime | None = None
   borrado: bool | None = False
   perfil: Optional[Perfil] = None  # relación
   class Config:
       from_attributes = True  # Linux


# === Modelo para el Envío de Correo ===
class Aviso(BaseModel):
    asunto: str
    email_destino: EmailStr  # La dirección de correo a la que se enviará el aviso
    # Quien se contacta
    nombre: str
    mensaje: str
    class Config:
        from_attributes = True  # Linux
