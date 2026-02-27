import os
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

app = FastAPI(title="BreedGrade API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "boerboel_eval")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]


class EvaluationCreate(BaseModel):
    dog_name: str
    registration_number: Optional[str] = ""
    owner_name: str
    age_months: int
    gender: str
    scores: dict
    notes: Optional[str] = ""
    total_score: int
    percentage: int


def serialize_eval(doc):
    doc["id"] = str(doc.pop("_id"))
    return doc


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/evaluations/stats")
async def get_stats():
    total = await db.evaluations.count_documents({})
    if total == 0:
        return {"total": 0, "avgScore": 0}
    pipeline = [{"$group": {"_id": None, "avg": {"$avg": "$percentage"}}}]
    result = await db.evaluations.aggregate(pipeline).to_list(1)
    avg = round(result[0]["avg"]) if result else 0
    return {"total": total, "avgScore": avg}


@app.post("/api/evaluations")
async def create_evaluation(data: EvaluationCreate):
    doc = data.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.evaluations.insert_one(doc)
    return {"id": str(result.inserted_id)}


@app.get("/api/evaluations")
async def list_evaluations():
    cursor = db.evaluations.find().sort("created_at", -1).limit(50)
    results = await cursor.to_list(50)
    return [serialize_eval(doc) for doc in results]


@app.get("/api/evaluations/{eval_id}")
async def get_evaluation(eval_id: str):
    try:
        doc = await db.evaluations.find_one({"_id": ObjectId(eval_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid evaluation ID")
    if not doc:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return serialize_eval(doc)
