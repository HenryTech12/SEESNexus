import enum
from uuid import uuid4
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Enum, ForeignKey, Text, Integer, JSON, TypeDecorator
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.database import Base

class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise uses
    CHAR(32), storing as stringified hex values.
    """
    impl = String
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        else:
            return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            return value

class UserRole(enum.Enum):
    STUDENT = "STUDENT"
    CONTRIBUTOR = "CONTRIBUTOR"
    ADMIN = "ADMIN"

class ProjectStatus(enum.Enum):
    IDEATION = "IDEATION"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"

class ProjectCategory(enum.Enum):
    IOT = "IOT"
    AI_ML = "AI_ML"
    EMBEDDED = "EMBEDDED"
    WEB = "WEB"
    MOBILE = "MOBILE"

class HardwareCategory(enum.Enum):
    MEASUREMENT = "MEASUREMENT"
    MICROCONTROLLER = "MICROCONTROLLER"
    COMPONENT = "COMPONENT"

class HardwareStatus(enum.Enum):
    AVAILABLE = "AVAILABLE"
    BORROWED = "BORROWED"
    MAINTENANCE = "MAINTENANCE"

class LoanStatus(enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    RETURNED = "RETURNED"
    REJECTED = "REJECTED"

class EventType(enum.Enum):
    HACKATHON = "HACKATHON"
    WORKSHOP = "WORKSHOP"
    SEMINAR = "SEMINAR"
    CONFERENCE = "CONFERENCE"

class RegistrationStatus(enum.Enum):
    CONFIRMED = "CONFIRMED"
    WAITLISTED = "WAITLISTED"
    CANCELLED = "CANCELLED"

class ArticleStatus(enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"

class User(Base):
    __tablename__ = "users"
    
    id = Column(GUID, primary_key=True, default=uuid4)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    department = Column(String, nullable=False)
    level = Column(String)
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    profile_image_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    projects = relationship("Project", back_populates="created_by")
    loan_requests = relationship("HardwareLoan", back_populates="borrower", foreign_keys="HardwareLoan.borrower_id")
    event_registrations = relationship("EventRegistration", back_populates="student")
    articles = relationship("Article", back_populates="author")

class ProjectMember(Base):
    __tablename__ = "project_members"
    project_id = Column(GUID, ForeignKey("projects.id"), primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), primary_key=True)

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(GUID, primary_key=True, default=uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    tech_stack = Column(JSON) # Changed from ARRAY(String) for SQLite compatibility
    github_url = Column(String, nullable=True)
    demo_url = Column(String, nullable=True)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.IDEATION)
    category = Column(Enum(ProjectCategory))
    thumbnail_url = Column(String, nullable=True)
    created_by_id = Column(GUID, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    created_by = relationship("User", back_populates="projects")
    team_members = relationship("User", secondary="project_members")

class Hardware(Base):
    __tablename__ = "hardware"
    
    id = Column(GUID, primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    serial_number = Column(String, unique=True, nullable=False)
    category = Column(Enum(HardwareCategory))
    status = Column(Enum(HardwareStatus), default=HardwareStatus.AVAILABLE)
    image_url = Column(String, nullable=True)
    quantity = Column(Integer, default=1)
    available_quantity = Column(Integer, default=1)
    added_by_id = Column(GUID, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    loans = relationship("HardwareLoan", back_populates="hardware")

class HardwareLoan(Base):
    __tablename__ = "hardware_loans"
    
    id = Column(GUID, primary_key=True, default=uuid4)
    hardware_id = Column(GUID, ForeignKey("hardware.id"))
    borrower_id = Column(GUID, ForeignKey("users.id"))
    approved_by_id = Column(GUID, ForeignKey("users.id"), nullable=True)
    status = Column(Enum(LoanStatus), default=LoanStatus.PENDING)
    purpose = Column(String, nullable=False)
    request_date = Column(DateTime, default=datetime.utcnow)
    approval_date = Column(DateTime, nullable=True)
    expected_return_date = Column(DateTime, nullable=False)
    actual_return_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    hardware = relationship("Hardware", back_populates="loans")
    borrower = relationship("User", back_populates="loan_requests", foreign_keys=[borrower_id])

class Event(Base):
    __tablename__ = "events"
    
    id = Column(GUID, primary_key=True, default=uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    event_type = Column(Enum(EventType))
    location = Column(String, nullable=False)
    is_virtual = Column(Boolean, default=False)
    virtual_link = Column(String, nullable=True)
    banner_url = Column(String, nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    registration_deadline = Column(DateTime, nullable=False)
    max_participants = Column(Integer, nullable=True)
    created_by_id = Column(GUID, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    registrations = relationship("EventRegistration", back_populates="event")

class EventRegistration(Base):
    __tablename__ = "event_registrations"
    
    id = Column(GUID, primary_key=True, default=uuid4)
    event_id = Column(GUID, ForeignKey("events.id"))
    student_id = Column(GUID, ForeignKey("users.id"))
    registered_at = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(RegistrationStatus), default=RegistrationStatus.CONFIRMED)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    event = relationship("Event", back_populates="registrations")
    student = relationship("User", back_populates="event_registrations")

class Article(Base):
    __tablename__ = "articles"
    
    id = Column(GUID, primary_key=True, default=uuid4)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    content = Column(Text, nullable=False)
    excerpt = Column(Text, nullable=True)
    cover_image_url = Column(String, nullable=True)
    status = Column(Enum(ArticleStatus), default=ArticleStatus.DRAFT)
    tags = Column(JSON)
    author_id = Column(GUID, ForeignKey("users.id"))
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    author = relationship("User", back_populates="articles")

class VerificationCode(Base):
    __tablename__ = "verification_codes"
    
    id = Column(GUID, primary_key=True, default=uuid4)
    email = Column(String, index=True, nullable=False)
    code = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
