import { Role } from '@ricly/interfaces';
import { Reducer, useContext, useReducer } from 'react';
import UserContext, {
  DispatchInterface,
  UserAction,
  UserInterface,
} from './userContext';

const userReducer: Reducer<UserInterface & DispatchInterface, UserAction> = (
  state: UserInterface & DispatchInterface,
  action: UserAction
) => {
  switch (action.type) {
    case 'CLEAR_USER': {
      return {
        ...state,
        user: {
          created_at: new Date(),
          email: '',
          fullname: '',
          person_id: '',
          preferred_lang: 'en',
          roles: [],
        },
        selected_school: undefined,
      };
    }
    case 'LOAD_USER': {
      return { ...state, user: action.payload.user };
    }
    default:
      return state;
  }
};

function UserContextProvider({
  children,
}: {
  children: JSX.Element | React.ReactNode;
}): JSX.Element {
  const initialState: UserInterface & DispatchInterface = {
    user: {
      created_at: new Date(),
      email: 'lorraintchakoumi@gmail.com',
      fullname: 'Lorrain Tchakoumi Kouatchoua',
      person_id: 'lksikelsie',
      preferred_lang: 'fr',
      roles: [
        { user_id: 'skdk', role: Role.SECRETARY },
        { user_id: 'skdk', role: Role.TEACHER },
      ],
      gender: 'Male',
      phone_number: '657140183',
    },
    userDispatch: () => null,
  };

  const [userState, userDispatch] = useReducer(userReducer, initialState);
  const value = {
    ...(userState as UserInterface),
    userDispatch,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export default UserContextProvider;

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used as a descendant of UserProvider');
  } else return context;
};
