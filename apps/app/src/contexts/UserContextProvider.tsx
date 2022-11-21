import { Reducer, useContext, useReducer } from 'react';
import UserContext, {
  DispatchInterface,
  SelectedSchool,
  UserAction,
  UserInterface,
} from './userContext';

const userReducer: Reducer<
  UserInterface & SelectedSchool & DispatchInterface,
  UserAction
> = (
  state: UserInterface & SelectedSchool & DispatchInterface,
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
    case 'SELECT_SCHOOL': {
      return { ...state, selected_school: action.payload.selected_school };
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
  const initialState: UserInterface & SelectedSchool & DispatchInterface = {
    user: {
      created_at: new Date(),
      email: 'lorraintchakoumi@gmail.com',
      fullname: 'Lorrain Tchakoumi Kouatchoua',
      person_id: 'lksikelsie',
      preferred_lang: 'fr',
      roles: [],
      gender: 'Male',
      phone_number: '657140183',
    },
    selected_school: {
      api_calls_left: 20,
      api_calls_used: 200,
      api_key: 'kskdksis',
      api_test_key: 'kdksowkekd',
      school_acronym: 'UdM',
      school_code: 'skdk',
      school_name: 'Universite des montagnes',
      test_api_calls_left: 10,
    },
    userDispatch: () => null,
  };

  const [userState, userDispatch] = useReducer(userReducer, initialState);
  const value = {
    ...(userState as UserInterface & SelectedSchool),
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
