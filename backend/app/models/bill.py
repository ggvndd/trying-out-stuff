from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class BillItemBase(BaseModel):
    description: str
    quantity: float
    unit_price: float
    amount: float

class BillItemCreate(BillItemBase):
    pass

class BillItemResponse(BillItemBase):
    id: str

class BillBase(BaseModel):
    company_id: str
    vendor_id: str
    date: datetime = Field(default_factory=datetime.utcnow)
    due_date: Optional[datetime] = None
    currency: str = "IDR"
    status: str = "draft"  # draft, approved, paid, cancelled
    subtotal: float = 0
    vat_amount: float = 0
    total: float = 0
    linked_journal_id: Optional[str] = None
    notes: Optional[str] = None

class BillCreate(BillBase):
    items: List[BillItemCreate]

class BillResponse(BillBase):
    id: str
    items: List[BillItemResponse]
    created_at: datetime
    updated_at: datetime
