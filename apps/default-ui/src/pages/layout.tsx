import { FileDownloadOutlined } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { theme } from '@ricly/theme';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Outlet } from 'react-router';
import Logo from '../assets/Logo.png';
import LogoutDialog from '../components/logout/logoutDialog';
import NavItem from '../components/NavItem';

export default function Layout() {
  const { formatMessage } = useIntl();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState<boolean>(false);
  return (
    <>
      <LogoutDialog
        closeDialog={() => setIsLogoutDialogOpen(false)}
        isDialogOpen={isLogoutDialogOpen}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          height: '100vh',
          width: '100vw',
          backgroundColor: theme.common.lowerGray,
        }}
      >
        <Box
          sx={{
            backgroundColor: theme.common.white,
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            rowGap: theme.spacing(7),
          }}
        >
          <Box
            sx={{
              borderBottom: `1px solid ${theme.common.lighterPrimary}`,
              padding: `${theme.spacing(1)} ${theme.spacing(4.625)}`,
            }}
          >
            <img src={Logo} alt="RICLY" style={{ height: 100, width: 100 }} />
          </Box>
          <Box
            sx={{
              display: 'grid',
              justifyItems: 'start',
              gridTemplateRows: 'auto auto auto auto auto auto 1fr',
              rowGap: theme.spacing(4),
              padding: `${theme.spacing(1)} ${theme.spacing(4.625)}`,
            }}
          >
            {[
              'dashboard',
              'halls',
              'teachers',
              'classrooms',
              'subjects',
              'students',
            ].map((_, index) => (
              <NavItem key={index} to={_}>
                {formatMessage({ id: _ })}
              </NavItem>
            ))}
          </Box>
          <Box sx={{ padding: `${theme.spacing(1)} ${theme.spacing(4.625)}` }}>
            <Button
              onClick={() => setIsLogoutDialogOpen(true)}
              variant="text"
              sx={{
                ...theme.typography.h6,
                textTransform: 'none',
                color: theme.common.primaryDark,
              }}
              color="primary"
              endIcon={
                <FileDownloadOutlined
                  sx={{
                    color: theme.common.primaryDark,
                    transform: 'rotate(-90deg)',
                  }}
                />
              }
            >
              {formatMessage({ id: 'logout' })}
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            margin: `0 ${theme.spacing(5.25)}`,
            padding: `${theme.spacing(3.125)} 0`,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </>
  );
}
