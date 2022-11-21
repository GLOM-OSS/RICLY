import { SchoolInterface, User } from '@ricly/interfaces';
import React, { createContext } from 'react';

export type UserAction =
  | { type: 'LOAD_USER'; payload: { user: User } }
  | { type: 'CLEAR_USER' };

export interface DispatchInterface {
  userDispatch: React.Dispatch<UserAction>;
}

export interface UserInterface {
  user: User;
}

export interface SelectedSchool {
  selected_school?: SchoolInterface;
}

const UserContext = createContext<
  UserInterface & DispatchInterface
>({
  user: {
    created_at: new Date(),
    email: 'lorraintchakoumi@gmail.com',
    fullname: 'Lorrain Tchakoumi Kouatchoua',
    person_id: 'lksikelsie',
    preferred_lang: 'en',
    roles: [],
    gender: 'Male',
    phone_number: '657140183',
  },
  userDispatch: () => {
    alert("Hellom I'm alive ");
  },
});

export default UserContext;
