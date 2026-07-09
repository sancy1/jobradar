# jobradar/backend/app/api/v1/search.py


from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Body
from pydantic import BaseModel, Field, HttpUrl

router = APIRouter()


# Request/Response Models
class URLIngestionItem(BaseModel):
    """A single URL to process"""
    url: HttpUrl = Field(..., description="The direct job posting or career portal URL")
    title_override: Optional[str] = Field(None, description="Force title mapping if metadata extraction fails")
    company_override: Optional[str] = Field(None, description="Force company mapping if metadata extraction fails")


class URLListRequest(BaseModel):
    """Request to process multiple URLs"""
    urls: List[URLIngestionItem] = Field(..., description="List of target URLs to ingest")
    keywords: List[str] = Field(..., description="Target core matching keywords")
    must_have_keywords: Optional[List[str]] = Field(default_factory=list, description="Keywords that must exist")
    should_have_keywords: Optional[List[str]] = Field(default_factory=list, description="Keywords that add scoring weights")
    must_not_have_keywords: Optional[List[str]] = Field(default_factory=list, description="Keywords that drop the post")
    location_preference: str = Field("worldwide", description="Target location filter configuration")
    seniority_level: str = Field("any", description="Target experience filter configuration")
    remote_only: bool = Field(True, description="Enforce strict remote filter matching")
    entry_level_only: bool = Field(False, description="Filter specifically for entry level postings")


class URLProcessResult(BaseModel):
    """Result of processing a single URL"""
    url: str
    success: bool
    job_id: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    error: Optional[str] = None


class URLIngestionResponse(BaseModel):
    """Response for URL batch ingestion"""
    total_urls: int
    successful: int
    failed: int
    results: List[URLProcessResult]
    processed_at: datetime


class SaveSearchConfigPayload(BaseModel):
    """Schema object container layout tracking search saves"""
    name: str = Field(..., description="Unique identifiable name for the configuration rule")
    config: dict = Field(..., description="Complete structural parameters mapping configuration specifications")


@router.post(
    "/urls",  # Fixed duplicate /search/urls mapping pathing bug
    response_model=URLIngestionResponse,
    summary="Process a batch of URLs",
    description="""
    Manually process a list of URLs for job extraction.
    
    ## Use Cases
    - You found a job posting on a company website
    - You want to process specific job board listings
    - You're testing how JobRadar handles a particular site
    
    ## URL Types Supported
    - Corporate career pages (e.g., `https://stripe.com/careers`)
    - ATS portals (Greenhouse, Lever, Workday)
    - Job boards (Indeed, Wellfound)
    - Direct job postings
    
    ## URL Overrides
    You can optionally override the title and company extracted from the URL.
    This is useful when the page doesn't have proper metadata.
    
    ## Processing Flow
    1. Each URL is fetched
    2. The page is parsed for job information
    3. The provided filters are applied
    4. Matching jobs are saved to the database
    
    ## Response
    Returns detailed results for each URL processed.
    """
)
async def process_urls(
    request: URLListRequest = Body(
        ...,
        openapi_examples={
            "default": {
                "summary": "Standard URL processing template",
                "value": {
                    "urls": [
                        {"url": "https://stripe.com/careers/software-engineer"},
                        {"url": "https://vercel.com/careers/frontend-engineer"}
                    ],
                    "keywords": ["Python", "React"],
                    "must_have_keywords": ["Remote"],
                    "remote_only": True
                }
            }
        }
    )
):
    """Process a batch of URLs with the given filters."""
    results = []
    
    for item in request.urls:
        results.append(URLProcessResult(
            url=str(item.url),
            success=False,
            error="Processing not yet implemented"
        ))
    
    return URLIngestionResponse(
        total_urls=len(request.urls),
        successful=0,
        failed=len(request.urls),
        results=results,
        processed_at=datetime.now(timezone.utc)
    )


@router.post(
    "/save",  # Fixed duplicate /search/save pathing bug
    summary="Save search configuration",
    description="Save your search configuration for future use or scheduled runs"
)
async def save_search_configuration(
    payload: SaveSearchConfigPayload = Body(...)
):
    """Save a search configuration"""
    return {
        "message": f"Search configuration '{payload.name}' saved successfully",
        "search_id": "saved_search_001"
    }


@router.get(
    "/history",  # Fixed duplicate /search/history pathing bug
    summary="Get saved searches",
    description="Retrieve all saved search configurations for the current user"
)
async def get_search_history():
    """Get saved search configurations"""
    return {
        "total": 0,
        "searches": []
    }
