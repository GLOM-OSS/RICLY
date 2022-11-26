import { Auth } from '@ricly/auth';
import { Navigate } from 'react-router';
import Integrations from '../components/integrations/integrations';
import { useUser } from '../contexts/UserContextProvider';
import Dashboard from '../pages/dashboard';
import Layout from '../pages/Layout';
import Schools from '../pages/school';

const AuthPage = () => {
  const { userDispatch } = useUser();
  return (
    <Auth
      updateUserContext={(user) =>
        userDispatch({ type: 'LOAD_USER', payload: { user } })
      }
    />
  );
};

export const routes = [
  {
    path: '/',
    element: <AuthPage />,
  },
  {
    path: '-',
    element: <Layout />,
    children: [
      { path: 'schools', element: <Schools /> },
      { path: ':school_code', element: <Navigate to="dashboard" /> },
      {
        path: ':school_code',
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'integrations', element: <Integrations /> },
        ],
      },
    ],
  },
  //   {
  //     path: '*',
  //     element: <Navigate to="/" />,
  //   },
];
