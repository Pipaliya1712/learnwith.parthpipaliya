import { cookies } from "next/headers";
import type { Profile } from "@/types";

const FASTAPI_BASE = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";

async function fetchFromApi(endpoint: string, cacheConfig: RequestInit = { cache: "no-store" }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("learnwith_jwt")?.value;
  
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  try {
    const res = await fetch(`${FASTAPI_BASE}${endpoint}`, {
      ...cacheConfig,
      headers: {
        ...cacheConfig.headers,
        ...headers
      },
    });
    
    if (!res.ok) {
      console.error(`API Error on ${endpoint}: ${res.status} ${res.statusText}`);
      return null;
    }
    
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return null;
  }
}

export async function getCurrentUserServer(): Promise<Profile | null> {
  const data = await fetchFromApi("/auth/me");
  return data as Profile | null;
}

export async function getLandingProjectsServer() {
  const data = await fetchFromApi("/projects/landing", { next: { revalidate: 60 } });
  return data || { projects: [], tags: [] };
}

export async function getDashboardProjectsServer() {
  const data = await fetchFromApi("/projects/dashboard?skip=0&limit=12");
  return data || { projects: [], total: 0, page: 1 };
}

export async function getAdminProjectsServer(params: { [key: string]: string | string[] | undefined } = {}) {
  const query = new URLSearchParams();

  const page = parseInt((params.page as string) || "1");
  const limit = parseInt((params.limit as string) || "10");
  query.set("skip", ((page - 1) * limit).toString());
  query.set("limit", limit.toString());

  if (params.sort_by) query.set("sort_by", params.sort_by as string);
  if (params.sort_desc) query.set("sort_desc", params.sort_desc as string);
  if (params.q_name) query.set("name", params.q_name as string);
  if (params.q_status) query.set("status", params.q_status as string);

  const data = await fetchFromApi(`/projects/admin?${query.toString()}`);
  return data || { projects: [], total: 0, page: 1 };
}

export async function getProjectBySlugServer(slug: string) {
  const data = await fetchFromApi(`/projects/slug/${slug}`);
  return data;
}

export async function getProjectByIdServer(id: string) {
  const data = await fetchFromApi(`/projects/id/${id}`);
  return data;
}

export async function getAdminUsersServer(params: { [key: string]: string | string[] | undefined } = {}) {
  const query = new URLSearchParams();

  const page = parseInt((params.page as string) || "1");
  const limit = parseInt((params.limit as string) || "10");
  query.set("skip", ((page - 1) * limit).toString());
  query.set("limit", limit.toString());

  if (params.sort_by) {
    query.set("sort_by", params.sort_by === "user" ? "display_name" : params.sort_by as string);
  }
  if (params.sort_desc) query.set("sort_desc", params.sort_desc as string);
  if (params.q_user) query.set("user", params.q_user as string);
  if (params.q_role) query.set("role", params.q_role as string);
  if (params.q_status) query.set("status", params.q_status as string);

  const data = await fetchFromApi(`/users?${query.toString()}`);
  return data || { users: [], total: 0, page: 1 };
}

export async function getAdminCommentsServer(params: { [key: string]: string | string[] | undefined } = {}) {
  const query = new URLSearchParams();
  
  const page = parseInt(params.page as string || "1");
  const limit = parseInt(params.limit as string || "10");
  query.set("skip", ((page - 1) * limit).toString());
  query.set("limit", limit.toString());
  
  if (params.sort_by) query.set("sort_by", params.sort_by as string);
  if (params.sort_desc) query.set("sort_desc", params.sort_desc as string);
  
  if (params.q_content) query.set("content", params.q_content as string);
  if (params.q_user_email) query.set("user_email", params.q_user_email as string);
  if (params.q_project_name) query.set("project_name", params.q_project_name as string);
  if (params.q_status) query.set("status", params.q_status as string);

  const data = await fetchFromApi(`/comments/admin?${query.toString()}`);
  return data || { data: [], total: 0, page: 1 };
}

export async function getUserProfileServer(userId: string) {
  const data = await fetchFromApi(`/users/${userId}/profile`);
  return data;
}

export async function getTagsServer() {
  const data = await fetchFromApi("/projects/tags");
  return data || [];
}

export async function getChallengeBySlugServer(slug: string) {
  const data = await fetchFromApi(`/challenges/${slug}`);
  // Return mock data for UI testing since backend is pending
  if (!data) {
    return {
      id: "mock-uuid",
      title: "Implement Room Validation",
      slug: slug,
      description: "In this challenge, you will implement validation logic for room dimensions in the Floor Planner project.\n\nYou need to ensure that:\n- Width and height are positive.\n- The room area does not exceed 10,000 sq ft.\n- The coordinates do not overlap existing walls.",
      acceptance_criteria: "- All unit tests must pass.\n- Error messages must be user-friendly.\n- Code must be properly typed.",
      difficulty: "beginner",
      points: 10,
      estimated_hours: 4,
      status: "published",
      project: { id: "proj-1", name: "Floor Planner", slug: "floor-planner" },
      tags: [{ id: "tag-1", name: "React" }, { id: "tag-2", name: "Validation" }]
    };
  }
  return data;
}

export async function getChallengesServer(params: { [key: string]: string | string[] | undefined } = {}) {
  const query = new URLSearchParams();
  const page = parseInt((params.page as string) || "1");
  const limit = parseInt((params.limit as string) || "12");
  query.set("skip", ((page - 1) * limit).toString());
  query.set("limit", limit.toString());

  const data = await fetchFromApi(`/challenges?${query.toString()}`);
  
  if (!data) {
    // Mock data for UI layout
    return {
      items: [
        {
          id: "mock-1",
          title: "Implement Room Validation",
          slug: "implement-room-validation",
          description: "Ensure that room dimensions are positive and area does not exceed limits.",
          difficulty: "beginner",
          points: 10,
          status: "published",
          project: { name: "Floor Planner" }
        },
        {
          id: "mock-2",
          title: "Setup JWT Authentication",
          slug: "setup-jwt-auth",
          description: "Implement secure JWT token handling, login routes, and middleware.",
          difficulty: "intermediate",
          points: 25,
          status: "published",
          project: { name: "Task Manager" }
        },
        {
          id: "mock-3",
          title: "Optimize Search Queries",
          slug: "optimize-search-queries",
          description: "Refactor PostgreSQL queries to utilize trigram indexes for faster search.",
          difficulty: "advanced",
          points: 50,
          status: "published",
          project: { name: "CRM System" }
        }
      ],
      total: 3,
      page: 1,
      limit: 12
    };
  }
  return data || { items: [], total: 0, page: 1, limit: 12 };
}

