# jobradar/backend/app/services/oauth.py

"""
OAuth Service
Handles OAuth2 authentication with Google and GitHub providers using AsyncOAuth2Client
"""

import logging
import httpx
from typing import Dict, Any, Optional
from authlib.integrations.httpx_client import AsyncOAuth2Client

from app.config import settings

logger = logging.getLogger(__name__)


class OAuthService:
    """
    Handles OAuth2 authentication with Google and GitHub
    
    Features:
    - Google OAuth2 with OpenID Connect
    - GitHub OAuth2 with email scope
    - Token exchange and user info retrieval
    """
    
    def __init__(self):
        # CRITICAL FIX: Switched from OAuth2Client to AsyncOAuth2Client for async token fetching
        # Google OAuth2 Client
        self.google_client = AsyncOAuth2Client(
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scope="openid email profile",
            redirect_uri=settings.GOOGLE_REDIRECT_URI
        )
        
        # GitHub OAuth2 Client
        self.github_client = AsyncOAuth2Client(
            client_id=settings.GITHUB_CLIENT_ID,
            client_secret=settings.GITHUB_CLIENT_SECRET,
            redirect_uri=settings.GITHUB_REDIRECT_URI,
            scope="user:email"
        )
    
    # ============================================================
    # GOOGLE OAUTH
    # ============================================================
    
    def get_google_auth_url(self) -> str:
        """
        Generate Google OAuth authorization URL
        
        Returns:
            URL to redirect user for Google authentication
        """
        auth_url, state = self.google_client.create_authorization_url(
            "https://accounts.google.com/o/oauth2/v2/auth",
            access_type="offline",
            prompt="select_account"
        )
        return auth_url
    
    async def exchange_google_code(self, code: str) -> Optional[Dict[str, Any]]:
        """
        Exchange Google authorization code for user information
        
        Args:
            code: Authorization code from Google callback
        
        Returns:
            User info dict with normalized keys matching user_service requirements
        """
        try:
            # Step 1: Exchange code for access token asynchronously
            token = await self.google_client.fetch_token(
                "https://oauth2.googleapis.com/token",
                code=code,
                grant_type="authorization_code"
            )
            
            # Step 2: Get user info with access token
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={
                        "Authorization": f"Bearer {token['access_token']}"
                    },
                    timeout=10.0
                )
                
                if response.status_code != 200:
                    logger.error(f"❌ Google UserInfo API returned status {response.status_code}")
                    return None
                
                data = response.json()
                
                # CRITICAL FIX: Normalized keys to match what user_service expects ('picture')
                return {
                    "id": data.get("sub"),
                    "email": data.get("email"),
                    "name": data.get("name"),
                    "picture": data.get("picture"),
                    "email_verified": data.get("email_verified", False)
                }
                
        except Exception as e:
            logger.error(f"❌ Google OAuth error: {e}", exc_info=True)
            return None
    
    # ============================================================
    # GITHUB OAUTH
    # ============================================================
    
    def get_github_auth_url(self) -> str:
        """
        Generate GitHub OAuth authorization URL
        
        Returns:
            URL to redirect user for GitHub authentication
        """
        auth_url, state = self.github_client.create_authorization_url(
            "https://github.com/login/oauth/authorize"
        )
        return auth_url
    
    async def exchange_github_code(self, code: str) -> Optional[Dict[str, Any]]:
        """
        Exchange GitHub authorization code for user information
        
        Args:
            code: Authorization code from GitHub callback
        
        Returns:
            User info dict with normalized keys matching user_service requirements
        """
        try:
            # Step 1: Exchange code for access token asynchronously
            token = await self.github_client.fetch_token(
                "https://github.com/login/oauth/access_token",
                code=code,
                grant_type="authorization_code"
            )
            
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {token['access_token']}",
                    "Accept": "application/json"
                }
                
                # Step 2: Get user profile
                response = await client.get(
                    "https://api.github.com/user",
                    headers=headers,
                    timeout=10.0
                )
                
                if response.status_code != 200:
                    logger.error(f"❌ GitHub User API returned status {response.status_code}")
                    return None
                
                user_data = response.json()
                
                # Step 3: Get primary email (may be private)
                email = user_data.get("email")
                
                if not email:
                    # Fetch emails and get primary
                    email_response = await client.get(
                        "https://api.github.com/user/emails",
                        headers=headers,
                        timeout=10.0
                    )
                    
                    if email_response.status_code == 200:
                        emails = email_response.json()
                        primary_email = next(
                            (e for e in emails if e.get("primary")), 
                            emails[0] if emails else {}
                        )
                        email = primary_email.get("email")
                
                # CRITICAL FIX: Included both 'picture' and 'avatar_url' keys for user_service resilience
                return {
                    "id": str(user_data.get("id")),
                    "email": email,
                    "name": user_data.get("name") or user_data.get("login"),
                    "picture": user_data.get("avatar_url"),
                    "avatar_url": user_data.get("avatar_url"),
                    "username": user_data.get("login")
                }
                
        except Exception as e:
            logger.error(f"❌ GitHub OAuth error: {e}", exc_info=True)
            return None
    
    # ============================================================
    # PROVIDER DETECTION
    # ============================================================
    
    @staticmethod
    def detect_provider_from_url(url: str) -> Optional[str]:
        """
        Detect which provider a URL belongs to
        
        Args:
            url: The callback URL
        
        Returns:
            'google', 'github', or None
        """
        if "google" in url.lower():
            return "google"
        elif "github" in url.lower():
            return "github"
        return None


# ============================================================
# SINGLETON INSTANCE
# ============================================================
oauth_service = OAuthService()
