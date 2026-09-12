from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os
# Cargar variables desde el archivo .env
load_dotenv()
# Leer la URL de la base de datos desde el entorno
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
   raise RuntimeError("DATABASE_URL no está definida en el entorno")
# PostgreSQL
engine = create_engine( DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()