from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import uuid
import os
from pymongo import MongoClient
from bson import ObjectId
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="OKR Tracking API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URL)
db = client.okr_tracker

# Collections
objectives_collection = db.objectives
key_results_collection = db.key_results
initiatives_collection = db.initiatives

# Pydantic models
class Initiative(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = ""
    owner: Optional[str] = ""
    status: str = "not_started"  # not_started, in_progress, completed
    key_result_id: Optional[str] = None  # Will be set by the API
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class KeyResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = ""
    type: str = "metric"  # metric or binary
    start_value: Optional[float] = 0
    target_value: Optional[float] = 100
    current_value: Optional[float] = 0
    unit: Optional[str] = ""
    owner: Optional[str] = ""
    objective_id: Optional[str] = None  # Will be set by the API
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class Objective(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = ""
    owner: Optional[str] = ""
    deadline: Optional[date] = None
    status: str = "active"  # active, completed, paused
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class UpdateProgress(BaseModel):
    current_value: float

# Helper functions
def calculate_kr_progress(kr: Dict) -> float:
    """Calculate progress percentage for a key result"""
    if kr['type'] == 'binary':
        return 100.0 if kr['current_value'] >= kr['target_value'] else 0.0
    
    if kr['type'] == 'metric':
        if kr['target_value'] == kr['start_value']:
            return 100.0 if kr['current_value'] >= kr['target_value'] else 0.0
        
        progress = ((kr['current_value'] - kr['start_value']) / 
                   (kr['target_value'] - kr['start_value'])) * 100
        return max(0, min(100, progress))
    
    return 0.0

def calculate_objective_progress(objective_id: str) -> float:
    """Calculate progress percentage for an objective based on its key results"""
    key_results = list(key_results_collection.find({"objective_id": objective_id}))
    if not key_results:
        return 0.0
    
    total_progress = sum(calculate_kr_progress(kr) for kr in key_results)
    return total_progress / len(key_results)

# API Routes

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

# Objectives endpoints
@app.get("/api/objectives")
async def get_objectives():
    objectives = list(objectives_collection.find())
    for obj in objectives:
        obj['_id'] = str(obj['_id'])
        obj['progress'] = calculate_objective_progress(obj['id'])
    return objectives

@app.post("/api/objectives")
async def create_objective(objective: Objective):
    obj_dict = objective.dict()
    # Handle date serialization
    if obj_dict.get('deadline'):
        if isinstance(obj_dict['deadline'], str):
            try:
                # Parse string date to datetime object
                obj_dict['deadline'] = datetime.fromisoformat(obj_dict['deadline']).date().isoformat()
            except ValueError:
                # If already a proper date string, keep it
                pass
        elif hasattr(obj_dict['deadline'], 'isoformat'):
            obj_dict['deadline'] = obj_dict['deadline'].isoformat()
    
    result = objectives_collection.insert_one(obj_dict)
    obj_dict['_id'] = str(result.inserted_id)
    obj_dict['progress'] = 0.0
    return obj_dict

@app.get("/api/objectives/{objective_id}")
async def get_objective(objective_id: str):
    objective = objectives_collection.find_one({"id": objective_id})
    if not objective:
        raise HTTPException(status_code=404, detail="Objective not found")
    
    objective['_id'] = str(objective['_id'])
    objective['progress'] = calculate_objective_progress(objective_id)
    
    # Get key results for this objective
    key_results = list(key_results_collection.find({"objective_id": objective_id}))
    for kr in key_results:
        kr['_id'] = str(kr['_id'])
        kr['progress'] = calculate_kr_progress(kr)
        
        # Get initiatives for each key result
        initiatives = list(initiatives_collection.find({"key_result_id": kr['id']}))
        for init in initiatives:
            init['_id'] = str(init['_id'])
        kr['initiatives'] = initiatives
    
    objective['key_results'] = key_results
    return objective

@app.put("/api/objectives/{objective_id}")
async def update_objective(objective_id: str, objective: Objective):
    obj_dict = objective.dict()
    obj_dict['updated_at'] = datetime.now()
    # Handle date serialization
    if obj_dict.get('deadline'):
        if isinstance(obj_dict['deadline'], str):
            try:
                # Parse string date to datetime object
                obj_dict['deadline'] = datetime.fromisoformat(obj_dict['deadline']).date().isoformat()
            except ValueError:
                # If already a proper date string, keep it
                pass
        elif hasattr(obj_dict['deadline'], 'isoformat'):
            obj_dict['deadline'] = obj_dict['deadline'].isoformat()
    
    result = objectives_collection.update_one(
        {"id": objective_id}, 
        {"$set": obj_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Objective not found")
    
    return await get_objective(objective_id)

@app.delete("/api/objectives/{objective_id}")
async def delete_objective(objective_id: str):
    # Delete all related key results and initiatives
    key_results = list(key_results_collection.find({"objective_id": objective_id}))
    for kr in key_results:
        initiatives_collection.delete_many({"key_result_id": kr['id']})
    key_results_collection.delete_many({"objective_id": objective_id})
    
    result = objectives_collection.delete_one({"id": objective_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Objective not found")
    
    return {"message": "Objective deleted successfully"}

# Key Results endpoints
@app.post("/api/objectives/{objective_id}/key-results")
async def create_key_result(objective_id: str, key_result: KeyResult):
    # Verify objective exists
    objective = objectives_collection.find_one({"id": objective_id})
    if not objective:
        raise HTTPException(status_code=404, detail="Objective not found")
    
    kr_dict = key_result.dict()
    kr_dict['objective_id'] = objective_id
    
    result = key_results_collection.insert_one(kr_dict)
    kr_dict['_id'] = str(result.inserted_id)
    kr_dict['progress'] = calculate_kr_progress(kr_dict)
    kr_dict['initiatives'] = []
    return kr_dict

@app.put("/api/key-results/{key_result_id}")
async def update_key_result(key_result_id: str, key_result: KeyResult):
    kr_dict = key_result.dict()
    kr_dict['updated_at'] = datetime.now()
    
    result = key_results_collection.update_one(
        {"id": key_result_id}, 
        {"$set": kr_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Key result not found")
    
    updated_kr = key_results_collection.find_one({"id": key_result_id})
    updated_kr['_id'] = str(updated_kr['_id'])
    updated_kr['progress'] = calculate_kr_progress(updated_kr)
    return updated_kr

@app.put("/api/key-results/{key_result_id}/progress")
async def update_key_result_progress(key_result_id: str, progress_update: UpdateProgress):
    result = key_results_collection.update_one(
        {"id": key_result_id},
        {
            "$set": {
                "current_value": progress_update.current_value,
                "updated_at": datetime.now()
            }
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Key result not found")
    
    updated_kr = key_results_collection.find_one({"id": key_result_id})
    updated_kr['_id'] = str(updated_kr['_id'])
    updated_kr['progress'] = calculate_kr_progress(updated_kr)
    return updated_kr

@app.delete("/api/key-results/{key_result_id}")
async def delete_key_result(key_result_id: str):
    # Delete all related initiatives
    initiatives_collection.delete_many({"key_result_id": key_result_id})
    
    result = key_results_collection.delete_one({"id": key_result_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Key result not found")
    
    return {"message": "Key result deleted successfully"}

# Initiatives endpoints
@app.post("/api/key-results/{key_result_id}/initiatives")
async def create_initiative(key_result_id: str, initiative: Initiative):
    # Verify key result exists
    key_result = key_results_collection.find_one({"id": key_result_id})
    if not key_result:
        raise HTTPException(status_code=404, detail="Key result not found")
    
    init_dict = initiative.dict()
    init_dict['key_result_id'] = key_result_id
    
    result = initiatives_collection.insert_one(init_dict)
    init_dict['_id'] = str(result.inserted_id)
    return init_dict

@app.put("/api/initiatives/{initiative_id}")
async def update_initiative(initiative_id: str, initiative: Initiative):
    # First check if the initiative exists
    existing_init = initiatives_collection.find_one({"id": initiative_id})
    if not existing_init:
        raise HTTPException(status_code=404, detail="Initiative not found")
    
    init_dict = initiative.dict()
    init_dict['updated_at'] = datetime.now()
    # Ensure we preserve the original id
    init_dict['id'] = initiative_id
    
    result = initiatives_collection.update_one(
        {"id": initiative_id}, 
        {"$set": init_dict}
    )
    
    updated_init = initiatives_collection.find_one({"id": initiative_id})
    if not updated_init:
        raise HTTPException(status_code=500, detail="Failed to retrieve updated initiative")
    
    updated_init['_id'] = str(updated_init['_id'])
    return updated_init

@app.delete("/api/initiatives/{initiative_id}")
async def delete_initiative(initiative_id: str):
    result = initiatives_collection.delete_one({"id": initiative_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Initiative not found")
    
    return {"message": "Initiative deleted successfully"}

# Dashboard endpoint
@app.get("/api/dashboard")
async def get_dashboard():
    objectives = list(objectives_collection.find())
    dashboard_data = []
    
    for obj in objectives:
        obj['_id'] = str(obj['_id'])
        obj['progress'] = calculate_objective_progress(obj['id'])
        
        # Get key results count
        kr_count = key_results_collection.count_documents({"objective_id": obj['id']})
        obj['key_results_count'] = kr_count
        
        dashboard_data.append(obj)
    
    return {
        "objectives": dashboard_data,
        "total_objectives": len(dashboard_data),
        "avg_progress": sum(obj['progress'] for obj in dashboard_data) / len(dashboard_data) if dashboard_data else 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)