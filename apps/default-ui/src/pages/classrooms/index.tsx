import {
    AddOutlined,
    FileDownloadOutlined,
    ReportRounded,
    SearchOutlined
} from '@mui/icons-material';
import {
    Box,
    Button,
    InputAdornment,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import { Classroom } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import { random } from '@ricly/utils';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import ClassroomCard from '../../components/classroom/classroomCard';
import { useUser } from '../../contexts/UserContextProvider';

export default function Classrooms() {
  const { formatMessage } = useIntl();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [displayClassrooms, setDisplayClassrooms] = useState<Classroom[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [areClassroomsLoading, setAreClassroomsLoading] =
    useState<boolean>(false);

  const loadClassrooms = () => {
    setAreClassroomsLoading(true);
    setTimeout(() => {
      // TODO: CALL API TO GET SCHOOL classrooms HERE
      if (random() > 5) {
        const newClassrooms: Classroom[] = [];
        setClassrooms(newClassrooms);
        setDisplayClassrooms(newClassrooms);
        setAreClassroomsLoading(false);
      } else {
        const notif = new useNotification();
        notif.notify({
          render: formatMessage({ id: 'loadingClassrooms' }),
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadClassrooms}
              notification={notif}
              // TODO: message should come from backend api
              message={formatMessage({ id: 'failedLoadingClassrooms' })}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  const {
    user: { roles },
  } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (!roles.find(({ role }) => role === 'SECRETARY')) navigate('/');
    else loadClassrooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDisplayClassrooms(
      classrooms.filter(
        ({ classroom_code, classroom_name, coordinator_email }) =>
          coordinator_email.includes(searchValue) ||
          classroom_name.includes(searchValue) ||
          classroom_code.includes(searchValue)
      )
    );
  }, [classrooms, searchValue]);

  const [notifications, setNotifications] = useState<useNotification[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  function uploadFile(files: FileList) {
    setIsCreating(true);
    notifications.forEach((_) => _.dismiss);
    const notif = new useNotification();
    setNotifications([notif]);
    notif.notify({
      render: formatMessage({ id: 'creatingClassrooms' }),
    });
    setTimeout(() => {
      setIsCreating(false);
      //TODO call api here for classrooms creations with csv file files[0]
      if (random() > 5) {
        notif.update({
          //TODO: PUT REPONSE OF API HERE PRECISING THE NUMBER OF ROWS SUCCESSFULLY CREATED
          render: formatMessage({ id: 'allCreatedSuccessfull' }),
        });
        setNotifications([]);
      } else {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => uploadFile(files)}
              notification={notif}
              // TODO: message should come from backend api
              message={formatMessage({ id: 'csvCreationFailed' })}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 4000);
  }

  return (
    <Box sx={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <Box
        sx={{
          marginBottom: theme.spacing(3.75),
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          justifyItems: 'end',
        }}
      >
        <Typography variant="h3">
          {formatMessage({ id: 'classrooms' })}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            alignItems: 'stretch',
            columnGap: theme.spacing(2),
          }}
        >
          <Box>
            <input
              id="add-image-button"
              accept=".csv"
              type="file"
              hidden
              onChange={(event) => {
                uploadFile(event.target.files as FileList);
              }}
            />
            <label htmlFor="add-image-button">
              <Button
                component="span"
                variant="contained"
                color="primary"
                sx={{ textTransform: 'none' }}
                size="large"
                disabled={isCreating}
                endIcon={
                  <AddOutlined
                    sx={{
                      color: 'white',
                    }}
                  />
                }
              >
                {formatMessage({ id: 'import' })}
              </Button>
            </label>
          </Box>

          <Button
            variant="outlined"
            color="primary"
            sx={{ textTransform: 'none' }}
            size="small"
            startIcon={
              <FileDownloadOutlined
                sx={{
                  color: theme.palette.primary.light,
                }}
              />
            }
          >
            {formatMessage({ id: 'createClassroom' })}
          </Button>
        </Box>
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
          <Typography>{`${formatMessage({ id: 'classrooms' })} (${
            displayClassrooms.length
          })`}</Typography>
          <TextField
            size="small"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={formatMessage({ id: 'searchClassrooms' })}
            sx={{ m: 1, width: '25ch' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {<SearchOutlined />}
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Scrollbars>
          <Table sx={{ minWidth: 650 }}>
            <TableBody>
              {areClassroomsLoading ? (
                [...new Array(10)].map((_, index) => (
                  <Skeleton
                    key={index}
                    height={70}
                    animation="wave"
                    sx={{
                      marginBottom: theme.spacing(0.5),
                      '&.MuiSkeleton-root': { transform: 'scale(1, 1)' },
                    }}
                  />
                ))
              ) : displayClassrooms.length === 0 ? (
                <TableRow
                  sx={{
                    borderBottom: `1px solid ${theme.common.lighterPrimary}`,
                    borderTop: `1px solid ${theme.common.lighterPrimary}`,
                    padding: `0 ${theme.spacing(4.625)}`,
                    backgroundColor: theme.common.white,
                  }}
                >
                  <TableCell colSpan={4} component="th" align='center' scope="row">
                    {formatMessage({
                      id:
                        searchValue !== ''
                          ? 'noItemMatchSearch'
                          : 'noTeachersYet',
                    })}
                  </TableCell>
                </TableRow>
              ) : (
                displayClassrooms
                  .sort((a, b) =>
                    a.classroom_name > b.classroom_name
                      ? 1
                      : a.coordinator_email > b.coordinator_email
                      ? 1
                      : -1
                  )
                  .map((classroom, index) => (
                    <ClassroomCard key={index} classroom={classroom} />
                  ))
              )}
            </TableBody>
          </Table>
        </Scrollbars>
      </Box>
    </Box>
  );
}
