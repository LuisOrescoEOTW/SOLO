from sqlalchemy import BigInteger, Boolean, Column, Integer, String, ForeignKey, Float, Numeric, DateTime, UniqueConstraint, Index
from database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class Metodo(Base):
   __tablename__ = "metodo"
   __table_args__ = {"schema": "public"}

   id = Column(Integer, primary_key=True, index=True)
   nombre = Column(String, unique=True, nullable=False)
   borrado = Column(Boolean, nullable=False, server_default="false", default=False)

class Frecuencia(Base):
   __tablename__ = "frecuencia"
   __table_args__ = {"schema": "public"}

   id = Column(Integer, primary_key=True, index=True)
   nombre = Column(String, unique=True, nullable=False)
   tipo = Column(Integer, nullable=False)  
   borrado = Column(Boolean, nullable=False, server_default="false", default=False)

class Bias(Base):
   __tablename__ = "bias"
   __table_args__ = {"schema": "public"}

   id = Column(Integer, primary_key=True, index=True)
   valor = Column(Numeric(3,2), unique=True, nullable=False)
   borrado = Column(Boolean, nullable=False, server_default="false", default=False)

class Funcion(Base):
   __tablename__ = "funcion"
   __table_args__ = {"schema": "public"}

   id = Column(Integer, primary_key=True, index=True)
   nombre = Column(String, unique=True, nullable=False)
   descripcion = Column(String, nullable=False)
   borrado = Column(Boolean, nullable=False, server_default="false", default=False)

class Selector(Base):
   __tablename__ = "selector"
   __table_args__ = {"schema": "public"}

   id = Column(Integer, primary_key=True, index=True)
   nombre = Column(String, unique=True, nullable=False)
   borrado = Column(Boolean, nullable=False, server_default="false", default=False)

class Item(Base):
   __tablename__ = "item"
   __table_args__ = {"schema": "public"}

   id = Column(Integer, primary_key=True, index=True)
   nombre = Column(String, unique=True, nullable=False)
   borrado = Column(Boolean, nullable=False, server_default="false", default=False)

class Perfil(Base):
   __tablename__ = "perfil"
   __table_args__ = {"schema": "public"}

   id = Column(Integer, primary_key=True, index=True)
   nombre = Column(String, unique=True, nullable=False)
   borrado = Column(Boolean, nullable=False, server_default="false", default=False)


class Canal(Base):
   __tablename__ = "canal"
   __table_args__ = {"schema": "public"}

   id = Column(Integer, primary_key=True, index=True)
   metodo_id = Column(Integer, ForeignKey("public.metodo.id", ondelete="RESTRICT"), nullable=False)  # clave foránea
   nombre = Column(String, nullable=False)
   inyeccion1 = Column(Integer, nullable=False)
   inyeccion2 = Column(Integer, nullable=False)
   medicion1 = Column(Integer, nullable=False)
   medicion2 = Column(Integer, nullable=False)
   habilitado = Column(Boolean, nullable=False, server_default="true", default=True)
   borrado = Column(Boolean, nullable=False, server_default="false", default=False)

   metodo = relationship("Metodo")  # relación

class Usuario(Base):
   __tablename__ = "usuario"
   __table_args__ = {"schema": "public"}

   id = Column(Integer, primary_key=True, index=True)
   perfil_id = Column(Integer, ForeignKey("public.perfil.id", ondelete="RESTRICT"), nullable=False)  # clave foránea
   nombre = Column(String, unique=True, nullable=False)
   password = Column(String, nullable=False)
   email = Column(String, unique=True, nullable=False)
   telefono = Column(String, unique=True, nullable=False)
   intentos = Column(Integer, nullable=False, server_default="0", default=0)
   bloqueado = Column(DateTime(timezone=True), nullable=True)
   vencimiento = Column(DateTime(timezone=True), nullable=True)
   borrado = Column(Boolean, nullable=False, server_default="false", default=False)

   perfil = relationship("Perfil")  # relación

