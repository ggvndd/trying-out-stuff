from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core.database import get_database
from app.models.bill import BillCreate, BillResponse
from app.services.bill_service import BillService

router = APIRouter(
    tags=["Accounts Payable"]
)

@router.post("/", response_model=BillResponse, status_code=201)
async def create_bill(
    bill_in: BillCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create a new draft vendor bill.
    """
    created_bill = await BillService.create_bill(db, bill_in)
    created_bill["id"] = str(created_bill.pop("_id"))
    for item in created_bill.get("items", []):
        if "_id" in item: item["id"] = str(item.pop("_id"))
    return created_bill

@router.get("/", response_model=List[BillResponse])
async def list_bills(company_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Get all bills for a company.
    """
    bills = await BillService.get_bills(db, company_id)
    for i in bills:
        i["id"] = str(i.pop("_id"))
        for item in i.get("items", []):
            if "_id" in item: item["id"] = str(item.pop("_id"))
    return bills

@router.get("/{bill_id}", response_model=BillResponse)
async def get_bill(bill_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Get a specific bill by ID.
    """
    bill = await BillService.get_bill(db, bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
        
    bill["id"] = str(bill.pop("_id"))
    for item in bill.get("items", []):
        if "_id" in item: item["id"] = str(item.pop("_id"))
    return bill

@router.post("/{bill_id}/approve", response_model=BillResponse)
async def approve_bill(bill_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Approve a draft bill, generating an AP journal entry.
    """
    bill = await BillService.approve_bill(db, bill_id)
    bill["id"] = str(bill.pop("_id"))
    for item in bill.get("items", []):
        if "_id" in item: item["id"] = str(item.pop("_id"))
    return bill

@router.post("/{bill_id}/cancel", response_model=BillResponse)
async def cancel_bill(bill_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Cancel an approved bill, reversing its AP journal entry.
    """
    bill = await BillService.cancel_bill(db, bill_id)
    bill["id"] = str(bill.pop("_id"))
    for item in bill.get("items", []):
        if "_id" in item: item["id"] = str(item.pop("_id"))
    return bill
