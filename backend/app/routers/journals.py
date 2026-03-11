from fastapi import APIRouter, Depends
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.models.journal import JournalCreate, JournalResponse
from app.services.journal_service import JournalService

router = APIRouter()

@router.post("/", response_model=JournalResponse, status_code=201)
async def create_journal(
    journal_in: JournalCreate,
    auto_post: bool = False,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create a new manual journal entry. Fails if sum(debits) != sum(credits).
    """
    created_journal = await JournalService.create_journal(db, journal_in, auto_post)
    created_journal["id"] = created_journal.pop("_id")
    for line in created_journal.get("lines", []):
        if "_id" in line: line["id"] = line.pop("_id")
    return created_journal

@router.get("/", response_model=List[JournalResponse])
async def list_journals(company_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Get all journals for a company (headers only for performance).
    """
    journals = await JournalService.get_journals(db, company_id)
    for j in journals:
        j["id"] = j.pop("_id")
    return journals

@router.get("/{journal_id}", response_model=JournalResponse)
async def get_journal(journal_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Get a specific journal and its lines.
    """
    journal = await JournalService.get_journal(db, journal_id)
    journal["id"] = journal.pop("_id")
    for line in journal.get("lines", []):
        if "_id" in line: line["id"] = line.pop("_id")
    return journal

@router.post("/{journal_id}/post", response_model=JournalResponse)
async def post_journal(journal_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Transition a draft journal strictly to 'posted'.
    """
    journal = await JournalService.post_journal(db, journal_id)
    journal["id"] = journal.pop("_id")
    for line in journal.get("lines", []):
        if "_id" in line: line["id"] = line.pop("_id")
    return journal

@router.post("/{journal_id}/reverse", response_model=JournalResponse)
async def reverse_journal(journal_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Creates a new journal flipping debits and credits of a posted journal, marking original as reversed.
    """
    journal = await JournalService.reverse_journal(db, journal_id)
    journal["id"] = journal.pop("_id")
    for line in journal.get("lines", []):
        if "_id" in line: line["id"] = line.pop("_id")
    return journal
