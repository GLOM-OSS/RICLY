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
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import { random } from '@ricly/utils';
import { SchoolInterface } from 'libs/interfaces/src';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import Logo from '../../assets/Logo.png';
import { useUser } from '../../contexts/UserContextProvider';
import NavItem from './navItem';

export default function Navbar({ logout }: { logout: () => void }) {
  const {
    selected_school,
    userDispatch,
    user: { person_id },
  } = useUser();

  const [isSchoolMenuOpen, setIsSchoolMenuOpen] = useState<boolean>(false);
  const [schools, setSchools] = useState<SchoolInterface[]>([
    {
      api_calls_left: 20,
      api_calls_used: 200,
      api_key: 'kskdksis',
      api_test_key: 'kdksowkekd',
      school_acronym: 'UdM',
      school_code: 'skdk',
      school_name: 'Universite des montagnes',
      test_api_calls_left: 10,
    },
  ]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [areSchoolsLoading, setAreSchoolsLoading] = useState<boolean>(false);

  const loadSchools = () => {
    setAreSchoolsLoading(true);
    setTimeout(() => {
      // TODO: LOAD person_id's SCHOOLS DATA INTO SCHOOLS state for nav bar to swap schools.
      if (random() > 5) {
        const newSchools: SchoolInterface[] = [
          {
            api_calls_left: 20,
            api_calls_used: 200,
            api_key: 'kskdksis',
            api_test_key: 'kdksowkekd',
            school_acronym: 'UdM',
            school_code: 'skdk',
            school_name: 'Universite des montagnes',
            test_api_calls_left: 10,
          },
        ];
        setSchools(newSchools);
      } else {
        const notif = new useNotification();
        notif.notify({ render: formatMessage({ id: 'loadingSchools' }) });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadSchools}
              notification={notif}
              message={formatMessage({ id: 'failedLoadingSchools' })}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  const navigate = useNavigate();
  useEffect(() => {
    if (person_id) {
      loadSchools();
    } else navigate('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { formatMessage } = useIntl();

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
                    setIsSchoolMenuOpen(false);
                    setAnchorEl(null);
                  }}
                >
                  {school_acronym}
                </MenuItem>
              );
            })}
          </Menu>
          <NavItem to="dashboard">{formatMessage({ id: 'dashboard' })}</NavItem>
          <NavItem to="integrations">
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
