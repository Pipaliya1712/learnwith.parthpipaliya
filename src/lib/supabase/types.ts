export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: "admin" | "developer";
  is_blocked: boolean;
  email_verified: boolean;
  email_otp: string | null;
  email_otp_expires_at: string | null;
  password_hash: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  live_link: string | null;
  repo_link: string;
  additional_info: string | null;
  is_visible: boolean;
  is_deleted: boolean;
  landing_page_order: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectImage = {
  id: string;
  project_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  created_at: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type Feature = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  display_order: number;
};

export type Improvement = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  display_order: number;
};

export type Bug = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  severity: "low" | "medium" | "high" | "critical";
  display_order: number;
};

export type Comment = {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      projects: { Row: Project; Insert: Partial<Project>; Update: Partial<Project> };
      project_images: { Row: ProjectImage; Insert: Partial<ProjectImage>; Update: Partial<ProjectImage> };
      tags: { Row: Tag; Insert: Partial<Tag>; Update: Partial<Tag> };
      features: { Row: Feature; Insert: Partial<Feature>; Update: Partial<Feature> };
      improvements: { Row: Improvement; Insert: Partial<Improvement>; Update: Partial<Improvement> };
      bugs: { Row: Bug; Insert: Partial<Bug>; Update: Partial<Bug> };
      comments: { Row: Comment; Insert: Partial<Comment>; Update: Partial<Comment> };
    };
  };
};
