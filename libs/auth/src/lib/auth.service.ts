import { http } from '@ricly/axios';

export function logOut() {
  return http.get(`/auth/close`);
}
