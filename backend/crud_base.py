from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload, with_loader_criteria
from sqlalchemy import inspect

# ==== MAPEO CENTRAL DE RELACIONES ====
# Acá definís que relaciones traer cuando te piden "con relaciones"
RELACIONES_POR_TABLA = {
    "canal": ["metodo"],
    "usuario": ["perfil"],
    "configuracion": ["frecuencia", "bias", "funcion", "usuario"],
    "pin_gpio": ["selector"],
    "medicion": ["canal", "configuracion"],
    "selector_configuracion": ["selector", "configuracion"],
    "item_perfil": ["item", "perfil"],
}

class CRUDBase:
    def __init__(self, model):
        self.model = model

    # --- LÓGICA INTERNA PRIVADA ---
    def _get_options_relaciones(self):
        options = []
        relaciones = RELACIONES_POR_TABLA.get(self.model.__tablename__, [])
        if not relaciones:
            return []  # Tabla sin relaciones -> sin options
        mapper = inspect(self.model)
        for rel_name in relaciones:
            if rel_name not in mapper.relationships:
                continue
            rel_prop = mapper.relationships[rel_name]
            related_model = rel_prop.mapper.class_
            options.append(joinedload(getattr(self.model, rel_name)))
            if hasattr(related_model, 'borrado'):
                options.append(
                    with_loader_criteria(
                        related_model,
                        related_model.borrado == False,  # sin lambda, directo
                        include_aliases=True
                    )
                )
        return options

    def _base_query(self, db: Session, con_relaciones: bool = False):
        query = db.query(self.model).filter(self.model.borrado == False)
        if con_relaciones:
            options = self._get_options_relaciones()
            if options:
                query = query.options(*options)
        return query

    def _validar_campo(self, campo: str):
        if not hasattr(self.model, campo):
            raise HTTPException(status_code=400, detail=f"El campo '{campo}' no existe en {self.model.__tablename__}")

    # --- MÉTODOS PÚBLICOS SIN RELACIONES (livianos) ---
    def get_all(self, db: Session):
        return self._base_query(db, False).all()

    def get_by_id(self, db: Session, id: int):
        obj = self._base_query(db, False).filter(self.model.id == id).first()
        if not obj: raise HTTPException(status_code=404, detail="No encontrado")
        return obj

    def get_by_campo_y_id(self, db: Session, campo: str, item):
        self._validar_campo(campo)
        obj = self._base_query(db, False).filter(getattr(self.model, campo) == item).all()
        if not obj: raise HTTPException(status_code=404, detail="No encontrado")
        return obj
   
    # --- MÉTODOS PÚBLICOS CON RELACIONES (pesados, completos) ---
    def get_all_relaciones(self, db: Session):
        return self._base_query(db, True).all()

    def get_by_id_relaciones(self, db: Session, id: int):
        obj = self._base_query(db, True).filter(self.model.id == id).first()
        if not obj: raise HTTPException(status_code=404, detail="No encontrado")
        return obj

    def get_by_campo_y_id_relaciones(self, db: Session, campo: str, item):
        self._validar_campo(campo)
        obj = self._base_query(db, True).filter(getattr(self.model, campo) == item).all()
        if not obj: raise HTTPException(status_code=404, detail="No encontrado")
        return obj

    # --- ABM ---
    def create(self, db: Session, obj_in):
        try:
            nuevo = self.model(**obj_in.model_dump(exclude_unset=True))
            db.add(nuevo); db.commit(); db.refresh(nuevo)
            return nuevo
        except IntegrityError as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"No fue posible guardar: {str(e.orig)}")

    def update(self, db: Session, id: int, obj_in):
        try:
            obj = self.get_by_id(db, id)
            for k, v in obj_in.model_dump(exclude_unset=True).items(): setattr(obj, k, v)
            db.commit(); db.refresh(obj)
            return obj
        except IntegrityError as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"No fue posible guardar: {str(e.orig)}")

    def logical_delete(self, db: Session, id: int):
        obj = self.get_by_id(db, id)
        obj.borrado = True; db.commit()
        return {"message": "Eliminado lógico"}

    def delete(self, db: Session, id: int):
        obj = self.get_by_id(db, id)
        db.delete(obj); db.commit()
        return {"message": "Eliminado físico"}