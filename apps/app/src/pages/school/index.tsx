import {
  FileDownloadOutlined,
  ReportRounded,
  SearchOutlined,
} from '@mui/icons-material';
import {
  Button,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import { random } from '@ricly/utils';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import SchoolCard from '../../components/schools/schoolCard';
import { useUser } from '../../contexts/UserContextProvider';
import { Scrollbars } from 'rc-scrollbars';
import ConfirmDeleteDialog from '../../components/schools/confirmDeleteDialog';
import AddSchoolDialog from '../../components/schools/addSchool';
import { CreateSchoolInterface, SchoolInterface } from '@ricly/interfaces';

export default function Schools() {
  const { formatMessage } = useIntl();
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
  const [areSchoolsLoading, setAreSchoolsLoading] = useState<boolean>(false);
  const [displaySchools, setDisplaySchools] = useState<SchoolInterface[]>([]);

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
        setAreSchoolsLoading(false);
        setDisplaySchools(newSchools);
      } else {
        const notif = new useNotification();
        notif.notify({ render: formatMessage({ id: 'loadingSchools' }) });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadSchools}
              notification={notif}
              // TODO: message should come from backend api
              message={formatMessage({ id: 'failedLoadingSchools' })}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  useEffect(() => {
    loadSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [searchValue, setSearchValue] = useState<string>('');
  useEffect(() => {
    setDisplaySchools(
      schools.filter(({ school_acronym, school_name }) => {
        return (
          school_acronym.includes(searchValue) ||
          school_name.includes(searchValue)
        );
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schools, searchValue]);

  const { userDispatch } = useUser();
  const navigate = useNavigate();

  const [deleting, setDeleting] = useState<boolean>(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    useState<boolean>(false);
  const [deletableSchool, setDeletableSchool] = useState<
    SchoolInterface | undefined
  >();

  const [notifications, setNotifications] = useState<
    { notif: useNotification; usage: string }[]
  >([]);

  const deleteSchool = () => {
    setDeleting(true);
    const notif = new useNotification();
    const newNotifications = notifications.filter(({ notif, usage }) => {
      if (usage === 'delete') notif.dismiss();
      return usage !== 'delete';
    });
    setNotifications([...newNotifications, { notif, usage: 'delete' }]);
    notif.notify({ render: formatMessage({ id: 'deleting' }) });
    setTimeout(() => {
      //TODO: CALL API HERE TO LOG USER OUT
      if (random() > 5) {
        loadSchools();
        notif.dismiss();
        setIsConfirmDeleteDialogOpen(false);
        setDeletableSchool(undefined);
      } else {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={deleteSchool}
              notification={notif}
              // TODO: message should come from backend api
              message={formatMessage({ id: 'errorDeleting' })}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
      setDeleting(false);
    }, 3000);
  };

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isCreatingSchool, setIsCreatingSchool] = useState<boolean>(false);

  const createSchool = (school: CreateSchoolInterface) => {
    setIsCreatingSchool(true);
    const notif = new useNotification();
    const newNotifications = notifications.filter(({ notif, usage }) => {
      if (usage === 'create') notif.dismiss();
      return usage !== 'create';
    });
    setNotifications([...newNotifications, { notif, usage: 'create' }]);
    notif.notify({ render: formatMessage({ id: 'creatingSchool' }) });
    setTimeout(() => {
      const submitSchool = {
        ...school,
        school_domain: `https://${school.school_domain}`,
      };
      // TODO: CALL API HERE TO CREATE SCHOOL WITH DATA submitSchool
      setIsCreatingSchool(false);
      if (random() > 5) {
        notif.update({
          render: formatMessage({ id: 'schoolCreatedSuccessfully' }),
        });
        // TODO: add new school to schools
      } else {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => {
                setIsCreateDialogOpen(false);
                createSchool(school);
              }}
              notification={notif}
              // TODO: message should come from backend api
              message={formatMessage({ id: 'failedToCreateSchool' })}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  return (
    <>
      <AddSchoolDialog
        closeDialog={() => setIsCreateDialogOpen(false)}
        handleSubmit={createSchool}
        isDialogOpen={isCreateDialogOpen}
      />
      {deletableSchool && (
        <ConfirmDeleteDialog
          closeDialog={() => {
            setIsConfirmDeleteDialogOpen(false);
            setDeletableSchool(undefined);
          }}
          deleteSchool={deleteSchool}
          deleting={deleting}
          isDialogOpen={isConfirmDeleteDialogOpen}
          school={deletableSchool}
        />
      )}
      <Box sx={{ height: '100%' }}>
        <Box
          sx={{
            display: 'grid',
            alignItems: 'end',
            gridTemplateColumns: 'auto 1fr',
            justifyItems: 'end',
            marginBottom: theme.spacing(3.75),
          }}
        >
          <Typography variant="h4">
            {formatMessage({ id: 'yourSchools' })}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            endIcon={<FileDownloadOutlined sx={{ color: 'white' }} />}
            sx={{ textTransform: 'none' }}
            disabled={isCreatingSchool}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            {formatMessage({ id: 'addSchool' })}
          </Button>
        </Box>
        <Box
          sx={{ display: 'grid', height: '100%', gridTemplateRows: 'auto 1fr' }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              alignItems: 'center',
              backgroundColor: theme.common.CSK200,
              padding: `0 ${theme.spacing(4.625)}`,
            }}
          >
            <Typography>{`${formatMessage({ id: 'schools' })} (${
              displaySchools.length
            })`}</Typography>
            <TextField
              size="small"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={formatMessage({ id: 'searchSchool' })}
              sx={{ m: 1, width: '25ch', backgroundColor:theme.common.white }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {<SearchOutlined />}
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Scrollbars style={{ height: '100%' }}>
            <Box>
              {areSchoolsLoading ? (
                <Box sx={{ display: 'grid', rowGap: theme.spacing(0.5) }}>
                  {[...new Array(5)].map((_, index) => (
                    <Skeleton
                      key={index}
                      height={50}
                      animation="wave"
                      sx={{
                        '&.MuiSkeleton-root': { transform: 'scale(1, 1)' },
                      }}
                    />
                  ))}
                </Box>
              ) : displaySchools.length === 0 ? (
                <Typography
                  sx={{ textAlign: 'center', marginTop: theme.spacing(5) }}
                >
                  {formatMessage({
                    id: searchValue !== '' ? 'noSearchMatch' : 'noSchools',
                  })}
                </Typography>
              ) : (
                displaySchools
                  .sort((a, b) => (a.school_name > b.school_name ? 1 : -1))
                  .map((school, index) => (
                    <SchoolCard
                      key={index}
                      deleteSchool={() => {
                        setDeletableSchool(school);
                        setIsConfirmDeleteDialogOpen(true);
                      }}
                      school={school}
                      onSelect={() => {
                        userDispatch({
                          type: 'SELECT_SCHOOL',
                          payload: { selected_school: school },
                        });
                        navigate(`/-/schools/${school.school_code}`);
                      }}
                    />
                  ))
              )}
            </Box>
          </Scrollbars>
        </Box>
      </Box>
    </>
  );
}
