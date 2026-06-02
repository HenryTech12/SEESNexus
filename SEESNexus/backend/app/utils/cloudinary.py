import cloudinary
import cloudinary.uploader
from app.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

def upload_image(file, folder="sees_nexus"):
    upload_result = cloudinary.uploader.upload(file, folder=folder)
    return upload_result.get("secure_url")

def delete_image(public_id):
    cloudinary.uploader.destroy(public_id)
