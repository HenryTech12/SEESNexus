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
    matric_no?: string;
    is_active: boolean;
    created_at?: string;
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

export interface HardwareLoan {
    id: string;
    hardware_id: string;
    user_id: string;
    quantity: number;
    request_date: string;
    return_date?: string;
    status: "PENDING" | "APPROVED" | "RETURNED" | "REJECTED";
}

export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    event_type: "WORKSHOP" | "SEMINAR" | "COMPETITION" | "HACKATHON";
    capacity: number;
    registered_count: number;
    image_url?: string;
}
