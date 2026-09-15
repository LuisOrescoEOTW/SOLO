from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload, with_loader_criteria
from sqlalchemy import inspect

RELACIONES_POR_TABLA = {
    "canal": ["metodo"],
    "usuario": ["perfil"],
    "configuracion": ["frecuencia", "bias", "funcion", "usuario"],
    "pin_gpio": ["selector"],
    "medicion": ["canal", "configuracion"],
    "selector_configuracion": ["selector", "configuracion"],
    "item_perfil": ["item", "perfil"],
}

# Tablas con PK compuesta
PK_COMPUESTA = {
    "selector_configuracion": ["selector_id", "configuracion_id"],
    "item_perfil": ["item_id", "perfil_id"]
}

class CRUDBase:
    def __init__(self, model):
        self.model = model

    def _get_pk_columns(self):
        # Devuelve lista de columnas PK: ["id"] o ["selector_id","configuracion_id"]
        tablename = self.model.__tablename__
        if tablename in PK_COMPUESTA:
            return PK_COMPUESTA[tablename]
        return ["id"]

    def _es_compuesta(self):
        return self.model.__tablename__ in PK_COMPUESTA

    def _filtro_pk(self, pk1, pk2=None):
        cols = self._get_pk_columns()
        if len(cols) == 1:
            return getattr(self.model, cols[0]) == pk1
        else:
            # compuesta
            if pk2 is None:
                raise HTTPException(400, f"La tabla {self.model.__tablename__} necesita 2 ids: /{cols[0]}/{cols[1]}/")
            return (getattr(self.model, cols[0]) == pk1) & (getattr(self.model, cols[1]) == pk2)

    def _get_options_relaciones(self):
        options = []
        relaciones = RELACIONES_POR_TABLA.get(self.model.__tablename__, [])
        if not relaciones: return []
        mapper = inspect(self.model)
        for rel_name in relaciones:
            if rel_name not in mapper.relationships: continue
            rel_prop = mapper.relationships[rel_name]
            related_model = rel_prop.mapper.class_
            options.append(joinedload(getattr(self.model, rel_name)))
            if hasattr(related_model, 'borrado'):
                options.append(with_loader_criteria(related_model, related_model.borrado == False, include_aliases=True))
        return options

    def _base_query(self, db: Session, con_relaciones: bool = False):
        query = db.query(self.model).filter(self.model.borrado == False)
        if con_relaciones:
            opts = self._get_options_relaciones()
            if opts: query = query.options(*opts)
        return query

    def _validar_campo(self, campo: str):
        if not hasattr(self.model, campo):
            raise HTTPException(400, f"El campo '{campo}' no existe en {self.model.__tablename__}")

    # --- GET ---
    def get_all(self, db: Session):
        return self._base_query(db, False).all()

    def get_all_relaciones(self, db: Session):
        return self._base_query(db, True).all()

    def get_by_id(self, db: Session, id: int):
        if self._es_compuesta():
            raise HTTPException(400, f"Usá /{self.model.__tablename__}/{{id1}}/{{id2}}/ para PK compuesta")
        obj = self._base_query(db, False).filter(self.model.id == id).first()
        if not obj: raise HTTPException(404, "No encontrado")
        return obj

    def get_by_id_relaciones(self, db: Session, id: int):
        if self._es_compuesta():
            raise HTTPException(400, f"Usá /{self.model.__tablename__}/{{id1}}/{{id2}}/relaciones/")
        obj = self._base_query(db, True).filter(self.model.id == id).first()
        if not obj: raise HTTPException(404, "No encontrado")
        return obj

    def get_by_composite(self, db: Session, pk1, pk2, con_relaciones=False):
        obj = self._base_query(db, con_relaciones).filter(self._filtro_pk(pk1, pk2)).first()
        if not obj: raise HTTPException(404, "No encontrado")
        return obj

    def get_by_campo_y_id(self, db: Session, campo: str, item):
        self._validar_campo(campo)
        return self._base_query(db, False).filter(getattr(self.model, campo) == item).all()

    def get_by_campo_y_id_relaciones(self, db: Session, campo: str, item):
        self._validar_campo(campo)
        return self._base_query(db, True).filter(getattr(self.model, campo) == item).all()

    # --- ABM ---
    def create(self, db: Session, obj_in):
        try:
            nuevo = self.model(**obj_in.model_dump(exclude_unset=True))
            db.add(nuevo); db.commit(); db.refresh(nuevo)
            return nuevo
        except IntegrityError as e:
            db.rollback()
            raise HTTPException(400, f"No fue posible guardar: {str(e.orig)}")

    def update(self, db: Session, id: int, obj_in):
        if self._es_compuesta(): raise HTTPException(400, "Usá update compuesto")
        obj = self.get_by_id(db, id)
        try:
            for k, v in obj_in.model_dump(exclude_unset=True).items(): setattr(obj, k, v)
            db.commit(); db.refresh(obj)
            return obj
        except IntegrityError as e:
            db.rollback()
            raise HTTPException(400, f"No fue posible guardar: {str(e.orig)}")

    def update_composite(self, db: Session, pk1, pk2, obj_in):
        obj = self.get_by_composite(db, pk1, pk2)
        try:
            for k, v in obj_in.model_dump(exclude_unset=True).items(): setattr(obj, k, v)
            db.commit(); db.refresh(obj)
            return obj
        except IntegrityError as e:
            db.rollback()
            raise HTTPException(400, f"No fue posible guardar: {str(e.orig)}")

    def logical_delete(self, db: Session, id: int):
        obj = self.get_by_id(db, id)
        obj.borrado = True; db.commit()
        return {"message": "Eliminado lógico"}

    def logical_delete_composite(self, db: Session, pk1, pk2):
        obj = self.get_by_composite(db, pk1, pk2)
        obj.borrado = True; db.commit()
        return {"message": "Eliminado lógico"}

    def delete(self, db: Session, id: int):
        obj = self.get_by_id(db, id)
        db.delete(obj); db.commit()
        return {"message": "Eliminado físico"}

    def delete_composite(self, db: Session, pk1, pk2):
        obj = self.get_by_composite(db, pk1, pk2)
        db.delete(obj); db.commit()
        return {"message": "Eliminado físico"}