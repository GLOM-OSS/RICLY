import { http } from '@ricly/axios';

export function googleSignin() {
  return http.get('/auth/google-signin');
}