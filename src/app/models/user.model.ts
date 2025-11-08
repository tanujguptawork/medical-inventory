export interface User {
  id?: string;
  username: string;
  email: string;
  role: 'admin' | 'pharmacist' | 'staff';
  name?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

