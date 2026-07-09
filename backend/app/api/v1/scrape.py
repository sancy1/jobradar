# jobradar/backend/app/api/v1/scrape.py

from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4
from fastapi import APIRouter, BackgroundTasks, HTTPException, Query, status
from pydantic import BaseModel, Field

router = APIRouter()


# Request/Response Models
class SearchConfig(BaseModel):
    """Configuration for a search session"""
    keywords: List[str] = Field(..., description="The core job keywords to target")
    must_have_keywords: Optional[List[str]] = Field(default_factory=list, description="Keywords that must be present")
    should_have_keywords: Optional[List[str]] = Field(default_factory=list, description="Keywords that trigger a preference score bump")
    must_not_have_keywords: Optional[List[str]] = Field(default_factory=list, description="Keywords that exclude a job if present")
    location_preference: str = Field("worldwide", description="Target location configuration (worldwide, regional, hybrid, onsite)")
    seniority_level: str = Field("any", description="Target experience level (junior, mid, senior, lead, any)")
    remote_only: bool = Field(True, description="Strict remote validation flag")
    entry_level_only: bool = Field(False, description="Filters exclusively for entry level or junior listings")
    crawl_mode: str = Field("limited", description="Control boundaries for the discovery pipeline (limited or unlimited)")
    max_urls: Optional[int] = Field(200, description="Max boundary for limited crawl modes")
    search_sources: List[str] = Field(default_factory=list, description="Custom targeted engines or providers")


class ScrapeStartResponse(BaseModel):
    """Response when starting a scrape session"""
    session_id: UUID = Field(..., description="Unique engine tracking session execution UUID")
    status: str = Field(..., description="Current running pipeline operational code status")
    message: str = Field(..., description="System human-readable instruction overview context")


class InterruptRequest(BaseModel):
    """Request to interrupt a scrape session"""
    session_id: UUID = Field(..., description="Target execution engine UUID to stop")
    action: str = Field(..., description="Workflow resolution instructions: 'save' or 'delete'")


class SessionStatus(BaseModel):
    """Status of a scrape session"""
    session_id: UUID
    status: str  # pending, running, completed, aborted
    total_discovered: int
    total_processed: int
    total_passed: int
    total_dropped: int
    total_errors: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    engine_used: Optional[str] = None
    percent_complete: float


@router.post(
    "/start",  # Changed from "/scrape/start" to match root prefix binding architecture
    response_model=ScrapeStartResponse,
    summary="Start a new discovery session",
    description="""
    Initiates a background job discovery session.
    
    ## Search Configuration
    
    ### Keywords
    The main keywords to search for (e.g., `["Python", "FastAPI", "React"]`)
    
    ### Filtering Options
    - **must_have_keywords**: All must be present (AND logic)
    - **should_have_keywords**: At least one must be present (OR logic)
    - **must_not_have_keywords**: None can be present (NOT logic)
    
    ### Location Preferences
    - `worldwide`: Global remote only
    - `regional`: Region-specific remote
    - `hybrid`: Hybrid work arrangement
    - `onsite`: On-site positions
    
    ### Crawl Modes
    - **limited**: Process up to `max_urls` URLs
    - **unlimited**: Process all discovered URLs
    
    ## Response
    Returns a `session_id` that can be used to check status or interrupt the session.
    """
)
async def start_scrape(
    config: SearchConfig,
    background_tasks: BackgroundTasks
):
    """
    Start a new job discovery session.
    
    The session runs asynchronously in the background.
    Use the returned `session_id` to:
    - Check status: `GET /scrape/status?session_id={id}`
    - Interrupt: `POST /scrape/interrupt`
    """
    session_id = uuid4()
    
    # Placeholder for database pipeline registration hooks:
    # background_tasks.add_task(run_discovery_pipeline, session_id, config)
    
    return ScrapeStartResponse(
        session_id=session_id,
        status="started",
        message="Discovery pipeline started in background. Use session_id to track progress."
    )


@router.post(
    "/interrupt",  # Cleaned route pathing binding signature
    summary="Interrupt a running session",
    description="""
    Interrupts an active scrape session.
    
    ## Actions
    - **save**: Stops the session and saves any jobs already discovered
    - **delete**: Stops the session and deletes all data for this session
    
    ## Use Cases
    - You found enough jobs and want to stop early
    - The search is taking too long
    - You need to adjust your search parameters
    """
)
async def interrupt_scrape(request: InterruptRequest):
    """Interrupt a running scrape session."""
    return {
        "status": "signal_sent",
        "action": request.action,
        "session_id": str(request.session_id),
        "message": f"Abort signal sent. Data will be {request.action}ed when worker checks in."
    }


@router.get(
    "/status",  # Cleaned route pathing binding signature
    response_model=SessionStatus,
    summary="Get session status",
    description="Returns the current status and progress of a scrape session",
    responses={
        status.HTTP_200_OK: {
            "description": "Session status retrieved",
            "content": {
                "application/json": {
                    "example": {
                        "session_id": "123e4567-e89b-12d3-a456-426614174000",
                        "status": "running",
                        "total_discovered": 150,
                        "total_processed": 75,
                        "total_passed": 30,
                        "total_dropped": 40,
                        "total_errors": 5,
                        "started_at": "2026-07-07T10:00:00",
                        "completed_at": None,
                        "engine_used": "DuckDuckGo",
                        "percent_complete": 50.0
                    }
                }
            }
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "Session not found"
        }
    }
)
async def get_scrape_status(
    session_id: UUID = Query(..., description="The session ID to check")
):
    """Get the current status of a scrape session."""
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Session not found. Implementation in progress."
    )
