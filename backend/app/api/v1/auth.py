# app/api/v1/auth.py

"""
Authentication API Routes
Handles Google and GitHub OAuth login, callbacks, and user session management
"""

from fastapi import APIRouter, Request, HTTPException, status, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.oauth import oauth_service
from app.services.user import user_service
from app.services.database import get_db_session
from app.middleware.auth import RequireAuth
from app.models.user import User
from app.schemas.user import UserProfileResponse, TokenResponse
from app.utils.jwt import create_jwt
from app.config import settings

router = APIRouter(tags=["Authentication"])


# ============================================================
# GOOGLE OAUTH ENDPOINTS
# ============================================================

@router.get("/google/login", summary="Initiate Google OAuth login")
async def google_login():
    """
    Redirect to Google OAuth page.
    Frontend should redirect to this endpoint to initiate Google login.
    User will be redirected to Google's consent screen.
    """
    auth_url = oauth_service.get_google_auth_url()
    return RedirectResponse(auth_url)


@router.get("/google/callback", response_model=TokenResponse, summary="Google OAuth Callback")
async def google_callback(
    code: str,
    request: Request,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Google OAuth callback endpoint.
    Google redirects here after user authentication.
    Exchanges code for user info and returns a JWT token plus user profile as JSON.
    """
    # Step 1: Exchange code for user info
    user_info = await oauth_service.exchange_google_code(code)
    
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to authenticate with Google. Please try again."
        )
    
    # Step 2: Create or get user
    user = await user_service.get_or_create_user(db, "google", user_info)
    
    # Step 3: Generate JWT token
    token = create_jwt({
        "sub": str(user.id),
        "email": user.email,
        "name": user.name,
        "provider": user.provider
    })
    
    # Step 4: Return JSON payload so frontend can handle navigation separately
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.JWT_EXPIRY_MINUTES * 60,
        user=user
    )


# ============================================================
# GITHUB OAUTH ENDPOINTS
# ============================================================

@router.get("/github/login", summary="Initiate GitHub OAuth login")
async def github_login():
    """
    Redirect to GitHub OAuth page.
    Frontend should redirect to this endpoint to initiate GitHub login.
    User will be redirected to GitHub's consent screen.
    """
    auth_url = oauth_service.get_github_auth_url()
    return RedirectResponse(auth_url)


@router.get("/github/callback", response_model=TokenResponse, summary="GitHub OAuth Callback")
async def github_callback(
    code: str,
    request: Request,
    db: AsyncSession = Depends(get_db_session)
):
    """
    GitHub OAuth callback endpoint.
    GitHub redirects here after user authentication.
    Exchanges code for user info and returns a JWT token plus user profile as JSON.
    """
    # Step 1: Exchange code for user info
    user_info = await oauth_service.exchange_github_code(code)
    
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to authenticate with GitHub. Please try again."
        )
    
    # Step 2: Create or get user
    user = await user_service.get_or_create_user(db, "github", user_info)
    
    # Step 3: Generate JWT token
    token = create_jwt({
        "sub": str(user.id),
        "email": user.email,
        "name": user.name,
        "provider": user.provider
    })
    
    # Step 4: Return JSON payload so frontend can handle navigation separately
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.JWT_EXPIRY_MINUTES * 60,
        user=user
    )


# ============================================================
# USER INFO ENDPOINT
# ============================================================

@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get current user profile",
    description="Returns the authenticated user's profile information"
)
async def get_current_user(
    current_user: User = Depends(RequireAuth)
):
    """
    Get current authenticated user's profile.
    Requires valid JWT token in Authorization header.
    """
    return current_user


@router.get(
    "/me/preferences",
    summary="Get user preferences",
    description="Returns only the user's search and filter preferences"
)
async def get_user_preferences(
    current_user: User = Depends(RequireAuth)
):
    """
    Get current user's search preferences.
    """
    return {
        "default_keywords": current_user.default_keywords or [],
        "default_location_preference": current_user.default_location_preference,
        "default_remote_only": current_user.default_remote_only,
        "default_entry_level_only": current_user.default_entry_level_only
    }


# ============================================================
# LOGOUT ENDPOINT
# ============================================================

@router.post(
    "/logout",
    summary="Logout user",
    description="Invalidate the current session (client should clear token)"
)
async def logout(
    current_user: User = Depends(RequireAuth)
):
    """
    Logout endpoint. The backend doesn't store session states, 
    so the frontend must remove the token from its local client storage.
    """
    return {
        "message": "Logged out successfully",
        "user_id": str(current_user.id)
    }


# ============================================================
# TOKEN REFRESH
# ============================================================

@router.post("/refresh", response_model=TokenResponse, summary="Refresh JWT authentication token")
async def refresh_token(current_user: User = Depends(RequireAuth)):
    """
    Refresh JWT token before expiration.
    Returns a new token with updated expiration window.
    """
    token = create_jwt({
        "sub": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "provider": current_user.provider
    })
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.JWT_EXPIRY_MINUTES * 60,
        user=current_user
    )