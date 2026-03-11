from typing import List, Optional
from datetime import datetime, timezone
import uuid
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.account import AccountCreate, AccountUpdate, AccountResponse

class AccountService:
    @staticmethod
    async def create_account(db: AsyncIOMotorDatabase, account_data: AccountCreate) -> dict:
        collection = db["accounts"]
        
        # Check if the code for the company already exists
        existing = await collection.find_one({
            "company_id": account_data.company_id,
            "code": account_data.code
        })
        if existing:
            raise HTTPException(status_code=400, detail="Account code already exists for this company.")
            
        account_dict = account_data.model_dump()
        account_dict["_id"] = f"acct_{uuid.uuid4().hex[:12]}"
        account_dict["is_active"] = True
        account_dict["created_at"] = datetime.now(timezone.utc)
        
        # Insert into MongoDB
        await collection.insert_one(account_dict)
        return account_dict

    @staticmethod
    async def get_accounts(db: AsyncIOMotorDatabase, company_id: str, account_type: Optional[str] = None) -> List[dict]:
        collection = db["accounts"]
        query = {"company_id": company_id}
        if account_type:
            query["type"] = account_type
            
        cursor = collection.find(query)
        accounts = await cursor.to_list(length=1000)
        return accounts

    @staticmethod
    async def get_account(db: AsyncIOMotorDatabase, account_id: str) -> dict:
        collection = db["accounts"]
        account = await collection.find_one({"_id": account_id})
        if not account:
            raise HTTPException(status_code=404, detail="Account not found.")
        return account

    @staticmethod
    async def update_account(db: AsyncIOMotorDatabase, account_id: str, update_data: AccountUpdate) -> dict:
        collection = db["accounts"]
        # Only update provided fields
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        if not update_dict:
            return await AccountService.get_account(db, account_id)
            
        result = await collection.update_one(
            {"_id": account_id},
            {"$set": update_dict}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Account not found.")
            
        return await AccountService.get_account(db, account_id)

    @staticmethod
    async def delete_account(db: AsyncIOMotorDatabase, account_id: str) -> bool:
        collection = db["accounts"]
        
        # In MVP, soft-delete or checking journal logic goes here.
        # For now, we perform a hard delete or check if it exists:
        result = await collection.delete_one({"_id": account_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Account not found.")
        return True
