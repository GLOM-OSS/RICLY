import { Box } from '@mui/material';
import { theme } from '@ricly/theme';
import { useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import LogoutDialog from '../components/logout/logoutDialog';
import Navbar from '../components/navbar/Navbar';
import { useUser } from '../contexts/UserContextProvider';

export default function Layout() {
  const {
    user: { person_id },
  } = useUser();

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState<boolean>(false);

  return person_id === '' ? (
    <Navigate to="/" />
  ) : (
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
