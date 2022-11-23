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
import { Classroom, Student, Subject } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import { random } from '@ricly/utils';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import StudentCard from '../../components/student/studentCard';
import { useUser } from '../../contexts/UserContextProvider';

export default function Students() {
  const { formatMessage } = useIntl();
  const [students, setStudents] = useState<Student[]>([]);
  const [displayStudents, setDisplayStudents] = useState<Student[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [areStudentsLoading, setAreStudentsLoading] = useState<boolean>(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [areClassroomsLoading, setAreClassroomsLoading] =
    useState<boolean>(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [areSubjectsLoading, setAreSubjectsLoading] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<string>();
  const [selectedClassroom, setSelectedClassroom] = useState<string>();

  const loadClassrooms = () => {
    setAreClassroomsLoading(true);
    setTimeout(() => {
      // TODO: CALL API TO GET SCHOOL classrooms HERE
      if (random() > 5) {
        const newClassrooms: Classroom[] = [];
        setClassrooms(newClassrooms);
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

  const loadSubjects = () => {
    setAreSubjectsLoading(true);
    setTimeout(() => {
      // TODO: CALL API TO GET SCHOOL subjects HERE
      if (random() > 5) {
        const newSubjects: Subject[] = [];
        setSubjects(newSubjects);
        setAreSubjectsLoading(false);
      } else {
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
              // TODO: message should come from backend api
              message={formatMessage({ id: 'failedLoadingSubjects' })}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  const loadStudents = () => {
    setAreStudentsLoading(true);
    setTimeout(() => {
      // TODO: CALL API TO GET SCHOOL Students HERE with data selectedClassroom, selectedSubject
      if (random() > 5) {
        const newStudents: Student[] = [];
        setStudents(newStudents);
        setDisplayStudents(newStudents);
        setAreStudentsLoading(false);
      } else {
        const notif = new useNotification();
        notif.notify({
          render: formatMessage({ id: 'loadingStudents' }),
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadStudents}
              notification={notif}
              // TODO: message should come from backend api
              message={formatMessage({ id: 'failedLoadingStudents' })}
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
    else {
      loadStudents();
      loadSubjects();
      loadClassrooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassroom, selectedSubject]);

  useEffect(() => {
    setDisplayStudents(
      students.filter(
        ({ fullname, email }) =>
          fullname.includes(searchValue) || email.includes(searchValue)
      )
    );
  }, [students, searchValue]);

  const [notifications, setNotifications] = useState<useNotification[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  function uploadFile(files: FileList) {
    setIsCreating(true);
    notifications.forEach((_) => _.dismiss);
    const notif = new useNotification();
    setNotifications([notif]);
    notif.notify({
      render: formatMessage({ id: 'creatingStudents' }),
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
          {formatMessage({ id: 'students' })}
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
            {formatMessage({ id: 'createStudent' })}
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
          <Typography>{`${formatMessage({ id: 'students' })} (${
            displayStudents.length
          })`}</Typography>
          <TextField
            size="small"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={formatMessage({ id: 'searchStudent' })}
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
            disabled={areStudentsLoading || areClassroomsLoading}
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
            label={formatMessage({ id: 'subject' })}
            disabled={areStudentsLoading || areSubjectsLoading}
            value={selectedSubject}
            onChange={(event) => setSelectedSubject(event.target.value)}
          >
            {subjects.map(
              ({ subject_name, subject_id, subject_code }, index) => (
                <MenuItem key={index} value={subject_id}>
                  {`${subject_name} ( ${subject_code} )`}
                </MenuItem>
              )
            )}
          </TextField>
        </Box>
        <Scrollbars>
          <Table sx={{ minWidth: 650 }}>
            <TableBody>
              {areStudentsLoading ? (
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
              ) : displayStudents.length === 0 ? (
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
                          : 'noStudentsYet',
                    })}
                  </TableCell>
                </TableRow>
              ) : (
                displayStudents
                  .sort((a, b) => (a.fullname > b.fullname ? 1 : -1))
                  .map((student, index) => (
                    <StudentCard key={index} student={student} />
                  ))
              )}
            </TableBody>
          </Table>
        </Scrollbars>
      </Box>
    </Box>
  );
}
