from passlib.context import CryptContext
import logging

# Silence passlib warnings
logging.getLogger("passlib").setLevel(logging.ERROR)

# Use bcrypt as specified in the project requirements
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
