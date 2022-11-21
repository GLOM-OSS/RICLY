import { lighten, styled } from '@mui/material';
import { theme } from '@ricly/theme';
import { NavLink } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NavItem: any = styled(NavLink)(() => ({
  ...theme.typography.h6,
  color: theme.common.primaryDark,
  transition: 'color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  position: 'relative',
  marginInline: '4px',
  textDecoration: 'none',
  height: 'fit-content',
  '&::before': {
    transition: '0.2s',
    position: 'absolute',
    left: '0px',
    bottom: '0px',
    content: '""',
    height: '100%',
    backgroundColor: theme.common.primaryDark,
  },
  '&:hover': {
    color: lighten(theme.palette.primary.main, 0.3),
  },
  '&.active': {
    transition: '0.2s',
    backgroundColor: lighten(theme.palette.primary.light, 0.6),
    padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
  },
  '&.active::before': {
    width: '4px',
  },
}));

export default NavItem;
