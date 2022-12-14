import {
  AddOutlined,
  FileDownloadOutlined,
  ReportRounded,
  SearchOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  InputAdornment,
  Skeleton,
  Table,
  TableBody,
  TextField,
  Typography,
} from '@mui/material';
import { Teacher } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import TeacherCard from '../../components/teacher/teacherCard';
import { useUser } from '../../contexts/UserContextProvider';
import { getTeachers, importTeachers } from '../../services/teachers.service';

export default function Teachers() {
  const { formatMessage } = useIntl();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [displayTeachers, setDisplayTeachers] = useState<Teacher[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [areTeachersLoading, setAreTeachersLoading] = useState<boolean>(true);

  const loadTeachers = () => {
    setAreTeachersLoading(true);
    getTeachers()
      .then((teachers) => {
        setTeachers(teachers);
        setDisplayTeachers(teachers);
        setAreTeachersLoading(false);
      })
      .catch((error) => {
        const notif = new useNotification();
        notif.notify({
          render: formatMessage({ id: 'loadingTeachers' }),
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadTeachers}
              notification={notif}
              message={
                error?.message || formatMessage({ id: 'failedLoadingTeachers' })
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  const {
    user: { roles },
  } = useUser();
  useEffect(() => {
    if (roles.find(({ role }) => role === 'SECRETARY')) {
      loadTeachers();
    } else {
      const notif = new useNotification();
      // notif.notify({ render: formatMessage({ id: 'notifying' }) });
      notif.update({
        type: 'ERROR',
        render: formatMessage({
          id: 'mustHaveSecretaryRole',
        }),
        icon: () => <ReportRounded fontSize="medium" color="error" />,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDisplayTeachers(
      teachers.filter(
        ({ email, fullname, phone_number }) =>
          email.includes(searchValue) ||
          fullname.includes(searchValue) ||
          phone_number.includes(searchValue)
      )
    );
  }, [teachers, searchValue]);

  const [notifications, setNotifications] = useState<useNotification[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  function uploadFile(files: FileList) {
    setIsCreating(true);
    notifications.forEach((_) => _.dismiss);
    const notif = new useNotification();
    setNotifications([notif]);
    notif.notify({
      render: formatMessage({ id: 'creatingTeachers' }),
    });
    importTeachers(files[0])
      .then((data) => {
        notif.update({
          render: `${formatMessage({
            id: 'allCreatedSuccessfull',
          })}. Teacher(s)(${data[0].count})`,
        });
        loadTeachers();
        setNotifications([]);
      })
      .catch((error) => {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => uploadFile(files)}
              notification={notif}
              message={
                error?.message || formatMessage({ id: 'csvCreationFailed' })
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      })
      .finally(() => setIsCreating(false));
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
          {formatMessage({ id: 'teachers' })}
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
            {formatMessage({ id: 'createTeacher' })}
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
          <Typography>{`${formatMessage({ id: 'teachers' })} (${
            displayTeachers.length
          })`}</Typography>
          <TextField
            size="small"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={formatMessage({ id: 'searchTeachers' })}
            sx={{ m: 1, width: '25ch', backgroundColor: theme.common.white }}
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
              {areTeachersLoading ? (
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
              ) : displayTeachers.length === 0 ? (
                <Typography variant="h5" sx={{ textAlign: 'center' }}>
                  {formatMessage({
                    id:
                      searchValue !== ''
                        ? 'noItemMatchSearch'
                        : 'noTeachersYet',
                  })}
                </Typography>
              ) : (
                displayTeachers
                  .sort((a, b) =>
                    a.teacher_type > b.teacher_type
                      ? 1
                      : a.fullname > b.fullname
                      ? 1
                      : a.phone_number > b.phone_number
                      ? 1
                      : -1
                  )
                  .map((teacher, index) => (
                    <TeacherCard key={index} teacher={teacher} />
                  ))
              )}
            </TableBody>
          </Table>
        </Scrollbars>
      </Box>
    </Box>
  );
}
