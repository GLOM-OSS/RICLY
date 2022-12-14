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
  MenuItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { Classroom, Subject, Teacher } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import SubjectCard from '../../components/subject/subjectCard';
import { useUser } from '../../contexts/UserContextProvider';
import { getClassrooms } from '../../services/classroom.service';
import { getSubjects, importSubjects } from '../../services/subject.service';
import { getTeachers } from '../../services/teachers.service';

export default function Subjects() {
  const { formatMessage } = useIntl();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [displaySubjects, setDisplaySubjects] = useState<Subject[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [areSubjectsLoading, setAreSubjectsLoading] = useState<boolean>(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [areClassroomsLoading, setAreClassroomsLoading] =
    useState<boolean>(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [areTeachersLoading, setAreTeachersLoading] = useState<boolean>(true);
  const [selectedTeacher, setSelectedTeacher] = useState<string>();
  const [selectedClassroom, setSelectedClassroom] = useState<string>();

  const loadClassrooms = () => {
    setAreClassroomsLoading(true);
    getClassrooms()
      .then((classrooms) => {
        setClassrooms(classrooms);
        setAreClassroomsLoading(false);
      })
      .catch((error) => {
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
              message={
                error?.message ||
                formatMessage({ id: 'failedLoadingClassrooms' })
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  const loadTeachers = () => {
    setAreTeachersLoading(true);
    getTeachers()
      .then((teachers) => {
        setTeachers(teachers);
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

  const loadSubjects = () => {
    setAreSubjectsLoading(true);
    getSubjects({
      classroom_id: selectedClassroom,
      teacher_id: selectedTeacher,
    })
      .then((subjects) => {
        setSubjects(subjects);
        setDisplaySubjects(subjects);
        setAreSubjectsLoading(false);
      })
      .catch((error) => {
        const notif = new useNotification();
        notif.notify({
          render: formatMessage({ id: 'loadingSubjects' }),
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadSubjects}
              notification={notif}
              message={
                error?.message || formatMessage({ id: 'failedLoadingSubjects' })
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
      loadSubjects();
      loadTeachers();
      loadClassrooms();
    }else {
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
  }, [selectedClassroom, selectedTeacher]);

  useEffect(() => {
    setDisplaySubjects(
      subjects.filter(
        ({ subject_name, subject_code }) =>
          subject_name.includes(searchValue) ||
          subject_code.includes(searchValue)
      )
    );
  }, [subjects, searchValue]);

  const [notifications, setNotifications] = useState<useNotification[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  function uploadFile(files: FileList) {
    setIsCreating(true);
    notifications.forEach((_) => _.dismiss);
    const notif = new useNotification();
    setNotifications([notif]);
    notif.notify({
      render: formatMessage({ id: 'creatingSubjects' }),
    });
    importSubjects(files[0])
      .then((data) => {
        notif.update({
          render: `${formatMessage({
            id: 'allCreatedSuccessfull',
          })}. Subject(s): ${data[0].count}`,
        });
        loadSubjects()
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
          {formatMessage({ id: 'subjects' })}
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
            {formatMessage({ id: 'createSubject' })}
          </Button>
        </Box>
      </Box>
      <Box
        sx={{ display: 'grid', height: '100%', gridTemplateRows: 'auto 1fr' }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto auto auto 1fr',
            alignItems: 'center',
            backgroundColor: theme.common.CSK200,
            padding: `0 ${theme.spacing(4.625)}`,
          }}
        >
          <Typography>{`${formatMessage({ id: 'subjects' })} (${
            displaySubjects.length
          })`}</Typography>
          <TextField
            size="small"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={formatMessage({ id: 'searchSubject' })}
            sx={{ m: 1, width: '25ch', backgroundColor: theme.common.white }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {<SearchOutlined />}
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            size="small"
            sx={{ m: 1, width: '25ch', backgroundColor: theme.common.white }}
            label={formatMessage({ id: 'classroom' })}
            disabled={areSubjectsLoading || areClassroomsLoading}
            value={selectedClassroom}
            onChange={(event) => setSelectedClassroom(event.target.value)}
          >
            {classrooms.map(({ classroom_id, classroom_code }, index) => (
              <MenuItem key={index} value={classroom_id}>
                {classroom_code}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            sx={{ m: 1, width: '25ch', backgroundColor: theme.common.white }}
            label={formatMessage({ id: 'teacher' })}
            disabled={areSubjectsLoading || areTeachersLoading}
            value={selectedTeacher}
            onChange={(event) => setSelectedTeacher(event.target.value)}
          >
            {teachers.map(({ teacher_id, fullname }, index) => (
              <MenuItem key={index} value={teacher_id}>
                {fullname}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Scrollbars>
          <Table sx={{ minWidth: 650 }}>
            <TableBody>
              {areSubjectsLoading ? (
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
              ) : displaySubjects.length === 0 ? (
                <TableRow
                  sx={{
                    borderBottom: `1px solid ${theme.common.lighterPrimary}`,
                    borderTop: `1px solid ${theme.common.lighterPrimary}`,
                    padding: `0 ${theme.spacing(4.625)}`,
                    backgroundColor: theme.common.white,
                  }}
                >
                  <TableCell
                    colSpan={4}
                    component="th"
                    align="center"
                    scope="row"
                  >
                    {formatMessage({
                      id:
                        searchValue !== ''
                          ? 'noItemMatchSearch'
                          : 'noSubjectssYet',
                    })}
                  </TableCell>
                </TableRow>
              ) : (
                displaySubjects
                  .sort((a, b) => (a.subject_name > b.subject_name ? 1 : -1))
                  .map((subject, index) => (
                    <SubjectCard key={index} subject={subject} />
                  ))
              )}
            </TableBody>
          </Table>
        </Scrollbars>
      </Box>
    </Box>
  );
}
