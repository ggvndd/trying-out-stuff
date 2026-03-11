from fastapi import APIRouter, Depends, HTTPException
from typing import List

from app.models.invoice import InvoiceCreate, InvoiceResponse
from app.services.invoice_service import InvoiceService
from app.core.database import get_database

router = APIRouter(
    tags=["Accounts Receivable"]
)

@router.post("/", response_model=dict, status_code=201)
async def create_invoice(invoice: InvoiceCreate, db=Depends(get_database)):
    try:
        """Create a new draft invoice."""
        created_invoice = await InvoiceService.create_invoice(db, invoice)
        created_invoice["id"] = created_invoice.pop("_id")
        for item in created_invoice["items"]:
            if "_id" in item:
                item["id"] = item.pop("_id")
        return created_invoice
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[dict])
async def get_invoices(company_id: str, db=Depends(get_database)):
    """List all invoices for a company."""
    invoices = await InvoiceService.get_invoices(db, company_id)
    for invoice in invoices:
        invoice["id"] = invoice.pop("_id")
        for item in invoice.get("items", []):
            if "_id" in item:
                 item["id"] = item.pop("_id")
    return invoices

@router.get("/{invoice_id}", response_model=dict)
async def get_invoice(invoice_id: str, db=Depends(get_database)):
    """Get a specific invoice by ID."""
    invoice = await InvoiceService.get_invoice(db, invoice_id)
    invoice["id"] = invoice.pop("_id")
    for item in invoice.get("items", []):
        if "_id" in item:
             item["id"] = item.pop("_id")
    return invoice

@router.post("/{invoice_id}/issue", response_model=dict)
async def issue_invoice(invoice_id: str, db=Depends(get_database)):
    """Issue a draft invoice, generating the financial journal entry."""
    invoice = await InvoiceService.issue_invoice(db, invoice_id)
    invoice["id"] = invoice.pop("_id")
    for item in invoice.get("items", []):
         if "_id" in item:
             item["id"] = item.pop("_id")
    return invoice

@router.post("/{invoice_id}/cancel", response_model=dict)
async def cancel_invoice(invoice_id: str, db=Depends(get_database)):
    """Cancel an issued invoice, reversing the financial journal entry."""
    invoice = await InvoiceService.cancel_invoice(db, invoice_id)
    invoice["id"] = invoice.pop("_id")
    for item in invoice.get("items", []):
        if "_id" in item:
             item["id"] = item.pop("_id")
    return invoice
