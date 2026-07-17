export enum UserRole {
  STUDENT = "STUDENT",
  CONTRIBUTOR = "CONTRIBUTOR",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
  level?: string;
  is_active: boolean;
  created_at?: string;
  // Present on backend's UserResponse/UserUpdate (PUT /auth/me) but unused
  // on the frontend until now.
  profile_image_url?: string;
  bio?: string;
}

export enum ProjectStatus {
  IDEATION = "IDEATION",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum ProjectCategory {
  IOT = "IOT",
  AI_ML = "AI_ML",
  EMBEDDED = "EMBEDDED",
  WEB = "WEB",
  MOBILE = "MOBILE",
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url?: string;
  demo_url?: string;
  status: ProjectStatus;
  category: ProjectCategory;
  thumbnail_url?: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

export enum HardwareStatus {
  AVAILABLE = "AVAILABLE",
  BORROWED = "BORROWED",
  MAINTENANCE = "MAINTENANCE",
}

export enum HardwareCategory {
  MEASUREMENT = "MEASUREMENT",
  MICROCONTROLLER = "MICROCONTROLLER",
  COMPONENT = "COMPONENT",
}

export interface Hardware {
  id: string;
  name: string;
  description?: string;
  serial_number?: string;
  category: HardwareCategory;
  status: HardwareStatus;
  image_url?: string;
  quantity: number;
  available_quantity: number;
}

export type LoanStatus = "PENDING" | "APPROVED" | "RETURNED" | "REJECTED";

export interface HardwareLoan {
  id: string;
  hardware_id: string;
  borrower_id: string;
  approved_by_id?: string;
  status: LoanStatus;
  purpose: string;
  request_date: string;
  approval_date?: string;
  expected_return_date: string;
  actual_return_date?: string;
  hardware?: Hardware;
  borrower?: User;
}

export enum EventType {
  HACKATHON = "HACKATHON",
  WORKSHOP = "WORKSHOP",
  SEMINAR = "SEMINAR",
  CONFERENCE = "CONFERENCE",
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: EventType;
  location: string;
  is_virtual: boolean;
  virtual_link?: string;
  banner_url?: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  // Backend has no live registration count endpoint (only an admin-only
  // participants list) — there's no "X/Y registered" to show without it.
  max_participants?: number;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

export enum RegistrationStatus {
  CONFIRMED = "CONFIRMED",
  WAITLISTED = "WAITLISTED",
  CANCELLED = "CANCELLED",
}

export interface EventRegistration {
  id: string;
  event_id: string;
  student_id: string;
  registered_at: string;
  status: RegistrationStatus;
}

export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ArticleAuthor {
  id: string;
  full_name: string;
  profile_image_url?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  tags: string[];
  status: ArticleStatus;
  author_id: string;
  author: ArticleAuthor;
  published_at?: string;
  created_at: string;
  updated_at: string;
}
