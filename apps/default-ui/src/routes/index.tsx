import { Box, Typography } from '@mui/material';
import { Auth } from '@ricly/auth';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router';
import Availabilities from '../pages/availabilities';
import Buildings from '../pages/buildings';
import Classrooms from '../pages/classrooms';
import Dashboard from '../pages/dashboard';
import Layout from '../pages/layout';
import Schedules from '../pages/schedules';
import Students from '../pages/student';
import Subjects from '../pages/subject';
import SubjectClassrooms from '../pages/subject/[subject_id]';
import Teachers from '../pages/teachers';
import Timetables from '../pages/timetables';
import NewTimetable from '../pages/timetables/new';
import TestTimetable from '../pages/timetables/test';

export const Test = () => {
  const { school_code } = useParams();
  const { formatMessage } = useIntl();
  return (
    <Box>
      <Typography>{school_code}</Typography>
    </Box>
  );
};

export const routes = [
  {
    path: '/',
    element: <Auth app="default-ui" />,
  },
  {
    path: '-',
    element: <Layout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'halls', element: <Buildings /> },
      { path: 'teachers', element: <Teachers /> },
      { path: 'classrooms', element: <Classrooms /> },
      { path: 'subjects', element: <Subjects /> },
      { path: 'subjects/:subject_id', element: <SubjectClassrooms /> },
      { path: 'students', element: <Students /> },
      { path: 'availabilities', element: <Availabilities /> },
      { path: 'schedules', element: <Schedules /> },
      { path: 'timetables', element: <Timetables /> },
      { path: 'timetables/new', element: <NewTimetable /> },
      { path: 'timetables/:created_at', element: <TestTimetable /> },
    ],
  },
  // {
  //   path: '*',
  //   element: <Navigate to="/" />,
  // },
];
