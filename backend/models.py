from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Float, Numeric, DateTime
from database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class Perfil(Base):
   __tablename__ = "perfil"

   id = Column(Integer, primary_key=True, index=True)
   nombre = Column(String)
   fechacreacion = Column(DateTime, default=func.now(), nullable=False)
   fechamodificacion = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
   borrado = Column(Boolean, default=False)
class Sector(Base):
   __tablename__ = "sector"

   id = Column(Integer, primary_key=True, index=True)
   nombre = Column(String)
   fechacreacion = Column(DateTime, default=func.now(), nullable=False)
   fechamodificacion = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
   borrado = Column(Boolean, default=False)
class Perfilxsector(Base):
   __tablename__ = "perfilxsector"

   id = Column(Integer, primary_key=True, index=True)
   perfilid = Column(Integer, ForeignKey("perfil.id"))  # clave foránea
   sectorid = Column(Integer, ForeignKey("sector.id"))  # clave foránea
   nivel = Column(Integer)
   fechacreacion = Column(DateTime, default=func.now(), nullable=False)
   fechamodificacion = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
   borrado = Column(Boolean, default=False)

   perfil = relationship("Perfil")  # relación
   sector = relationship("Sector")  # relación
class Usuario(Base):
   __tablename__ = "usuario"

   id = Column(Integer, primary_key=True, index=True)
   perfilid = Column(Integer, ForeignKey("perfil.id"))  # clave foránea
   nombre = Column(String)
   email = Column(String, unique=True, index=True)
   password = Column(String, nullable=False)
   telefono = Column(String)
   foto = Column(String)
   intentos = Column(Integer, default=0)
   bloqueado = Column(DateTime, nullable=True)
   fechacreacion = Column(DateTime, default=func.now(), nullable=False)
   fechamodificacion = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
   borrado = Column(Boolean, default=False)

   perfil = relationship("Perfil")  # relación
