from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.bill import BillCreate
from app.services.journal_service import JournalService
from app.services.account_service import AccountService
from app.models.account import AccountCreate
from app.models.journal import JournalCreate, JournalLineCreate

class BillService:
    COLLECTION = "bills"

    @staticmethod
    async def get_bills(db: AsyncIOMotorDatabase, company_id: str) -> List[dict]:
        cursor = db[BillService.COLLECTION].find({"company_id": company_id}).sort("created_at", -1)
        return await cursor.to_list(length=100)

    @staticmethod
    async def get_bill(db: AsyncIOMotorDatabase, bill_id: str) -> Optional[dict]:
        return await db[BillService.COLLECTION].find_one({"_id": ObjectId(bill_id)})

    @staticmethod
    async def create_bill(db: AsyncIOMotorDatabase, bill_in: BillCreate) -> dict:
        # Calculate totals
        subtotal = sum(item.quantity * item.unit_price for item in bill_in.items)
        vat_amount = subtotal * 0.11 # 11% PPN In
        total = subtotal + vat_amount

        # Build document
        now = datetime.utcnow()
        doc = bill_in.model_dump()
        doc["subtotal"] = subtotal
        doc["vat_amount"] = vat_amount
        doc["total"] = total
        doc["status"] = "draft"
        doc["created_at"] = now
        doc["updated_at"] = now

        for item in doc["items"]:
            item["_id"] = str(ObjectId())
            item["amount"] = item["quantity"] * item["unit_price"]

        result = await db[BillService.COLLECTION].insert_one(doc)
        return await db[BillService.COLLECTION].find_one({"_id": result.inserted_id})

    @staticmethod
    async def _get_or_create_system_account(db: AsyncIOMotorDatabase, company_id: str, name: str, type_: str, normal_balance: str) -> str:
        # Utility to fetch or create standard accounts for AP flow
        code_prefix_map = {
            "Accounts Payable": "21", # Liability
            "Operating Expense": "61", # Expense
            "VAT In": "12" # Asset
        }
        
        account = await db["accounts"].find_one({"company_id": company_id, "name": name})
        if account:
            return str(account["_id"])
            
        # Need to create it iteratively finding a free code
        prefix = code_prefix_map.get(name, "99")
        
        # Super simple counter for code generation in demo
        existing = await db["accounts"].count_documents({"code": {"$regex": f"^{prefix}"}})
        code = f"{prefix}{(existing + 1):03d}"
        
        payload = AccountCreate(
            company_id=company_id,
            code=code,
            name=name,
            type=type_.lower()
        )
        acc = await AccountService.create_account(db, payload)
        return str(acc["_id"])

    @staticmethod
    async def approve_bill(db: AsyncIOMotorDatabase, bill_id: str) -> dict:
        bill = await BillService.get_bill(db, bill_id)
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")
            
        if bill["status"] != "draft":
            raise HTTPException(status_code=400, detail="Only draft bills can be approved")

        company_id = bill["company_id"]
        
        # 1. Prepare Accounting: AP (Credit), Expense (Debit), VAT In (Debit)
        ap_id = await BillService._get_or_create_system_account(
            db, company_id, "Accounts Payable", "Liability", "credit"
        )
        expense_id = await BillService._get_or_create_system_account(
            db, company_id, "Operating Expense", "Expense", "debit"
        )
        vat_in_id = await BillService._get_or_create_system_account(
            db, company_id, "VAT In", "Asset", "debit"
        )
        
        # 2. Construct Journal
        journal_payload = JournalCreate(
            company_id=company_id,
            date=datetime.utcnow(),
            description=f"Auto-generated AP for Bill to {bill['vendor_id']}",
            reference=str(bill["_id"]),
            lines=[
                # Credit AP Total
                JournalLineCreate(account_id=ap_id, description="Accounts Payable", debit=0, credit=bill["total"]),
                # Debit Expense Subtotal
                JournalLineCreate(account_id=expense_id, description="Bill Expense", debit=bill["subtotal"], credit=0),
                # Debit VAT In Tax Amount
                JournalLineCreate(account_id=vat_in_id, description="PPN Masukan (VAT In)", debit=bill["vat_amount"], credit=0)
            ]
        )
        
        # 3. Post Journal
        created_journal = await JournalService.create_journal(db, journal_payload, auto_post=True)
        
        # 4. Update Bill
        await db[BillService.COLLECTION].update_one(
            {"_id": ObjectId(bill_id)},
            {"$set": {
                "status": "approved",
                "linked_journal_id": str(created_journal["_id"]),
                "updated_at": datetime.utcnow()
            }}
        )
        
        return await BillService.get_bill(db, bill_id)

    @staticmethod
    async def cancel_bill(db: AsyncIOMotorDatabase, bill_id: str) -> dict:
        bill = await BillService.get_bill(db, bill_id)
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")
            
        if bill["status"] != "approved":
            raise HTTPException(status_code=400, detail="Only approved bills can be cancelled")
            
        # Reverse Journal
        if bill.get("linked_journal_id"):
            await JournalService.reverse_journal(db, bill["linked_journal_id"])
            
        # Update Bill Status
        await db[BillService.COLLECTION].update_one(
            {"_id": ObjectId(bill_id)},
            {"$set": {
                "status": "cancelled",
                "updated_at": datetime.utcnow()
            }}
        )
        
        return await BillService.get_bill(db, bill_id)
