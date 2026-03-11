from typing import List, Optional
from datetime import datetime, timezone
import uuid
from decimal import Decimal
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.journal import JournalCreate, JournalResponse

class JournalService:
    @staticmethod
    async def create_journal(db: AsyncIOMotorDatabase, journal_data: JournalCreate, auto_post: bool = False) -> dict:
        total_debit = sum(line.debit for line in journal_data.lines)
        total_credit = sum(line.credit for line in journal_data.lines)
        
        # Double-entry constraint
        if total_debit != total_credit:
            raise HTTPException(status_code=400, detail=f"Journal is unbalanced. Debit ({total_debit}) != Credit ({total_credit})")
            
        journals_collection = db["journals"]
        lines_collection = db["journal_lines"]
        
        journal_id = f"journal_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)
        
        # Build Journal document
        journal_dict = journal_data.model_dump(exclude={"lines"})
        journal_dict["_id"] = journal_id
        journal_dict["created_at"] = now
        journal_dict["created_by"] = "system" # Mock user
        journal_dict["status"] = "posted" if auto_post else "draft"
        if auto_post:
            journal_dict["posted_at"] = now
            
        # Build Line documents
        db_lines = []
        for line in journal_data.lines:
            line_dict = line.model_dump()
            line_dict["_id"] = f"jline_{uuid.uuid4().hex[:16]}"
            line_dict["journal_id"] = journal_id
            line_dict["company_id"] = journal_data.company_id
            line_dict["created_at"] = now
            
            # MongoDB doesn't natively support Decimal. Convert to float for MVP.
            line_dict["debit"] = float(line_dict["debit"])
            line_dict["credit"] = float(line_dict["credit"])
            db_lines.append(line_dict)
            
        # Perform insert (Ideally in a transaction session if targeting ReplicaSet)
        await journals_collection.insert_one(journal_dict)
        if db_lines:
            await lines_collection.insert_many(db_lines)
            
        journal_dict["lines"] = db_lines
        return journal_dict

    @staticmethod
    async def get_journals(db: AsyncIOMotorDatabase, company_id: str) -> List[dict]:
        journals = await db["journals"].find({"company_id": company_id}).sort("created_at", -1).to_list(100)
        return journals

    @staticmethod
    async def get_journal(db: AsyncIOMotorDatabase, journal_id: str) -> dict:
        journal = await db["journals"].find_one({"_id": journal_id})
        if not journal:
            raise HTTPException(status_code=404, detail="Journal not found")
            
        lines = await db["journal_lines"].find({"journal_id": journal_id}).to_list(100)
        journal["lines"] = lines
        return journal

    @staticmethod
    async def post_journal(db: AsyncIOMotorDatabase, journal_id: str) -> dict:
        journal = await db["journals"].find_one({"_id": journal_id})
        if not journal:
            raise HTTPException(status_code=404, detail="Journal not found")
        if journal["status"] == "posted":
            raise HTTPException(status_code=400, detail="Journal is already posted")
            
        await db["journals"].update_one(
            {"_id": journal_id},
            {"$set": {"status": "posted", "posted_at": datetime.now(timezone.utc)}}
        )
        return await JournalService.get_journal(db, journal_id)

    @staticmethod
    async def reverse_journal(db: AsyncIOMotorDatabase, journal_id: str) -> dict:
        journal = await JournalService.get_journal(db, journal_id)
        if journal["status"] != "posted":
            raise HTTPException(status_code=400, detail="Only posted journals can be reversed")
            
        # Create reversal data
        new_lines = []
        from app.models.journal import JournalLineCreate
        for line in journal["lines"]:
            # Flip debit and credit
            new_lines.append(JournalLineCreate(
                account_id=line["account_id"],
                debit=Decimal(str(line["credit"])),
                credit=Decimal(str(line["debit"])),
                description=f"Reversal of {journal_id} - {line.get('description', '')}"
            ))
            
        reversal_data = JournalCreate(
            company_id=journal["company_id"],
            reference_type="reversal",
            reference_id=journal_id,
            currency=journal["currency"],
            lines=new_lines
        )
        
        # Create and auto-post the reversal
        reversal = await JournalService.create_journal(db, reversal_data, auto_post=True)
        
        # Mark original as reversed
        await db["journals"].update_one({"_id": journal_id}, {"$set": {"status": "reversed"}})
        
        return reversal
