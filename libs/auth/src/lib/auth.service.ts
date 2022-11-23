import { http } from '@ricly/axios';
import { User } from '@ricly/interfaces';

export function logOut() {
  return http.get(`/auth/close`);
}

export async function customAuthentication(user: { email: string; fullname: string; }) {
  const { data } = await http.post<User>(`/auth/app-signin`, user);
  return data;
}
