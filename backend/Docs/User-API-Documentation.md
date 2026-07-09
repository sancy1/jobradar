📚 JobRadar API Documentation
Phase 1: User Authentication
Version: 1.0.0
Last Updated: July 9, 2026
Base URL: http://localhost:8000/api/v1

📋 Table of Contents
Overview

Authentication Flow

Endpoints

Google OAuth

GitHub OAuth

User Management

Error Codes

Testing

Overview
JobRadar uses OAuth 2.0 for authentication with Google and GitHub. No email/password registration is required. Users sign in exclusively via social providers.

Key Features
✅ Google OAuth 2.0 authentication

✅ GitHub OAuth 2.0 authentication

✅ JWT token-based session management

✅ Auto-user creation on first login

✅ Account linking via email

✅ JSON API responses

Authentication Flow
text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. User clicks "Login with Google" or "Login with GitHub"                  │
│     ↓                                                                        │
│  2. Frontend redirects to:                                                   │
│     /api/v1/auth/google/login OR /api/v1/auth/github/login                  │
│     ↓                                                                        │
│  3. Backend redirects to provider's consent screen                          │
│     ↓                                                                        │
│  4. User approves the application                                           │
│     ↓                                                                        │
│  5. Provider redirects to callback URL with authorization code              │
│     ↓                                                                        │
│  6. Backend exchanges code for user info                                    │
│     ↓                                                                        │
│  7. Backend creates/retrieves user in database                              │
│     ↓                                                                        │
│  8. Backend generates JWT token                                             │
│     ↓                                                                        │
│  9. Backend returns JSON with token and user info                           │
│     ↓                                                                        │
│ 10. Frontend stores token and redirects to dashboard                        │
└─────────────────────────────────────────────────────────────────────────────┘
Endpoints
Google OAuth
1. Initiate Google Login
Endpoint: GET /auth/google/login

Description: Redirects user to Google's OAuth consent screen.

Response: 302 Redirect to Google

Example:

bash
curl -v http://localhost:8000/api/v1/auth/google/login
2. Google OAuth Callback
Endpoint: GET /auth/google/callback

Description: Google redirects here after user authentication. Returns JWT token and user info.

Query Parameters:

Parameter	Type	Description
code	string	Authorization code from Google
Success Response (200 OK):

json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGRmMGZhMC0zYmVmLTRkOWItOTk3NS00NTg4NTgxNDFjZDIiLCJlbWFpbCI6ImN5cmlsLmFsZXhhbmRlci5zYW5jaGV6QGdtYWlsLmNvbSIsIm5hbWUiOiJBbGV4YW5kZXIgQ3lyaWwiLCJwcm92aWRlciI6Imdvb2dsZSIsImV4cCI6MTc4MzYyNDc0OH0.CARKG-QMX-KXkirUoyDgoheB32smw4NWtqfTAFP_M-c",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "0ddf0fa0-3bef-4d9b-9975-458858141cd2",
    "email": "cyril.alexander.sanchez@gmail.com",
    "name": "Alexander Cyril",
    "profile_picture": "https://lh3.googleusercontent.com/a/ACg8ocKIrXfXQUj25QoizfLcdWHM-ycHXfeI7lQMhyvKmmCsmFHumD8=s96-c",
    "provider": "google",
    "is_admin": false,
    "preferences": {
      "default_keywords": [],
      "default_location_preference": "worldwide",
      "default_remote_only": true,
      "default_entry_level_only": false
    },
    "created_at": "2026-07-09T18:09:26.993276Z",
    "last_login": "2026-07-09T18:19:05.357290Z"
  }
}
Error Response (400 Bad Request):

json
{
  "detail": {
    "error": "google_auth_failed",
    "message": "Failed to authenticate with Google. Please try again."
  }
}
GitHub OAuth
3. Initiate GitHub Login
Endpoint: GET /auth/github/login

Description: Redirects user to GitHub's OAuth consent screen.

Response: 302 Redirect to GitHub

Example:

bash
curl -v http://localhost:8000/api/v1/auth/github/login
4. GitHub OAuth Callback
Endpoint: GET /auth/github/callback

Description: GitHub redirects here after user authentication. Returns JWT token and user info.

Query Parameters:

Parameter	Type	Description
code	string	Authorization code from GitHub
Success Response (200 OK):

json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MTRhZjMyNC0xMzcwLTQxMjYtYmNjOC0zYzJlMjQ5MzMyNTciLCJlbWFpbCI6InNhbmNoZXouYWxleGFuZGVyLmN5cmlsQGdtYWlsLmNvbSIsIm5hbWUiOiJBbGV4YW5kZXIgIFNhbmNoZXogQ3lyaWwiLCJwcm92aWRlciI6ImdpdGh1YiIsImV4cCI6MTc4MzYyNDg1NH0.tP1y6cQ5cIO1R04ImgtsFSTa6jygw4E15kKxEWYYE_0",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "714af324-1370-4126-bcc8-3c2e24933257",
    "email": "sanchez.alexander.cyril@gmail.com",
    "name": "Alexander  Sanchez Cyril",
    "profile_picture": "https://avatars.githubusercontent.com/u/143714093?v=4",
    "provider": "github",
    "is_admin": false,
    "preferences": {
      "default_keywords": [],
      "default_location_preference": "worldwide",
      "default_remote_only": true,
      "default_entry_level_only": false
    },
    "created_at": "2026-07-09T18:20:46.592907Z",
    "last_login": "2026-07-09T18:20:52.448909Z"
  }
}
Error Response (400 Bad Request):

