from fastapi import FastAPI, Request, HTTPException
import os
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, projects, hardware, events, admin, notify, articles, upload

app = FastAPI(
    title="SEES Nexus API",
    description="Central digital hub for SEES UNILAG",
    version="1.0.0",
)

# CORS
# Allow wildcard via env var for quick testing (not recommended for production)
allow_all_env = os.getenv("ALLOW_ALL_ORIGINS", "false").lower() in ("1", "true", "yes")

allowed_origins = [o for o in settings.CORS_ORIGINS if o]
if allow_all_env:
    allowed_origins = ["*"]
elif not allowed_origins:
    # fallback to allowing all if no origins configured
    allowed_origins = ["*"]

# If allowing all origins, browsers forbid Access-Control-Allow-Credentials: true
allow_credentials_setting = False if "*" in allowed_origins else True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials_setting,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    response = JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.detail,
            "code": exc.status_code
        }
    )
    origin = request.headers.get("origin")
    if origin and origin in settings.CORS_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
    elif "*" in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = "*"
    # only allow credentials header when middleware is configured to allow credentials
    response.headers["Access-Control-Allow-Credentials"] = "true" if allow_credentials_setting else "false"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
        
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    status_code = getattr(exc, "status_code", 500)
    
    response = JSONResponse(
        status_code=status_code,
        content={
            "status": "error",
            "message": f"An internal error occurred: {str(exc)}",
            "code": status_code
        }
    )
    origin = request.headers.get("origin")
    if origin and origin in settings.CORS_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
    elif "*" in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true" if allow_credentials_setting else "false"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
        
    return response

# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(articles.router, prefix="/api/v1")
app.include_router(hardware.router, prefix="/api/v1")
app.include_router(events.router, prefix="/api/v1")
app.include_router(upload.router, prefix="/api/v1")
app.include_router(notify.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")

@app.get("/", tags=["health"])
async def root():
    return {"status": "success", "message": "SEES Nexus API is healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
