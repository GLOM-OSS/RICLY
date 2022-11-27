import {
  FileDownloadOutlined,
  KeyboardArrowDownOutlined,
  ReportRounded,
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { SchoolInterface } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import Logo from '../../assets/Logo.png';
import { useUser } from '../../contexts/UserContextProvider';
import { findSchools } from '../../services/school.service';
import NavItem from './navItem';

export default function Navbar({ logout }: { logout: () => void }) {
  const { selected_school, userDispatch } = useUser();

  const [isSchoolMenuOpen, setIsSchoolMenuOpen] = useState<boolean>(false);
  const [schools, setSchools] = useState<SchoolInterface[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [areSchoolsLoading, setAreSchoolsLoading] = useState<boolean>(false);

  const loadSchools = () => {
    setAreSchoolsLoading(true);
    findSchools()
      .then((schools) => {
        setSchools(schools);
        userDispatch({
          type: 'SELECT_SCHOOL',
          payload: { selected_school: schools[0] },
        });
        setAreSchoolsLoading(false);
      })
      .catch((error) => {
        const notif = new useNotification();
        notif.notify({ render: formatMessage({ id: 'loadingSchools' }) });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadSchools}
              notification={notif}
              message={
                error?.message || formatMessage({ id: 'failedLoadingSchools' })
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  useEffect(() => {
    if (selected_school) {
      loadSchools();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { formatMessage } = useIntl();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        columnGap: theme.spacing(3),
        alignItems: 'center',
        backgroundColor: theme.common.white,
        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
        padding: `${theme.spacing(2)} ${theme.spacing(12)}`,
        justifyItems: 'end',
      }}
    >
      <img
        src={Logo}
        alt={'RICLY'}
        style={{
          height: '70px',
          width: '70px',
        }}
      />
      {selected_school ? (
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            columnGap: theme.spacing(1),
            alignItems: 'center',
          }}
        >
          <Box
            onClick={(event) => {
              if (!areSchoolsLoading) {
                setAnchorEl(event.currentTarget);
                setIsSchoolMenuOpen(true);
              }
            }}
            sx={{
              display: 'grid',
              gridAutoFlow: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: theme.common.primaryDark }}
            >{`(${
              areSchoolsLoading
                ? formatMessage({ id: 'loading' })
                : selected_school.school_acronym
            })`}</Typography>
            <KeyboardArrowDownOutlined
              sx={{
                fontSize: 30,
                color: theme.common.primaryDark,
              }}
            />
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={isSchoolMenuOpen}
            onClose={() => {
              setIsSchoolMenuOpen(false);
              setAnchorEl(null);
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            {schools.map((school) => {
              const { school_acronym } = school;
              return (
                <MenuItem
                  onClick={() => {
                    userDispatch({
                      type: 'SELECT_SCHOOL',
                      payload: { selected_school: school },
                    });
                    navigate(`/-/${school.school_code}`);
                    setIsSchoolMenuOpen(false);
                    setAnchorEl(null);
                  }}
                >
                  {school_acronym}
                </MenuItem>
              );
            })}
          </Menu>
          <NavItem to={`/-/${selected_school.school_code}/dashboard`}>
            {formatMessage({ id: 'dashboard' })}
          </NavItem>
          <NavItem to={`/-/${selected_school.school_code}/integrations`}>
            {formatMessage({ id: 'integrations' })}
          </NavItem>
          <Tooltip arrow title={formatMessage({ id: 'logout' })}>
            <IconButton size="small" onClick={logout}>
              <FileDownloadOutlined
                sx={{
                  fontSize: 30,
                  color: theme.common.primaryDark,
                  transform: 'rotate(-90deg)',
                }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Tooltip arrow title={formatMessage({ id: 'logout' })}>
          <IconButton size="small" onClick={logout}>
            <FileDownloadOutlined
              sx={{
                fontSize: 30,
                color: theme.common.primaryDark,
                transform: 'rotate(-90deg)',
              }}
            />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
