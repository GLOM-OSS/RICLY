import { Box, Typography } from '@mui/material';
import { Auth } from '@ricly/auth';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router';
import Buildings from '../pages/buildings';
import Classrooms from '../pages/classrooms';
import Dashboard from '../pages/dashboard';
import Layout from '../pages/layout';
import Subjects from '../pages/subject';
import SubjectClassrooms from '../pages/subject/[subject_id]';
import Teachers from '../pages/teachers';

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
    element: <Auth />,
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
    ],
  },
  //   {
  //     path: '*',
  //     element: <Navigate to="/" />,
  //   },
];
