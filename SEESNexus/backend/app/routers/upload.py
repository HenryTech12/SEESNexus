from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import cloudinary.uploader
from app.middleware.auth_middleware import get_current_user
from app.models.all_models import User
from app.schemas.response import StandardResponse

router = APIRouter(prefix="/upload", tags=["upload"])

ALLOWED_EXTENSIONS = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024 # 5MB

@router.post("/image", response_model=StandardResponse)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if file.content_type not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, and WebP are allowed.")
    
    # Check file size
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")
    
    try:
        upload_result = cloudinary.uploader.upload(
            file.file,
            folder=f"sees_nexus/{current_user.id}/"
        )
        return StandardResponse(
            message="Image uploaded successfully",
            data={
                "url": upload_result.get("secure_url"),
                "public_id": upload_result.get("public_id")
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
