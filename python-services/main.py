from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from matcher import SkillMatcher

app = FastAPI(title="Quick Teams Python Matcher API", version="2.0.0")

class CandidateItem(BaseModel):
    id: int
    username: str
    name: Optional[str] = ""
    skills: Optional[str] = ""
    about_me: Optional[str] = ""
    education: Optional[str] = ""
    availability: Optional[bool] = True

class MatchRequest(BaseModel):
    query: str
    candidates: List[CandidateItem]

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Python Skill Matcher API"}

@app.post("/api/v1/recommend")
def recommend_candidates(req: MatchRequest):
    candidates_dict = [c.model_dump() for c in req.candidates]
    ranked = SkillMatcher.rank_candidates(req.query, candidates_dict)
    return {"query": req.query, "count": len(ranked), "results": ranked}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
