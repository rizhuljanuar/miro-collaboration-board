export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
