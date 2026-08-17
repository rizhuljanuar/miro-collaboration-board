export type ProjectRole = 'owner' | 'editor' | 'viewer';

export interface ProjectOwner {
  id: number;
  name: string;
  avatar_url: string | null;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  role?: ProjectRole;
  owner?: ProjectOwner;
  members_count?: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: string;
  to: string | null;
  total: number;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}
