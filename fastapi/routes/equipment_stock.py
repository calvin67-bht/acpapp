from datetime import datetime 
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import database

router = APIRouter(tags=["equipment_stock"])

class EquipmentStockCreate(BaseModel):
  equipment_name: str
  quantity: int
  location: str = None

class EquipmentStockOut(BaseModel):
  equipment_id: int
  equipment_name: str
  quantity: int
  location: str = None
  updated_at: datetime

# Create
@router.post("/equipment_stock/", response_model=EquipmentStockOut)
async def create_equipment(equipment: EquipmentStockCreate):
  query = """
    INSERT INTO equipment_stock (equipment_name, quantity, location)
    VALUES (:equipment_name, :quantity, :location)
    RETURNING equipment_id, equipment_name, quantity, location, updated_at
  """
  result = await database.fetch_one(query, equipment.dict())
  return result

# Read (List)
@router.get("/equipment_stock/", response_model=list[EquipmentStockOut])
async def list_equipment():
  query = "SELECT * FROM equipment_stock ORDER BY equipment_id"
  return await database.fetch_all(query)

# Update
@router.put("/equipment_stock/{equipment_id}", response_model=EquipmentStockOut)
async def update_equipment(equipment_id: int, equipment: EquipmentStockCreate):
  query = """
    UPDATE equipment_stock SET equipment_name=:equipment_name, quantity=:quantity, location=:location, updated_at=NOW()
    WHERE equipment_id=:equipment_id
    RETURNING equipment_id, equipment_name, quantity, location, updated_at
  """
  values = {**equipment.dict(), "equipment_id": equipment_id}
  result = await database.fetch_one(query, values)
  if not result:
    raise HTTPException(status_code=404, detail="Equipment not found")
  return result

# Delete
@router.delete("/equipment_stock/{equipment_id}")
async def delete_equipment(equipment_id: int):
  query = "DELETE FROM equipment_stock WHERE equipment_id=:equipment_id"
  await database.execute(query, {"equipment_id": equipment_id})
  return {"message": f"Equipment {equipment_id} deleted"}
