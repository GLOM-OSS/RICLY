export interface ChangePasswordInterface {
  password?: string;
  new_promise: string;
}

export interface SignInInterface {
  email: string;
  password: string;
}

export type Lang = 'en' | 'fr';
export type Gender = 'Male' | 'Female';

export enum Role {
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
  
  TEACHER = 'TEACHER',
  SECRETARY = 'SECRETARY',
  COORDINATOR = 'COORDINATOR',
}
export type UserRole = {
  user_id: string;
  role: Role;
};

export interface User {
  person_id: string;
  fullname: string;
  phone_number?: string;
  gender?: Gender;
  email: string;
  preferred_lang: Lang;
  created_at: Date;
  roles: UserRole[];
}
