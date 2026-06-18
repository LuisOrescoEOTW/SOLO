from fastapi import HTTPException, status
from sqlalchemy.orm import Session

class CRUDBase:
   def __init__(self, model):
       self.model = model

   def get_all(self, db: Session):
       return db.query(self.model).filter(self.model.borrado == False).all()

   def get_by_id(self, db: Session, id: int):
       obj = db.query(self.model).filter(self.model.id == id, self.model.borrado == False).first()
       if not obj:
           raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado o eliminado")
       return obj

   def create(self, db: Session, obj_in):
       nuevo = self.model(**obj_in.dict(exclude_unset=True))
       db.add(nuevo)
       db.commit()
       db.refresh(nuevo)
       return nuevo
  
   def update(self, db: Session, id: int, obj_in):
       obj = self.get_by_id(db, id)
       for key, value in obj_in.dict(exclude_unset=True).items():
           setattr(obj, key, value)
       db.commit()
       db.refresh(obj)
       return obj

   def logical_delete(self, db: Session, id: int):
       obj = self.get_by_id(db, id)
       obj.borrado = True
       db.commit()
       return {"message": "Eliminado lógico"}

   def delete(self, db: Session, id: int):
       obj = self.get_by_id(db, id)
       db.delete(obj)
       db.commit()
       return {"message": "Eliminado físico"}