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
    email: '',
    fullname: '',
    person_id: '',
    preferred_lang: 'en',
    roles: [],
    gender: 'Male',
    phone_number: '',
  },
  userDispatch: () => null
});

export default UserContext;