json
{
  "detail": {
    "error": "github_auth_failed",
    "message": "Failed to authenticate with GitHub. Please try again."
  }
}
User Management
5. Get Current User Profile
Endpoint: GET /auth/me

Description: Returns the authenticated user's profile information.

Headers:

Header	Value
Authorization	Bearer {access_token}
Success Response (200 OK):

json
{
  "id": "714af324-1370-4126-bcc8-3c2e24933257",
  "email": "sanchez.alexander.cyril@gmail.com",
  "name": "Alexander  Sanchez Cyril",
  "profile_picture": "https://avatars.githubusercontent.com/u/143714093?v=4",
  "provider": "github",
  "is_admin": false,
  "preferences": {
    "default_keywords": [],
    "default_location_preference": "worldwide",
    "default_remote_only": true,
    "default_entry_level_only": false
  },
  "created_at": "2026-07-09T18:20:46.592907Z",
  "last_login": "2026-07-09T18:20:52.448909Z"
}
Error Response (401 Unauthorized):

json
{
  "detail": "Invalid or expired authentication token"
}
6. Get User Preferences
Endpoint: GET /auth/me/preferences

Description: Returns only the user's search and filter preferences.

Headers:

Header	Value
Authorization	Bearer {access_token}
Success Response (200 OK):

json
{
  "default_keywords": [],
  "default_location_preference": "worldwide",
  "default_remote_only": true,
  "default_entry_level_only": false
}
Error Response (401 Unauthorized):

json
{
  "detail": "Invalid or expired authentication token"
}
7. Logout
Endpoint: POST /auth/logout

Description: Invalidates the current session. Frontend should clear the token from storage.

Headers:

Header	Value
Authorization	Bearer {access_token}
Success Response (200 OK):

json
{
  "message": "Logged out successfully",
  "user_id": "714af324-1370-4126-bcc8-3c2e24933257"
}
Error Response (401 Unauthorized):

json
{
  "detail": "Invalid or expired authentication token"
}
8. Refresh Token
Endpoint: POST /auth/refresh

Description: Generates a new JWT token before expiration.

Headers:

Header	Value
Authorization	Bearer {access_token}
Success Response (200 OK):

json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "714af324-1370-4126-bcc8-3c2e24933257",
    "email": "sanchez.alexander.cyril@gmail.com",
    "name": "Alexander  Sanchez Cyril",
    "profile_picture": "https://avatars.githubusercontent.com/u/143714093?v=4",
    "provider": "github",
    "is_admin": false,
    "preferences": {
      "default_keywords": [],
      "default_location_preference": "worldwide",
      "default_remote_only": true,
      "default_entry_level_only": false
    },
    "created_at": "2026-07-09T18:20:46.592907Z",
    "last_login": "2026-07-09T18:20:52.448909Z"
  }
}
Error Codes
Status Code	Description
200	Success
400	Bad Request (Invalid parameters)
401	Unauthorized (Invalid/Expired token)
403	Forbidden (Insufficient permissions)
404	Not Found
422	Validation Error
500	Internal Server Error
Common Error Responses
Invalid Token
json
{
  "detail": "Invalid or expired authentication token"
}
User Not Found
json
{
  "detail": "User not found or inactive"
}
OAuth Failed
json
{
  "detail": {
    "error": "google_auth_failed",
    "message": "Failed to authenticate with Google. Please try again."
  }
}
Validation Error
json
{
  "detail": "Validation error detected on incoming payload parameters",
  "errors": [
    {
      "field": "email",
      "message": "field required",
      "type": "missing"
    }
  ]
}
Testing
Using cURL
1. Get Google Login Redirect
bash
curl -v http://localhost:8000/api/v1/auth/google/login
2. Get GitHub Login Redirect
bash
curl -v http://localhost:8000/api/v1/auth/github/login
3. Get User Profile (With Token)
bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
4. Get User Preferences
bash
curl -X GET http://localhost:8000/api/v1/auth/me/preferences \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
5. Logout
bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
6. Refresh Token
bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
Using Swagger UI
Open: http://localhost:8000/docs

Find the Authentication section

Click on any endpoint

Click "Try it out"

Enter required parameters

Click "Execute"

Environment Variables
Variable	Description	Example
GOOGLE_CLIENT_ID	Google OAuth Client ID	123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET	Google OAuth Client Secret	GOCSPX-xxxxxxxxxxxx
GOOGLE_REDIRECT_URI	Google Callback URL	http://localhost:8000/api/v1/auth/google/callback
GITHUB_CLIENT_ID	GitHub OAuth Client ID	Iv1.xxxxxxxxxxxx
GITHUB_CLIENT_SECRET	GitHub OAuth Client Secret	xxxxxxxxxxxxxxxx
GITHUB_REDIRECT_URI	GitHub Callback URL	http://localhost:8000/api/v1/auth/github/callback
JWT_SECRET	JWT Signing Secret	a7b3..........
JWT_EXPIRY_MINUTES	Token Expiry (minutes)	60
FRONTEND_URL	Frontend URL	http://localhost:3000