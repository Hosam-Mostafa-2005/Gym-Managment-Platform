export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // هنظبطها بعدين لما نوحد الـ Roles
}

export interface LoginResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}
