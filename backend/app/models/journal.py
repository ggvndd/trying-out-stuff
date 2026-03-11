from pydantic import BaseModel, Field, condecimal
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

class JournalLineBase(BaseModel):
    account_id: str
    debit: Decimal = Field(default=Decimal("0.0"), ge=0)
    credit: Decimal = Field(default=Decimal("0.0"), ge=0)
    description: Optional[str] = None

class JournalLineCreate(JournalLineBase):
    pass

class JournalLineResponse(JournalLineBase):
    id: str
    company_id: str
    journal_id: str
    created_at: datetime

class JournalBase(BaseModel):
    company_id: str
    reference_type: str = Field(description="e.g., 'invoice', 'manual', 'bill'")
    reference_id: Optional[str] = None
    currency: str = "IDR"
    status: str = Field(default="draft", description="'draft', 'posted', 'reversed'")

class JournalCreate(JournalBase):
    lines: List[JournalLineCreate]

    class Config:
        json_schema_extra = {
            "example": {
                "company_id": "company_01",
                "reference_type": "manual",
                "currency": "IDR",
                "lines": [
                    {"account_id": "acct_expense", "debit": 1000, "credit": 0},
                    {"account_id": "acct_cash", "debit": 0, "credit": 1000}
                ]
            }
        }

class JournalResponse(JournalBase):
    id: str
    created_at: datetime
    posted_at: Optional[datetime] = None
    created_by: str = "system"
    lines: List[JournalLineResponse] = []
