from typing import List, Optional
from datetime import datetime, timezone
import uuid
from decimal import Decimal
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.invoice import InvoiceCreate, InvoiceResponse
from app.models.journal import JournalCreate, JournalLineCreate
from app.services.journal_service import JournalService
from app.services.account_service import AccountService
from app.models.account import AccountCreate

class InvoiceService:
    @staticmethod
    async def create_invoice(db: AsyncIOMotorDatabase, invoice_data: InvoiceCreate) -> dict:
        collection = db["invoices"]
        
        # Calculate totals
        subtotal = Decimal("0.0")
        for item in invoice_data.items:
            item.amount = item.quantity * item.unit_price
            subtotal += item.amount
            
        vat_amount = subtotal * Decimal("0.11") # 11% PPN
        total = subtotal + vat_amount
        
        invoice_id = f"inv_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)
        
        invoice_dict = invoice_data.model_dump(exclude={"items"})
        invoice_dict["_id"] = invoice_id
        invoice_dict["subtotal"] = float(subtotal)
        invoice_dict["vat_amount"] = float(vat_amount)
        invoice_dict["total"] = float(total)
        invoice_dict["status"] = "draft"
        invoice_dict["created_at"] = now
        
        db_items = []
        for item in invoice_data.items:
            item_dict = item.model_dump()
            item_dict["id"] = f"invitem_{uuid.uuid4().hex[:12]}"
            item_dict["quantity"] = float(item_dict["quantity"])
            item_dict["unit_price"] = float(item_dict["unit_price"])
            item_dict["amount"] = float(item_dict["amount"])
            db_items.append(item_dict)
            
        invoice_dict["items"] = db_items
        
        await collection.insert_one(invoice_dict)
        return invoice_dict

    @staticmethod
    async def get_invoices(db: AsyncIOMotorDatabase, company_id: str) -> List[dict]:
        invoices = await db["invoices"].find({"company_id": company_id}).sort("created_at", -1).to_list(100)
        return invoices

    @staticmethod
    async def get_invoice(db: AsyncIOMotorDatabase, invoice_id: str) -> dict:
        invoice = await db["invoices"].find_one({"_id": invoice_id})
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        return invoice

    @staticmethod
    async def _get_or_create_account(db: AsyncIOMotorDatabase, company_id: str, code: str, name: str, type_: str) -> str:
        account = await db["accounts"].find_one({"company_id": company_id, "code": code})
        if account:
            return account["_id"]
            
        acct = await AccountService.create_account(db, AccountCreate(
            company_id=company_id,
            code=code,
            name=name,
            type=type_
        ))
        return acct["_id"]

    @staticmethod
    async def issue_invoice(db: AsyncIOMotorDatabase, invoice_id: str) -> dict:
        invoice = await InvoiceService.get_invoice(db, invoice_id)
        if invoice["status"] != "draft":
            raise HTTPException(status_code=400, detail="Only draft invoices can be issued")
            
        company_id = invoice["company_id"]
        
        # Get or create necessary accounts for the MVP
        ar_account_id = await InvoiceService._get_or_create_account(db, company_id, "1100", "Accounts Receivable", "asset")
        rev_account_id = await InvoiceService._get_or_create_account(db, company_id, "4100", "Sales Revenue", "revenue")
        vat_account_id = await InvoiceService._get_or_create_account(db, company_id, "2100", "VAT Payable", "liability")
        
        total = Decimal(str(invoice["total"]))
        subtotal = Decimal(str(invoice["subtotal"]))
        vat_amount = Decimal(str(invoice["vat_amount"]))
        
        # Create Journal lines
        lines = [
            # Debit AR
            JournalLineCreate(account_id=ar_account_id, debit=total, credit=Decimal("0.0"), description=f"Invoice {invoice_id}"),
            # Credit Revenue
            JournalLineCreate(account_id=rev_account_id, debit=Decimal("0.0"), credit=subtotal, description=f"Revenue {invoice_id}"),
            # Credit VAT
            JournalLineCreate(account_id=vat_account_id, debit=Decimal("0.0"), credit=vat_amount, description=f"VAT {invoice_id}")
        ]
        
        journal_data = JournalCreate(
            company_id=company_id,
            reference_type="invoice",
            reference_id=invoice_id,
            currency=invoice["currency"],
            lines=lines
        )
        
        # Create and Auto-post journal
        journal = await JournalService.create_journal(db, journal_data, auto_post=True)
        journal_id = journal["_id"]
        
        # Update invoice
        await db["invoices"].update_one(
            {"_id": invoice_id},
            {"$set": {"status": "issued", "journal_id": journal_id}}
        )
        
        return await InvoiceService.get_invoice(db, invoice_id)

    @staticmethod
    async def cancel_invoice(db: AsyncIOMotorDatabase, invoice_id: str) -> dict:
        invoice = await InvoiceService.get_invoice(db, invoice_id)
        if invoice["status"] != "issued":
            raise HTTPException(status_code=400, detail="Only issued invoices can be cancelled")
            
        if invoice.get("journal_id"):
            # Reverse the associated journal
            await JournalService.reverse_journal(db, invoice["journal_id"])
            
        await db["invoices"].update_one(
            {"_id": invoice_id},
            {"$set": {"status": "cancelled"}}
        )
        
        return await InvoiceService.get_invoice(db, invoice_id)
