import {
  KeyboardArrowDownOutlined,
  KeyboardArrowUpOutlined,
  KeyboardBackspaceOutlined,
  ReportRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  MenuItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import {
  Break,
  Classroom,
  CreateTimetable,
  Subject,
  Teacher,
  Weekday,
} from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import { random } from '@ricly/utils';
import dayjs, { Dayjs } from 'dayjs';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import SubjectCard from '../../components/subject/subjectCard';
import TeacherCard from '../../components/teacher/teacherCard';
import { useUser } from '../../contexts/UserContextProvider';
import {
  getAvailableTeachers,
  getCoordinatorClassrooms,
} from '../../services/availabilities.service';
import { getClassroomWeekdays } from '../../services/classroom.service';
import { getSubjects } from '../../services/subject.service';

export default function NewTimetable() {
  const { formatMessage, formatTime } = useIntl();
  useState<boolean>(true);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [areTeachersLoading, setAreTeachersLoading] = useState<boolean>(true);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [areSubjectsLoading, setAreSubjectsLoading] = useState<boolean>(true);

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>();
  const [areClassroomsLoading, setAreClassroomsLoading] =
    useState<boolean>(true);

  const [weekdays, setWeekdays] = useState<Weekday[]>([]);
  const [areWeekdaysLoading, setAreWeekdaysLoading] = useState<boolean>(true);

  const [isBreakTimeLoading, setIsBreakTimeLoading] = useState<boolean>(true);

  const loadClassrooms = () => {
    setAreClassroomsLoading(true);
    setAreClassroomsLoading(true);
    getCoordinatorClassrooms()
      .then((classrooms) => {
        setClassrooms(classrooms);
        setSelectedClassroom(classrooms[0].classroom_id);
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
    if (selectedClassroom)
      getAvailableTeachers(selectedClassroom)
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
                  error?.message ||
                  formatMessage({ id: 'failedLoadingTeachers' })
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
    getSubjects()
      .then((subjects) => {
        setSubjects(subjects);
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

  const loadWeekdays = () => {
    setAreWeekdaysLoading(true);
    if (selectedClassroom)
      getClassroomWeekdays(selectedClassroom)
        .then((weekdays) => {
          setWeekdays(weekdays);
          setAreWeekdaysLoading(false);
        })
        .catch((error) => {
          const notif = new useNotification();
          notif.notify({
            render: formatMessage({ id: 'loadingWeekdays' }),
          });
          notif.update({
            type: 'ERROR',
            render: (
              <ErrorMessage
                retryFunction={loadWeekdays}
                notification={notif}
                message={
                  error?.message ||
                  formatMessage({ id: 'failedLoadingWeekdays' })
                }
              />
            ),
            autoClose: false,
            icon: () => <ReportRounded fontSize="medium" color="error" />,
          });
        });
  };

  const loadBreakTime = () => {
    setIsBreakTimeLoading(true);
    setTimeout(() => {
      // TODO: CALL API TO GET class breaktime HERE with data selectedClassroom
      if (random() > 5) {
        const newBreakTime: Break = {
          break_id: 'hels',
          start_time: new Date(),
          end_time: new Date(),
        };
        setBreakStart(dayjs(newBreakTime.start_time));
        setBreakEnd(dayjs(newBreakTime.end_time));
        setIsBreakTimeLoading(false);
      } else {
        const notif = new useNotification();
        notif.notify({
          render: formatMessage({ id: 'loadingBreaktime' }),
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadBreakTime}
              notification={notif}
              // TODO: message should come from backend api
              message={formatMessage({ id: 'failedLoadingBreaktime' })}
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
  useEffect(() => {
    if (roles.find(({ role }) => role === 'COORDINATOR')) {
      loadClassrooms();
    } else {
      const notif = new useNotification();
      notif.notify({ render: formatMessage({ id: 'notifying' }) });
      notif.update({
        type: 'ERROR',
        render: formatMessage({
          id: 'mustHaveCoordinatorRole',
        }),
        icon: () => <ReportRounded fontSize="medium" color="error" />,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedClassroom) {
      if (roles.find(({ role }) => role === 'COORDINATOR')) {
        loadTeachers();
        loadSubjects();
        loadWeekdays();
        loadBreakTime();
      } else {
        const notif = new useNotification();
        notif.notify({ render: formatMessage({ id: 'notifying' }) });
        notif.update({
          type: 'ERROR',
          render: formatMessage({
            id: 'mustHaveCoordinatorRole',
          }),
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassroom]);

  const navigate = useNavigate();

  const [genStart, setGenStart] = useState<Dayjs | null>(null);
  const [genEnd, setGenEnd] = useState<Dayjs | null>(null);
  const [breakStart, setBreakStart] = useState<Dayjs | null>(null);
  const [breakEnd, setBreakEnd] = useState<Dayjs | null>(null);
  const [courseDuration, setCourseDuration] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isTeacherDetailsOpen, setIsTeacherDetailsOpen] =
    useState<boolean>(false);
  const [areSubjectDetailsOpen, setAreSubjectDetailsOpen] =
    useState<boolean>(false);
  const [areWeekdaysDetailsOpen, setAreWeekdaysDetailsOpen] =
    useState<boolean>(false);
  const [notifications, setNotifications] = useState<useNotification[]>([]);

  function generateTimetable(timetable: CreateTimetable) {
    setIsGenerating(true);
    notifications.forEach((_) => _.dismiss);
    const notif = new useNotification();
    setNotifications([notif]);
    notif.notify({
      render: formatMessage({ id: 'generatingTimetable' }),
    });
    setTimeout(() => {
      setIsGenerating(false);
      //TODO call api here to generate timetable
      if (random() > 5) {
        notif.update({
          render: formatMessage({ id: 'timetableGeneratedSuccessfully' }),
        });
        //TODO: navigate to timetable link to display timetable
        // navigate(`${'which link to go to'}`)
        setGenStart(null);
        setGenEnd(null);
        setBreakStart(null);
        setBreakEnd(null);
        setSelectedClassroom(undefined);
        setCourseDuration(0);
        setNotifications([]);
      } else {
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={() => generateTimetable(timetable)}
              notification={notif}
              // TODO: message should come from backend api
              message={formatMessage({ id: 'failedGeneratingTimetable' })}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 4000);
  }

  const handleGenerate = () => {
    if (
      !selectedClassroom ||
      !genStart ||
      !genEnd ||
      !breakStart ||
      !breakEnd ||
      courseDuration <= 0 ||
      teachers.length === 0
    ) {
      const notif = new useNotification();
      notif.notify({ render: formatMessage({ id: 'notifying' }) });
      notif.update({
        type: 'ERROR',
        render: formatMessage({
          id: 'classroomGenerationIntervalBreakIntervalCourseDurationAndTeachersMustBeProvided',
        }),
        icon: () => <ReportRounded fontSize="medium" color="error" />,
      });
    } else {
      const newTimetable: CreateTimetable = {
        classroom_id: selectedClassroom,
        start_at: new Date(String(genStart)),
        end_at: new Date(String(genEnd)),
        break: {
          start_time: new Date(String(breakStart)),
          end_time: new Date(String(breakEnd)),
        },
        course_duration_in_minutes: courseDuration,
      };
      generateTimetable(newTimetable);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <Box
        sx={{
          marginBottom: theme.spacing(3.75),
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          justifyItems: 'start',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center',
          }}
        >
          <Tooltip arrow title={formatMessage({ id: 'seeClassrooms' })}>
            <IconButton onClick={() => navigate('/-/timetables')}>
              <KeyboardBackspaceOutlined
                fontSize="large"
                sx={{ color: 'black' }}
              />
            </IconButton>
          </Tooltip>
          <Typography variant="h3">
            {formatMessage({ id: 'newTimetable' })}
          </Typography>
        </Box>
        <TextField
          select
          sx={{ m: 1, width: '25ch' }}
          label={formatMessage({ id: 'classroom' })}
          disabled={areClassroomsLoading}
          value={selectedClassroom}
          onChange={(event) => setSelectedClassroom(event.target.value)}
        >
          {classrooms.map(({ classroom_id, classroom_code }, index) => (
            <MenuItem key={index} value={classroom_id}>
              {classroom_code}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Box
        sx={{
          display: 'grid',
          height: '100%',
          gridTemplateRows: 'auto auto auto auto auto auto 1fr',
          gap: theme.spacing(2),
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            columnGap: theme.spacing(2),
          }}
        >
          <MobileDatePicker
            label={formatMessage({ id: 'timetableStartDate' })}
            value={genStart}
            minDate={dayjs(new Date())}
            onChange={(newValue) => {
              setGenStart(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} disabled={isGenerating} />
            )}
          />
          <MobileDatePicker
            label={formatMessage({ id: 'timetableEndDate' })}
            value={genEnd}
            minDate={genStart}
            onChange={(newValue) => {
              setGenEnd(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} disabled={isGenerating} />
            )}
          />
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            columnGap: theme.spacing(2),
          }}
        >
          <DesktopTimePicker
            label={formatMessage({ id: 'breakStartTime' })}
            value={breakStart}
            onChange={(newValue) => {
              setBreakStart(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                disabled={isGenerating || isBreakTimeLoading}
              />
            )}
          />
          <DesktopTimePicker
            label={formatMessage({ id: 'breakStartTime' })}
            value={breakEnd}
            minTime={breakStart}
            onChange={(newValue) => {
              setBreakEnd(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                disabled={isGenerating || isBreakTimeLoading}
              />
            )}
          />
        </Box>
        <TextField
          label={formatMessage({ id: 'courseDuration' })}
          disabled={isGenerating}
          value={courseDuration}
          onChange={(event) => setCourseDuration(Number(event.target.value))}
        />
        <Box
          sx={{
            backgroundColor: theme.common.CSK50,
            padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h5"
              sx={{ cursor: 'pointer' }}
              onClick={() => setAreWeekdaysDetailsOpen(!areWeekdaysDetailsOpen)}
            >
              {formatMessage({ id: 'courseDays' })}
            </Typography>
            <Tooltip
              arrow
              title={formatMessage({
                id: areWeekdaysDetailsOpen ? 'hideDetails' : 'details',
              })}
            >
              <IconButton
                size="small"
                onClick={() =>
                  setAreWeekdaysDetailsOpen(!areWeekdaysDetailsOpen)
                }
              >
                {areWeekdaysDetailsOpen ? (
                  <KeyboardArrowUpOutlined
                    fontSize="large"
                    sx={{ color: 'black' }}
                  />
                ) : (
                  <KeyboardArrowDownOutlined
                    fontSize="large"
                    sx={{ color: 'black' }}
                  />
                )}
              </IconButton>
            </Tooltip>
          </Box>
          <Collapse in={areWeekdaysDetailsOpen}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateRows: 'auto 1fr',
                height: '300px',
              }}
            >
              <Typography
                sx={{
                  backgroundColor: theme.common.CSK200,
                  padding: `${theme.spacing(2)} ${theme.spacing(4.625)}`,
                }}
              >{`${formatMessage({ id: 'weekdays' })} (${
                weekdays.length
              })`}</Typography>
              <Scrollbars>
                <Table sx={{ minWidth: 650 }}>
                  <TableBody>
                    {areWeekdaysLoading ? (
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
                    ) : weekdays.length === 0 ? (
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
                            id: 'noOpenWeekdays',
                          })}
                        </TableCell>
                      </TableRow>
                    ) : (
                      weekdays
                        .sort((a, b) => (a.weekday > b.weekday ? 1 : -1))
                        .map(({ weekday, start_time, end_time }, index) => (
                          <TableRow
                            sx={{
                              borderBottom: `1px solid ${theme.common.lighterPrimary}`,
                              borderTop: `1px solid ${theme.common.lighterPrimary}`,
                              padding: `0 ${theme.spacing(4.625)}`,
                              backgroundColor: theme.common.white,
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {formatMessage({ id: `weekday${weekday}` })}
                            </TableCell>
                            <TableCell>
                              {`
        ${formatTime(start_time, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })} - 
        ${formatTime(end_time, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })}
      `}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </Scrollbars>
            </Box>
          </Collapse>
        </Box>
        <Box
          sx={{
            backgroundColor: theme.common.CSK50,
            padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h5"
              sx={{ cursor: 'pointer' }}
              onClick={() => setIsTeacherDetailsOpen(!isTeacherDetailsOpen)}
            >
              {formatMessage({ id: 'teacherDetails' })}
            </Typography>
            <Tooltip
              arrow
              title={formatMessage({
                id: isTeacherDetailsOpen ? 'hideDetails' : 'details',
              })}
            >
              <IconButton
                size="small"
                onClick={() => setIsTeacherDetailsOpen(!isTeacherDetailsOpen)}
              >
                {isTeacherDetailsOpen ? (
                  <KeyboardArrowUpOutlined
                    fontSize="large"
                    sx={{ color: 'black' }}
                  />
                ) : (
                  <KeyboardArrowDownOutlined
                    fontSize="large"
                    sx={{ color: 'black' }}
                  />
                )}
              </IconButton>
            </Tooltip>
          </Box>
          <Collapse in={isTeacherDetailsOpen}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateRows: 'auto 1fr',
                height: '300px',
              }}
            >
              <Typography
                sx={{
                  backgroundColor: theme.common.CSK200,
                  padding: `${theme.spacing(2)} ${theme.spacing(4.625)}`,
                }}
              >{`${formatMessage({ id: 'teachers' })} (${
                teachers.length
              })`}</Typography>
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
                    ) : teachers.length === 0 ? (
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
                            id: 'noTeachersAvailable',
                          })}
                        </TableCell>
                      </TableRow>
                    ) : (
                      teachers
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
                          <TeacherCard
                            canDelete={false}
                            key={index}
                            teacher={teacher}
                          />
                        ))
                    )}
                  </TableBody>
                </Table>
              </Scrollbars>
            </Box>
          </Collapse>
        </Box>
        <Box
          sx={{
            backgroundColor: theme.common.CSK50,
            padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h5"
              sx={{ cursor: 'pointer' }}
              onClick={() => setAreSubjectDetailsOpen(!areSubjectDetailsOpen)}
            >
              {formatMessage({ id: 'subjectDetails' })}
            </Typography>
            <Tooltip
              arrow
              title={formatMessage({
                id: areSubjectDetailsOpen ? 'hideDetails' : 'details',
              })}
            >
              <IconButton
                size="small"
                onClick={() => setAreSubjectDetailsOpen(!areSubjectDetailsOpen)}
              >
                {areSubjectDetailsOpen ? (
                  <KeyboardArrowUpOutlined
                    fontSize="large"
                    sx={{ color: 'black' }}
                  />
                ) : (
                  <KeyboardArrowDownOutlined
                    fontSize="large"
                    sx={{ color: 'black' }}
                  />
                )}
              </IconButton>
            </Tooltip>
          </Box>
          <Collapse in={areSubjectDetailsOpen}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateRows: 'auto 1fr',
                height: '300px',
              }}
            >
              <Typography
                sx={{
                  backgroundColor: theme.common.CSK200,
                  padding: `${theme.spacing(2)} ${theme.spacing(4.625)}`,
                }}
              >{`${formatMessage({ id: 'subjectPool' })} (${
                subjects.length
              })`}</Typography>
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
                    ) : subjects.length === 0 ? (
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
                            id: 'noSubjects',
                          })}
                        </TableCell>
                      </TableRow>
                    ) : (
                      subjects
                        .sort((a, b) =>
                          a.subject_name > b.subject_name ? 1 : -1
                        )
                        .map((subject, index) => (
                          <SubjectCard
                            canDelete={false}
                            key={index}
                            subject={subject}
                          />
                        ))
                    )}
                  </TableBody>
                </Table>
              </Scrollbars>
            </Box>
          </Collapse>
        </Box>
        <Box
          sx={{
            display: 'grid',
            justifySelf: 'end',
            gridAutoFlow: 'column',
            gap: theme.spacing(2),
            alignSelf: 'end',
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            sx={{ textTransform: 'none' }}
            size="large"
            onClick={() => navigate('/-/timetables')}
          >
            {formatMessage({ id: 'cancel' })}
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ textTransform: 'none' }}
            size="large"
            onClick={handleGenerate}
          >
            {formatMessage({ id: 'generate' })}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
