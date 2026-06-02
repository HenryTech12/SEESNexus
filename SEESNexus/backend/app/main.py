from fastapi import FastAPI, Request, HTTPException
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
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
    if origin in settings.CORS_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
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
    if origin in settings.CORS_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
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
