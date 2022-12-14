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
      email: '',
      fullname: '',
      person_id: '',
      preferred_lang: 'fr',
      roles: [],
      gender: 'Male',
      phone_number: '',
    },
    selected_school: {
      api_calls_left: 0,
      api_calls_used: 0,
      api_key: '',
      api_test_key: '',
      school_acronym: '',
      school_code: '',
      school_name: '',
      test_api_calls_left: 0,
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
