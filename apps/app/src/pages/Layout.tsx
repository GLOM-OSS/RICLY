import { Box } from '@mui/material';
import { getUserInfo } from '@ricly/auth';
import { theme } from '@ricly/theme';
import { useNotification } from '@ricly/toast';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Outlet, useNavigate } from 'react-router';
import LogoutDialog from '../components/logout/logoutDialog';
import Navbar from '../components/navbar/Navbar';
import { useUser } from '../contexts/UserContextProvider';

export default function Layout() {
  const navigate = useNavigate();
  const { userDispatch } = useUser();
  const { formatMessage } = useIntl();

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    getUserInfo()
      .then((user) => {
        userDispatch({ type: 'LOAD_USER', payload: { user } });
      })
      .catch((error) => {
        const notif = new useNotification();
        notif.notify({
          render: formatMessage({ id: 'authenticatingUser' }),
        });
        notif.update({
          type: 'ERROR',
          render: error?.message || formatMessage({ id: 'authenticatingUser' }),
        });
        navigate('/');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <LogoutDialog
        closeDialog={() => setIsLogoutDialogOpen(false)}
        isDialogOpen={isLogoutDialogOpen}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
          rowGap: theme.spacing(6.25),
          backgroundColor: theme.common.lowerGray,
          height: '100vh',
        }}
      >
        <Navbar logout={() => setIsLogoutDialogOpen(true)} />
        <Box sx={{ padding: `${theme.spacing(2)} ${theme.spacing(12)}` }}>
          <Outlet />
        </Box>
      </Box>
    </>
  );
}
