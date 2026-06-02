# SEES Nexus — FastAPI Backend

Central innovation hub for the Society of Electrical/Electronics and Computer Engineering Students (SEES) at the University of Lagos (UNILAG).

## Project Overview
This is a production-ready FastAPI REST API system that is secure, scalable, and role-aware.

## Tech Stack
- **FastAPI**
- **PostgreSQL** with **SQLAlchemy 2.0**
- **Alembic** for migrations
- **JWT** Authentication
- **Cloudinary** for file storage

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repo-url>
cd sees_nexus
```

### 2. Create and activate virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/sees_nexus
SECRET_KEY=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 5. Database Migrations
```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### 6. Seed Data (Optional)
```bash
python seed.py
```

### 7. Run the Application
```bash
uvicorn app.main:app --reload
```
The API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

## Project Structure
Refer to the `Project Structure` section in the system prompt for detailed layout.

## API Endpoints
- **Auth:** `/api/v1/auth`
- **Projects:** `/api/v1/projects`
- **Hardware:** `/api/v1/hardware`
- **Events:** `/api/v1/events`
- **Admin:** `/api/v1/admin`
