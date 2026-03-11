from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AccountBase(BaseModel):
    code: str = Field(..., description="Accounting code (e.g., '1100')")
    name: str = Field(..., description="Account name (e.g., 'Accounts Receivable')")
    type: str = Field(..., description="Account type: asset, liability, equity, revenue, expense")
    currency: str = Field("IDR", description="Currency code")
    parent_account_id: Optional[str] = Field(None, description="ID of the parent account if hierarchical")

class AccountCreate(AccountBase):
    company_id: str = Field(..., description="Company ID this account belongs to")

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None

class AccountResponse(AccountBase):
    id: str = Field(alias="_id")
    company_id: str
    is_active: bool
    created_at: datetime
    
    class Config:
        populate_by_name = True
