import { Google, ReportRounded } from '@mui/icons-material';
import { Box, Button, lighten, Typography } from '@mui/material';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import { random } from '@ricly/utils';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import Logo from '../assets/Logo.png';
import { useNavigate } from 'react-router';

const ExternalLink = ({ children, to }: { to: string; children: string }) => {
  return (
    <Typography
      variant="body2"
      component="a"
      href={to}
      rel="noreferrer"
      sx={{
        color: 'black',
        transition: 'color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        position: 'relative',
        marginInline: '4px',
        textDecoration: 'none',
        height: 'fit-content',
        justifySelf: 'center',
        display: 'grid',
        alignItems: 'baseline',
        gridAutoFlow: 'column',
        '&::after': {
          position: 'absolute',
          bottom: '-11px',
          left: '0px',
          right: '0px',
          transform: 'scaleX(1.25)',
          content: '""',
          height: '0px',
          backgroundColor: theme.palette.secondary.main,
          borderRadius: '100px 100px 0px 0px',
        },
        '&:hover': {
          color: lighten(theme.palette.secondary.main, 0.3),
        },
        '& .icon': { visibility: 'hidden' },
        '&:hover .icon': {
          visibility: 'visible',
        },
        '&:hover::after': {},
        '&.active': {
          color: theme.palette.secondary.main,
        },
        '&.active::after': {
          height: '4px',
        },
      }}
    >
      {children}
    </Typography>
  );
};

export function Auth({ app = 'app' }: { app?: string }) {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();

  const [isAuthenticatingUser, setIsAuthenticatingUser] =
    useState<boolean>(false);
  const authenticateUser = () => {
    const notif = new useNotification();
    setIsAuthenticatingUser(true);
    notif.notify({
      render: formatMessage({ id: 'authenticatingUser' }),
    });
    setTimeout(() => {
      if (app === 'app') {
        // TODO: CALL API TO CONNECT DEVELOPER WITH GOOGLE
        if (random() > 5) {
          navigate('/schools');
          notif.dismiss();
        } else {
          notif.update({
            type: 'ERROR',
            render: (
              <ErrorMessage
                retryFunction={authenticateUser}
                notification={notif}
                // TODO: message should come from backend api
                message={formatMessage({ id: 'authenticationFailed' })}
              />
            ),
            autoClose: false,
            icon: () => <ReportRounded fontSize="medium" color="error" />,
          });
          setIsAuthenticatingUser(false);
        }
      } else {
        // TODO: CALL API TO CONNECT SCHOOL PERNNEL WITH GOOGLE HERE.
        if (random() > 5) {
          navigate('/dashboard');
          notif.dismiss();
        } else {
          notif.update({
            type: 'ERROR',
            render: (
              <ErrorMessage
                retryFunction={authenticateUser}
                notification={notif}
                // TODO: message should come from backend api
                message={formatMessage({ id: 'authenticationFailed' })}
              />
            ),
            autoClose: false,
            icon: () => <ReportRounded fontSize="medium" color="error" />,
          });
          setIsAuthenticatingUser(false);
        }
      }
    }, 3000);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.common.CSK50,
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
      }}
    >
      <img
        src={Logo}
        alt={'RICLY'}
        style={{
          height: '100px',
          width: '100px',
          marginLeft: theme.spacing(12),
          marginTop: theme.spacing(5),
        }}
      />
      <Box
        sx={{
          alignSelf: 'center',
          justifySelf: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" sx={{ fontWeight: 900 }}>
          {formatMessage({
            id: app === 'app' ? 'useDeveloperAccount' : 'signIn',
          })}
        </Typography>
        <Typography sx={{ marginTop: theme.spacing(2) }}>
          {formatMessage({
            id: app === 'app' ? 'developerSignInCaption' : 'signInCaption',
          })}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ marginTop: theme.spacing(7), textTransform: 'none' }}
          startIcon={<Google fontSize="large" sx={{ color: 'white' }} />}
          onClick={authenticateUser}
          disabled={isAuthenticatingUser}
        >
          {formatMessage({
            id: app === 'app' ? 'authenticateWithGoogle' : 'signInWithGoogle',
          })}
        </Button>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          columnGap: theme.spacing(2),
          padding: `${theme.spacing(1)} ${theme.spacing(12)}`,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto auto',
            columnGap: theme.spacing(2),
          }}
        >
          <Typography variant="caption">Copyright RICLY@2022</Typography>
          <Typography variant="caption">Licenced under GNU AGPLv3</Typography>
        </Box>
        <Box
          sx={{
            justifySelf: 'end',
            display: 'grid',
            gridTemplateColumns: 'auto auto',
            columnGap: theme.spacing(2),
          }}
        >
          <ExternalLink
            to={
              'https://www.figma.com/file/VhtjscZ9QpvMMVmM2BEe8J/RICLY?node-id=66%3A91&t=Yu9Heut8hzfaQtbw-1'
            }
          >
            Figma
          </ExternalLink>
          <ExternalLink to={'https://discord.gg/UHy7nTc5bC'}>
            Discord
          </ExternalLink>
        </Box>
      </Box>
    </Box>
  );
}

export default Auth;
