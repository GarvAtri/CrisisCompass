from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CrisisCompass API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/crisiscompass")
engine = create_engine(DATABASE_URL)

# Pydantic models
class CountryCrisis(BaseModel):
    country_iso3: str
    crisis_rank: int
    invisible_crisis_score: float
    health_in_need_24: float
    health_in_need_25: float
    health_need_change_pct: float
    food_in_need_24: float
    health_required: float
    health_funded: float
    health_gap: float
    health_coverage: float
    food_required: Optional[float]
    food_funded: Optional[float]
    food_coverage: Optional[float]
    health_funding_per_person_in_need: float
    health_vs_food_coverage_gap: Optional[float]
    total_pop: Optional[float]
    total_funding_per_capita: Optional[float]
    food_to_health_lag: bool

class FundingFlow(BaseModel):
    source: str
    destination: str
    amount: float
    sector: str

class TemporalTrend(BaseModel):
    country_iso3: str
    year_2024: float
    year_2025: float
    change_pct: float
    trend: str  # "improving", "worsening", "stable"

@app.get("/")
async def root():
    return {"message": "CrisisCompass API - Humanitarian Crisis Storytelling"}

@app.get("/api/stories/invisible-crises", response_model=List[CountryCrisis])
async def get_invisible_crises(limit: int = 20):
    """Get countries ranked by invisible crisis score"""
    query = text("""
        SELECT 
            country_iso3,
            crisis_rank,
            invisible_crisis_score,
            health_in_need_24,
            health_in_need_25,
            health_need_change_pct,
            food_in_need_24,
            health_required,
            health_funded,
            health_gap,
            health_coverage,
            food_required,
            food_funded,
            food_coverage,
            health_funding_per_person_in_need,
            health_vs_food_coverage_gap,
            total_pop,
            total_funding_per_capita,
            food_to_health_lag
        FROM crisis_scores 
        ORDER BY crisis_rank ASC 
        LIMIT :limit
    """)
    
    try:
        with engine.connect() as conn:
            result = conn.execute(query, {"limit": limit})
            return [dict(row._mapping) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/stories/funding-flows", response_model=List[FundingFlow])
async def get_funding_flows(sector: Optional[str] = None):
    """Get funding flow data for Sankey diagrams"""
    where_clause = "WHERE sector = :sector" if sector else ""
    params = {"sector": sector} if sector else {}
    
    query = text(f"""
        SELECT 
            source,
            destination,
            amount,
            sector
        FROM funding_flows 
        {where_clause}
        ORDER BY amount DESC
        LIMIT 50
    """)
    
    try:
        with engine.connect() as conn:
            result = conn.execute(query, params)
            return [dict(row._mapping) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/stories/temporal-trends", response_model=List[TemporalTrend])
async def get_temporal_trends(limit: int = 15):
    """Get temporal trends showing 2024→2025 changes"""
    query = text("""
        SELECT 
            country_iso3,
            health_in_need_24 as year_2024,
            health_in_need_25 as year_2025,
            health_need_change_pct as change_pct,
            CASE 
                WHEN health_need_change_pct > 5 THEN 'worsening'
                WHEN health_need_change_pct < -5 THEN 'improving'
                ELSE 'stable'
            END as trend
        FROM crisis_scores 
        WHERE health_need_change_pct IS NOT NULL
        ORDER BY ABS(health_need_change_pct) DESC 
        LIMIT :limit
    """)
    
    try:
        with engine.connect() as conn:
            result = conn.execute(query, {"limit": limit})
            return [dict(row._mapping) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/stories/crisis-matrix")
async def get_crisis_matrix():
    """Get data for bubble chart (Health Needs vs Funding Gap)"""
    query = text("""
        SELECT 
            country_iso3,
            health_in_need_24 as health_needs,
            health_gap as funding_gap,
            total_pop as population,
            invisible_crisis_score,
            health_coverage,
            crisis_rank
        FROM crisis_scores 
        WHERE health_in_need_24 > 0 AND health_gap > 0
        ORDER BY invisible_crisis_score DESC
        LIMIT 30
    """)
    
    try:
        with engine.connect() as conn:
            result = conn.execute(query)
            return [dict(row._mapping) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/stories/country-comparison/{country1}/{country2}")
async def compare_countries(country1: str, country2: str):
    """Compare two countries side by side"""
    query = text("""
        SELECT 
            country_iso3,
            health_in_need_24,
            health_in_need_25,
            health_need_change_pct,
            food_in_need_24,
            health_required,
            health_funded,
            health_gap,
            health_coverage,
            food_required,
            food_funded,
            food_coverage,
            health_funding_per_person_in_need,
            invisible_crisis_score,
            crisis_rank,
            total_pop
        FROM crisis_scores 
        WHERE country_iso3 IN (:country1, :country2)
        ORDER BY crisis_rank ASC
    """)
    
    try:
        with engine.connect() as conn:
            result = conn.execute(query, {"country1": country1, "country2": country2})
            data = [dict(row._mapping) for row in result]
            if len(data) < 2:
                raise HTTPException(status_code=404, detail="One or both countries not found")
            return {"countries": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/stories/health-vs-food")
async def get_health_vs_food_disparity():
    """Get countries where health is more underfunded than food"""
    query = text("""
        SELECT 
            country_iso3,
            health_coverage,
            food_coverage,
            health_vs_food_coverage_gap,
            health_in_need_24,
            food_in_need_24,
            invisible_crisis_score
        FROM crisis_scores 
        WHERE health_vs_food_coverage_gap > 0.1
           AND health_coverage IS NOT NULL 
           AND food_coverage IS NOT NULL
        ORDER BY health_vs_food_coverage_gap DESC
        LIMIT 15
    """)
    
    try:
        with engine.connect() as conn:
            result = conn.execute(query)
            return [dict(row._mapping) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
