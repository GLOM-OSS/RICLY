import { Box, Typography } from '@mui/material';
import { Auth } from '@ricly/auth';
import { useIntl } from 'react-intl';
import { Navigate, useParams } from 'react-router';
import Integrations from '../components/integrations/integrations';
import Dashboard from '../pages/dashboard';
import Layout from '../pages/Layout';
import Schools from '../pages/school';

export const Test = () => {
  const { school_code } = useParams();
  const { formatMessage } = useIntl();
  return (
    <Box>
      <Typography>{school_code}</Typography>
    </Box>
  );
};

export const routes = [
  {
    path: '/',
    element: <Auth />,
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
