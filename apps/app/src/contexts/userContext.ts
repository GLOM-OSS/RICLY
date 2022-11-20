import { User } from 'libs/interfaces/src';
import React, { createContext } from 'react';

export type UserAction =
  | { type: 'LOAD_USER'; payload: { user: User } }
  | { type: 'CLEAR_USER' };

export interface DispatchInterface {
  userDispatch: React.Dispatch<UserAction>;
}

const UserContext = createContext<User & DispatchInterface>({
  created_at: new Date(),
  email: 'lorraintchakoumi@gmail.com',
  fullname: 'Lorrain Tchakoumi Kouatchoua',
  person_id: 'lksikelsie',
  preferred_lang: 'en',
  roles: [],
  gender: 'Male',
  phone_number: '657140183',
  userDispatch: () => {
    alert("Hellom I'm alive ");
  },
});

export default UserContext;
