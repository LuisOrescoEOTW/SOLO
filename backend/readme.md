# OrescoBaseApi
Api página

# Ejecutar:
    source venv/bin/activate
    uvicorn main:app --reload
# Crear archivo requirements: pip freeze > requirements.txt
# Instalar las dependencias: pip install -r requirements.txt
# En navegador: doc de FastAPI: http://localhost:8000/docs

# Puerto 3000

Agregar una tabla:
* schemas.py
* modelos.py
* main.py: agregarlo solo en TABLAS y tiene todo lo generic

Manejo automático de fechas de creación y modificiación, borrado lógico y físico