# jobradar/backend/app/api/v1/jobs.py

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Path, Query, status
from pydantic import BaseModel, Field

router = APIRouter()


# Response Models for Documentation
class JobListItem(BaseModel):
    """Schema for a job listing item"""
    id: str = Field(..., description="The unique identifier (UUID) of the job")
    slug: str = Field(..., description="URL-friendly version of the job title")
    company: str = Field(..., description="Company name")
    title: str = Field(..., description="Job title")
    location: Optional[str] = Field(None, description="Physical location")
    location_status: str = Field(..., description="Location type (e.g., hybrid, onsite, worldwide_remote)")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    relevance_score: Optional[float] = Field(None, description="Match matching relevance engine score")
    matched_keywords: List[str] = Field(default_factory=list, description="Keywords matching candidate preferences")
    application_status: str = Field(..., description="Current pipeline status (e.g., discovered, saved)")


class JobDetails(JobListItem):
    """Schema for detailed job information"""
    description: str = Field(..., description="Original raw description text")
    full_description_processed: str = Field(..., description="Cleaned/parsed description text")
    raw_source_url: str = Field(..., description="Source page URL where found")
    application_endpoint: Optional[str] = Field(None, description="Direct application page link")
    source_type: str = Field(..., description="Source engine or provider identifier")
    ats_type: Optional[str] = Field(None, description="Detected Applicant Tracking System type")
    posted_date: Optional[datetime] = Field(None, description="Original posting timestamp")
    seniority_level: Optional[str] = Field(None, description="Inferred experience level requirement")


class JobsListResponse(BaseModel):
    """Response schema for job listing"""
    total: int
    page: int
    page_size: int
    jobs: List[JobListItem]


# Added Request Body schema for POST operations to match FastAPI best practices
class JobActionRequest(BaseModel):
    """Schema for applying workflow status adjustments to jobs"""
    job_id: str = Field(..., description="The target UUID of the job listing")


@router.get(
    "",  # Kept empty because the prefix /jobs is defined when mounting in main.py
    response_model=JobsListResponse,
    summary="List all jobs",
    description="""
    Returns a paginated list of all discovered jobs.
    
    ## Filtering Options
    - **status**: Filter by application status (discovered, saved, applied, skipped)
    - **location**: Filter by location type (worldwide_remote, regional_remote, hybrid, onsite)
    - **company**: Filter by company name (partial match)
    - **keyword**: Filter by keyword (searches in title and description)
    
    ## Pagination
    - **page**: Page number (starts at 1)
    - **page_size**: Number of items per page (default: 20, max: 100)
    
    ## Sorting
    - **sort_by**: created_at, relevance_score, company, title
    - **sort_order**: asc, desc
    """
)
async def list_jobs(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by application status"),
    location: Optional[str] = Query(None, description="Filter by location status"),
    company: Optional[str] = Query(None, description="Filter by company name"),
    keyword: Optional[str] = Query(None, description="Search by keyword"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)")
):
    """List all jobs with pagination and filtering"""
    return {
        "total": 0,
        "page": page,
        "page_size": page_size,
        "jobs": []
    }


@router.get(
    "/{job_id}/{slug}",  # Clean structure without duplicate /jobs context pathing
    response_model=JobDetails,
    summary="Get job details",
    description="Returns detailed information for a specific job by ID and slug",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "description": "Job not found",
            "content": {"application/json": {"example": {"detail": "Job not found. Implementation in progress."}}}
        }
    }
)
async def get_job(
    job_id: str = Path(..., description="The UUID of the job"),
    slug: str = Path(..., description="The slug of the job title")
):
    """Get detailed information for a specific job."""
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Job not found. Implementation in progress."
    )


@router.post(
    "/save",
    summary="Save a job",
    description="Marks a job as saved for later reference"
)
async def save_job(request: JobActionRequest):
    """Save a job to your collection"""
    return {"message": f"Job {request.job_id} saved successfully"}


@router.post(
    "/skip",
    summary="Skip a job",
    description="Marks a job as skipped (will not appear in future searches)"
)
async def skip_job(request: JobActionRequest):
    """Skip a job"""
    return {"message": f"Job {request.job_id} skipped successfully"}
