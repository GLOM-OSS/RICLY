import { Box, Typography } from '@mui/material';
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
    element: <Test />,
  },
  {
    path: '*',
    element: <Navigate to="/" />,
  },
];
