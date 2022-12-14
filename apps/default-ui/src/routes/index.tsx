import { Auth } from '@ricly/auth';
import { useUser } from '../contexts/UserContextProvider';
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
import TestTimetable from '../pages/timetables/[timestamp]';

const AuthPage = () => {
  const { userDispatch } = useUser();
  return (
    <Auth
      app="default-ui"
      updateUserContext={(user) =>
        userDispatch({ type: 'LOAD_USER', payload: { user } })
      }
    />
  );
};

export const routes = [
  {
    path: '/',
    element: <AuthPage />,
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
      { path: 'timetables/:classroom_id/:timestamp', element: <TestTimetable /> },
    ],
  },
  // {
  //   path: '*',
  //   element: <Navigate to="/" />,
  // },
];
