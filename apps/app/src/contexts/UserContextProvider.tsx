import { User } from 'libs/interfaces/src';
import { useReducer, useContext, Reducer } from 'react';
import UserContext, { DispatchInterface, UserAction } from './userContext';

const userReducer: Reducer<User & DispatchInterface, UserAction> = (
  state: User & DispatchInterface,
  action: UserAction
) => {
  alert('combi');
  switch (action.type) {
    case 'CLEAR_USER': {
      return {
        ...state,
        created_at: new Date(),
        email: '',
        fullname: '',
        person_id: '',
        preferred_lang: 'en',
        roles: [],
      };
    }
    case 'LOAD_USER': {
      return { ...state, ...action.payload.user };
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
  const initialState: User & DispatchInterface = {
    created_at: new Date(),
    email: 'lorraintchakoumi@gmail.com',
    fullname: 'Lorrain Tchakoumi Kouatchoua',
    person_id: 'lksikelsie',
    preferred_lang: 'fr',
    roles: [],
    gender: 'Male',
    phone_number: '657140183',
    userDispatch: () => null,
  };

  const [userState, userDispatch] = useReducer(userReducer, initialState);
  const value = {
    ...(userState as User),
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
