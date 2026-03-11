from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

class InvoiceItemBase(BaseModel):
    description: str
    quantity: Decimal = Field(default=Decimal("1.0"), gt=0)
    unit_price: Decimal = Field(default=Decimal("0.0"), ge=0)
    amount: Decimal = Field(default=Decimal("0.0"), ge=0)

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItemResponse(InvoiceItemBase):
    id: str

class InvoiceBase(BaseModel):
    company_id: str
    customer_id: str
    currency: str = "IDR"
    status: str = Field(default="draft", description="'draft', 'issued', 'cancelled'")
    subtotal: Decimal = Field(default=Decimal("0.0"), ge=0)
    vat_amount: Decimal = Field(default=Decimal("0.0"), ge=0)
    total: Decimal = Field(default=Decimal("0.0"), ge=0)
    journal_id: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate]

class InvoiceResponse(InvoiceBase):
    id: str
    created_at: datetime
    items: List[InvoiceItemResponse] = []
