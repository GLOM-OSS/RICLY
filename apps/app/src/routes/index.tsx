import { Box, Typography } from '@mui/material';
import { Auth } from '@ricly/auth';
import { useIntl } from 'react-intl';
import { Navigate } from 'react-router';

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
    path: '*',
    element: <Navigate to="/" />,
  },
];