class Configuracion(Base):
   __tablename__ = "configuracion"
   __table_args__ = {"schema": "public"}

   id = Column(Integer, primary_key=True, index=True)
   frecuencia_id = Column(Integer, ForeignKey("public.frecuencia.id", ondelete="RESTRICT"), nullable=False)  # clave foránea
   bias_id = Column(Integer, ForeignKey("public.bias.id", ondelete="RESTRICT"), nullable=False)  # clave foránea
   funcion_id = Column(Integer, ForeignKey("public.funcion.id", ondelete="RESTRICT"), nullable=False)  # clave foránea
   usuario_id = Column(Integer, ForeignKey("public.usuario.id", ondelete="RESTRICT"), nullable=False)  # clave foránea
   frecuencia_inicial = Column(Integer, nullable=False)
   frecuencia_cantidad = Column(Integer, nullable=False)
   frecuencia_final = Column(Integer, nullable=False)
   voltaje = Column(Numeric(10,4), nullable=False)
   borrado = Column(Boolean, nullable=False, server_default="false", default=False)

   frecuencia = relationship("Frecuencia")  # relación
   bias = relationship("Bias")  # relación
   funcion = relationship("Funcion")  # relación
   usuario = relationship("Usuario")  # relación

class Pin_Gpio(Base):
   __tablename__ = "pin_gpio"
   __table_args__ = (
    UniqueConstraint("selector_id", "pin_ms", "pin_rb", "gpio_rb", name="selector_pin_gpio_unique"),
    {"schema": "public"})

   id = Column(Integer, primary_key=True, index=True)
   selector_id = Column(Integer, ForeignKey("public.selector.id", ondelete="RESTRICT"), nullable=False)  # clave foránea
   pin_ms = Column(Integer, nullable=False)
   pin_rb = Column(Integer, nullable=False)
   gpio_rb = Column(Integer, nullable=False)
   borrado = Column(Boolean, nullable=False, server_default="false", default=False)

   selector = relationship("Selector")  # relación

class Medicion(Base):
   __tablename__ = "medicion"
   __table_args__ = (
      Index("idx_medicion_canal_fecha", "canal_id", "fecha_creacion"),
      Index("idx_medicion_configuracion", "configuracion_id"),
      {"schema": "public"}
   )

   id = Column(BigInteger, primary_key=True, index=True)
   canal_id = Column(Integer, ForeignKey("public.canal.id", ondelete="RESTRICT"), nullable=False)  # clave foránea
   configuracion_id = Column(Integer, ForeignKey("public.configuracion.id", ondelete="RESTRICT"), nullable=False)  # clave foránea
   valor = Column(Float, nullable=False)
   complemento = Column(Float, nullable=False)
   estado = Column(Float, nullable=False)
   rango = Column(Float, nullable=False)
   frecuencia = Column(Integer, nullable=False)
   fecha_creacion = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
   fecha_modificacion = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
   borrado = Column(Boolean, nullable=False, server_default="false", default=False)

   canal = relationship("Canal")  # relación
   configuracion = relationship("Configuracion")  # relación

class Selector_Configuracion(Base):
   __tablename__ = "selector_configuracion"
   __table_args__ = {"schema": "public"}

   selector_id = Column(Integer, ForeignKey("public.selector.id", ondelete="CASCADE"), primary_key=True)
   configuracion_id = Column(Integer, ForeignKey("public.configuracion.id", ondelete="CASCADE"), primary_key=True)
   borrado = Column(Boolean, nullable=False, server_default="false", default=False)

   selector = relationship("Selector")  # relación
   configuracion = relationship("Configuracion")  # relación

class Item_Perfil(Base):
   __tablename__ = "item_perfil"
   __table_args__ = {"schema": "public"}

   item_id = Column(Integer, ForeignKey("public.item.id", ondelete="CASCADE"), primary_key=True)
   perfil_id = Column(Integer, ForeignKey("public.perfil.id", ondelete="CASCADE"), primary_key=True)
   nivel = Column(Integer, nullable=False)
   borrado = Column(Boolean, nullable=False, server_default="false", default=False)

   perfil = relationship("Perfil")  # relación
   item = relationship("Item")  # relación