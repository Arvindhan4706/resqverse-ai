from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("/")
def list_resources(
    status: Optional[str] = None,
    resource_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(models.Resource)
    if status:
        q = q.filter(models.Resource.status == status)
    if resource_type:
        q = q.filter(models.Resource.resource_type == resource_type)
    return q.all()


@router.get("/{resource_id}")
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    r = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    return r


@router.patch("/{resource_id}")
def update_resource(resource_id: int, data: dict, db: Session = Depends(get_db)):
    r = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    for key, value in data.items():
        setattr(r, key, value)
    db.commit()
    db.refresh(r)
    return r
