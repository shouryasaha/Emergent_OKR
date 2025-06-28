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
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage

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
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
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

class GenerateOKRRequest(BaseModel):
    context: str
    company_size: Optional[str] = "SMB"
    industry: Optional[str] = ""
    time_period: Optional[str] = "quarterly"
    
class GeneratedOKR(BaseModel):
    title: str
    description: str
    owner: str
    key_results: List[Dict[str, Any]]

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

# AI-powered OKR generation
async def generate_okrs_with_ai(context: str, company_size: str = "SMB", industry: str = "", time_period: str = "quarterly") -> List[GeneratedOKR]:
    """Generate OKRs using Gemini AI based on user context"""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    system_message = """You are an expert business consultant specializing in creating OKRs (Objectives and Key Results). 

Your task is to generate structured, measurable, and actionable OKRs based on user input about their business goals and context.

IMPORTANT GUIDELINES:
1. Generate 2-4 well-structured objectives
2. Each objective should have 2-4 key results
3. Key results must be specific, measurable, achievable, relevant, and time-bound
4. Use proper metrics (percentages, numbers, dollars, etc.)
5. Ensure objectives are ambitious but realistic
6. Consider the company size and industry context
7. Make sure key results directly contribute to achieving the objective

FORMAT YOUR RESPONSE AS A VALID JSON ARRAY:
[
  {
    "title": "Objective Title",
    "description": "Detailed description of what this objective aims to achieve",
    "owner": "Suggested owner/department",
    "key_results": [
      {
        "title": "Key Result 1",
        "description": "What this key result measures",
        "type": "metric",
        "start_value": 0,
        "target_value": 100,
        "current_value": 0,
        "unit": "%"
      },
      {
        "title": "Key Result 2", 
        "description": "What this key result measures",
        "type": "metric",
        "start_value": 0,
        "target_value": 50000,
        "current_value": 0,
        "unit": "$"
      }
    ]
  }
]

Only return the JSON array, no other text."""

    try:
        # Create a unique session ID for this request
        session_id = str(uuid.uuid4())
        
        # Initialize Gemini chat
        chat = LlmChat(
            api_key=GEMINI_API_KEY,
            session_id=session_id,
            system_message=system_message
        ).with_model("gemini", "gemini-2.0-flash").with_max_tokens(4096)
        
        # Prepare the user prompt
        user_prompt = f"""
Generate OKRs for the following business context:

Context: {context}
Company Size: {company_size}
Industry: {industry if industry else "General"}
Time Period: {time_period}

Please create appropriate objectives and key results that align with this context.
"""
        
        user_message = UserMessage(text=user_prompt)
        
        # Get AI response
        response = await chat.send_message(user_message)
        
        # Parse the JSON response
        import json
        
        # Clean the response to extract JSON
        response_text = response.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        # Parse JSON
        okrs_data = json.loads(response_text)
        
        # Convert to GeneratedOKR objects
        generated_okrs = []
        for okr in okrs_data:
            generated_okr = GeneratedOKR(
                title=okr["title"],
                description=okr["description"],
                owner=okr["owner"],
                key_results=okr["key_results"]
            )
            generated_okrs.append(generated_okr)
        
        return generated_okrs
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response as JSON: {e}")
        logger.error(f"Response was: {response}")
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        logger.error(f"Error generating OKRs with AI: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate OKRs: {str(e)}")

@app.post("/api/generate-okrs")
async def generate_okrs_endpoint(request: GenerateOKRRequest):
    """Generate OKRs using AI based on user context"""
    try:
        generated_okrs = await generate_okrs_with_ai(
            context=request.context,
            company_size=request.company_size,
            industry=request.industry,
            time_period=request.time_period
        )
        
        return {
            "success": True,
            "generated_okrs": [okr.dict() for okr in generated_okrs],
            "message": "OKRs generated successfully"
        }
    except Exception as e:
        logger.error(f"Error in generate_okrs_endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-and-create-okrs")
async def generate_and_create_okrs_endpoint(request: GenerateOKRRequest):
    """Generate OKRs using AI and automatically create them in the database"""
    try:
        generated_okrs = await generate_okrs_with_ai(
            context=request.context,
            company_size=request.company_size,
            industry=request.industry,
            time_period=request.time_period
        )
        
        created_objectives = []
        
        for generated_okr in generated_okrs:
            # Create the objective
            objective_data = {
                "id": str(uuid.uuid4()),
                "title": generated_okr.title,
                "description": generated_okr.description,
                "owner": generated_okr.owner,
                "deadline": None,  # Can be set later by user
                "status": "active",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
            # Insert objective into database
            result = objectives_collection.insert_one(objective_data)
            objective_data['_id'] = str(result.inserted_id)
            
            # Create key results for this objective
            created_key_results = []
            for kr_data in generated_okr.key_results:
                key_result_data = {
                    "id": str(uuid.uuid4()),
                    "title": kr_data["title"],
                    "description": kr_data.get("description", ""),
                    "type": kr_data.get("type", "metric"),
                    "start_value": kr_data.get("start_value", 0),
                    "target_value": kr_data.get("target_value", 100),
                    "current_value": kr_data.get("current_value", 0),
                    "unit": kr_data.get("unit", ""),
                    "owner": generated_okr.owner,
                    "objective_id": objective_data["id"],
                    "created_at": datetime.now(),
                    "updated_at": datetime.now()
                }
                
                # Insert key result into database
                kr_result = key_results_collection.insert_one(key_result_data)
                key_result_data['_id'] = str(kr_result.inserted_id)
                key_result_data['progress'] = calculate_kr_progress(key_result_data)
                created_key_results.append(key_result_data)
            
            objective_data['key_results'] = created_key_results
            objective_data['progress'] = calculate_objective_progress(objective_data["id"])
            created_objectives.append(objective_data)
        
        return {
            "success": True,
            "created_objectives": created_objectives,
            "message": f"Successfully created {len(created_objectives)} objectives with AI-generated content"
        }
        
    except Exception as e:
        logger.error(f"Error in generate_and_create_okrs_endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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