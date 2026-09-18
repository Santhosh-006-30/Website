// ============================================================
// Supabase Database Type Definitions
// Phase 24: super_admin, AuditLog, audit_logs table
// ============================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id'>>;
      };
      event_images: {
        Row: EventImage;
        Insert: Omit<EventImage, 'id' | 'created_at'>;
        Update: Partial<Omit<EventImage, 'id'>>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Post, 'id'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id'>>;
      };
      project_images: {
        Row: ProjectImage;
        Insert: Omit<ProjectImage, 'id' | 'created_at'>;
        Update: Partial<Omit<ProjectImage, 'id'>>;
      };
      gallery_albums: {
        Row: GalleryAlbum;
        Insert: Omit<GalleryAlbum, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<GalleryAlbum, 'id'>>;
      };
      gallery_images: {
        Row: GalleryImage;
        Insert: Omit<GalleryImage, 'id' | 'created_at'>;
        Update: Partial<Omit<GalleryImage, 'id'>>;
      };
      team_members: {
        Row: TeamMember;
        Insert: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TeamMember, 'id'>>;
      };
      website_content: {
        Row: WebsiteContent;
        Insert: Omit<WebsiteContent, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<WebsiteContent, 'id'>>;
      };
      site_settings: {
        Row: SiteSetting;
        Insert: Omit<SiteSetting, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SiteSetting, 'id'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: never; // Audit logs are append-only
      };
      careers: {
        Row: Career;
        Insert: Omit<Career, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Career, 'id'>>;
      };
    };
    Functions: {
      is_admin: { Args: Record<never, never>; Returns: boolean };
      is_super_admin: { Args: Record<never, never>; Returns: boolean };
      is_cms_user: { Args: Record<never, never>; Returns: boolean };
      is_viewer_or_above: { Args: Record<never, never>; Returns: boolean };
    };
  };
}

// ============================================================
// ROW TYPES
// ============================================================

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  description: string | null;
  short_description: string | null;
  event_date: string | null;
  display_date: string | null;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  city: string | null;
  category: string;
  organizer: string | null;
  organizer_type: string;
  lia_role: string;
  collaborators: string[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  cover_image_url: string | null;
  external_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  source_platform: string | null;
  source_url: string | null;
  source_verified: boolean;
  year: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface EventImage {
  id: string;
  event_id: string;
  image_url: string;
  storage_path: string | null;
  caption: string | null;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  category: string;
  author: string;
  publish_date: string | null;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  instagram_url: string | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category: string;
  project_date: string | null;
  year: number | null;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  cover_image_url: string | null;
  collaborators: string[];
  impact_metrics: ImpactMetric[];
  source_platform: string | null;
  source_url: string | null;
  source_verified: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface ImpactMetric {
  label: string;
  value: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  storage_path: string | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface GalleryAlbum {
  id: string;
  name: string;
  description: string | null;
  event_id: string | null;
  cover_image_url: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  album_id: string | null;
  image_url: string;
  storage_path: string | null;
  title: string | null;
  caption: string | null;
  category: string;
  date: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  designation: string;
  bio: string | null;
  profile_image_url: string | null;
  letter_image_url: string | null;
  term: string;
  college_company: string | null;
  blood_group: string | null;
  is_executive: boolean;
  display_order: number;
  published: boolean;
  instagram_url: string | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebsiteContent {
  id: string;
  section: string;
  key: string;
  value: string | null;
  value_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  label: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// CAREERS & OPPORTUNITIES (Phase 25)
// ============================================================

export type CareerOpportunityType =
  | 'job'
  | 'internship'
  | 'volunteer'
  | 'project_role'
  | 'fellowship'
  | 'other';

export type CareerWorkMode = 'on_site' | 'remote' | 'hybrid';

export type CareerExperienceLevel =
  | 'entry_level'
  | 'intermediate'
  | 'mid_level'
  | 'senior_level'
  | 'not_applicable';

export type CareerStatus = 'draft' | 'published' | 'archived';

export interface Career {
  id: string;
  title: string;
  slug: string;
  organization_name: string;
  organization_website: string | null;
  organization_logo_url: string | null;
  opportunity_type: CareerOpportunityType;
  work_mode: CareerWorkMode;
  location: string | null;
  experience_level: CareerExperienceLevel | null;
  remuneration: string | null;
  application_deadline: string | null;
  application_url: string;
  application_label: string | null;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  preferred_skills: string | null;
  benefits: string | null;
  additional_information: string | null;
  contact_email: string | null;
  status: CareerStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export type CareerFormData = Omit<
  Career,
  'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'
>;

// ============================================================
// AUDIT LOG (Phase 24)
// ============================================================

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'ARCHIVE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'UPLOAD'
  | 'DELETE_IMAGE'
  | 'ROLE_CHANGE';

export type AuditEntityType =
  | 'event'
  | 'post'
  | 'project'
  | 'gallery_album'
  | 'gallery_image'
  | 'team_member'
  | 'profile'
  | 'site_setting'
  | 'website_content'
  | 'session'
  | 'career';

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  action: AuditAction;
  entity_type: AuditEntityType | null;
  entity_id: string | null;
  entity_name: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ============================================================
// UTILITY TYPES
// ============================================================

export type ContentStatus = 'draft' | 'published' | 'archived';

// Phase 24: super_admin is the highest privilege tier
export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

// Numeric levels for hierarchy checks (higher = more permissions)
export const ROLE_LEVEL: Record<UserRole, number> = {
  super_admin: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UploadedFile {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  error: string | null;
  url?: string;
  storagePath?: string;
}
