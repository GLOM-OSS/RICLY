import { Box, Typography } from '@mui/material';
import { Auth } from '@ricly/auth';
import { useIntl } from 'react-intl';
import { Navigate } from 'react-router';
import Layout from '../pages/Layout';
import Schools from '../pages/school';

export const Test = () => {
  const { formatMessage } = useIntl();
  return (
    <Box>
      <Typography>{formatMessage({ id: 'hello' })}</Typography>
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
    children: [{ path: 'schools', element: <Schools /> }],
  },
  //   {
  //     path: '*',
  //     element: <Navigate to="/" />,
  //   },
];
