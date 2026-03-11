from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.models.account import AccountCreate, AccountUpdate, AccountResponse
from app.services.account_service import AccountService

router = APIRouter()

@router.post("/", response_model=AccountResponse, status_code=201)
async def create_account(
    account_in: AccountCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create a new account in the Chart of Accounts.
    """
    return await AccountService.create_account(db, account_in)


@router.get("/", response_model=List[AccountResponse])
async def get_accounts(
    company_id: str = Query(..., description="Filter accounts by company_id"),
    account_type: Optional[str] = Query(None, description="Filter by account type (e.g., asset, revenue)"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Retrieve a list of accounts for a specific company.
    """
    return await AccountService.get_accounts(db, company_id, account_type)


@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(
    account_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Retrieve a specific account by its ID.
    """
    return await AccountService.get_account(db, account_id)


@router.put("/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: str,
    account_in: AccountUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update an existing account's mutable fields.
    """
    return await AccountService.update_account(db, account_id, account_in)


@router.delete("/{account_id}", status_code=204)
async def delete_account(
    account_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Delete an account.
    """
    await AccountService.delete_account(db, account_id)
