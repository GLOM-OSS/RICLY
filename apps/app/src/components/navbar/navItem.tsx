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
  justifySelf: 'center',
  '&::after': {
    position: 'absolute',
    bottom: '-11px',
    left: '0px',
    right: '0px',
    transform: 'scaleX(1.25)',
    content: '""',
    height: '0px',
    backgroundColor: theme.common.primaryDark,
    // borderRadius: '100px 100px 0px 0px',
  },
  '&:hover': {
    color: lighten(theme.palette.primary.main, 0.2),
  },
  '&:hover::after': {},
  '&.active': {
    color: theme.common.primaryDark,
  },
  '&.active::after': {
    height: '4px',
  },
}));

export default NavItem;
