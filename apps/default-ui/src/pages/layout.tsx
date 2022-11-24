import { FileDownloadOutlined } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { theme } from '@ricly/theme';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Outlet } from 'react-router';
import Logo from '../assets/Logo.png';
import LogoutDialog from '../components/logout/logoutDialog';
import NavItem from '../components/NavItem';
import { useUser } from '../contexts/UserContextProvider';

export default function Layout() {
  const { formatMessage } = useIntl();
  const {
    user: { roles },
  } = useUser();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState<boolean>(false);
  const secNav = [
    'dashboard',
    'halls',
    'teachers',
    'classrooms',
    'subjects',
    'students',
  ];
  const coordoNav = ['timetables'];
  const teacherNav = ['availabilities', 'schedules'];
  const [finalNav, setFinalNav] = useState<string[]>([]);

  useEffect(() => {
    const resp = roles.map(({ role }) => {
      switch (role) {
        case 'TEACHER': {
          return teacherNav;
        }
        case 'SECRETARY': {
          return secNav;
        }
        case 'COORDINATOR': {
          return coordoNav;
        }
        default:
          return [];
      }
    });
    const newNav: string[] = [];
    resp.forEach((_) => {
      newNav.push(..._);
    });
    setFinalNav(newNav);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles]);

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
              gridTemplateRows: `${[...new Array(finalNav.length)]
                .map((_) => 'auto')
                .join(' ')} 1fr`,
              rowGap: theme.spacing(4),
              padding: `${theme.spacing(1)} ${theme.spacing(4.625)}`,
            }}
          >
            {finalNav.map((_, index) => (
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
          <Scrollbars>
            <Outlet />
          </Scrollbars>
        </Box>
      </Box>
    </>
  );
}
