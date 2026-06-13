export type UserRole = 'employee' | 'admin';

export interface User {
  id: string;
  name: string;
  avatar: string;
  dept: string;
  role: UserRole;
  phone: string;
}
