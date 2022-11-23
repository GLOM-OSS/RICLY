import {
  KeyboardBackspaceOutlined,
  ReportRounded,
  SearchOutlined
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  InputAdornment,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { Classroom, Subject } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router';
import ClassroomCard from '../../components/subject/classroomCard';
// import ClassroomCard from '../../components/classroom/classroomCard';
import { useUser } from '../../contexts/UserContextProvider';
import { getSubjectData } from '../../services/subject.service';

export default function SubjectClassrooms() {
  const { formatMessage } = useIntl();
  const [subject, setSubject] = useState<Subject>();
  const [displayClassrooms, setDisplayClassrooms] = useState<
    Omit<Classroom, 'coordinator_email'>[]
  >([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isSubjectLoading, setIsSubjectLoading] = useState<boolean>(false);
  const { subject_id } = useParams();

  const loadSubject = () => {
    setIsSubjectLoading(true);
    getSubjectData(subject_id as string)
      .then((subject) => {
        setSubject(subject);
        setDisplayClassrooms(subject.classrooms);
        setIsSubjectLoading(false);
      })
      .catch((error) => {
        const notif = new useNotification();
        notif.notify({
          render: formatMessage({ id: 'loadingSubject' }),
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadSubject}
              notification={notif}
              message={
                error?.message || formatMessage({ id: 'failedLoadingSubject' })
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
  const navigate = useNavigate();
  useEffect(() => {
    if (!roles.find(({ role }) => role === 'SECRETARY')) navigate('/');
    else loadSubject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDisplayClassrooms(
      subject
        ? subject.classrooms.filter(
            ({ classroom_code, classroom_name }) =>
              classroom_name.includes(searchValue) ||
              classroom_code.includes(searchValue)
          )
        : []
    );
  }, [subject, searchValue]);

  return (
    <Box sx={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <Box
        sx={{
          marginBottom: theme.spacing(3.75),
        }}
      >
        <Typography variant="h3" sx={{ marginBottom: theme.spacing(4.25) }}>
          {formatMessage({ id: 'subjects' })}
        </Typography>
        {!subject ? (
          <Skeleton animation="wave" />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              justifyItems: 'start',
              alignItems: 'center',
            }}
          >
            <Tooltip arrow title={formatMessage({ id: 'deleteClassroom' })}>
              <IconButton size="small" onClick={() => navigate('/-/subject')}>
                <KeyboardBackspaceOutlined sx={{ color: 'black' }} />
              </IconButton>
            </Tooltip>

            <Typography variant="h6">{subject.subject_name}</Typography>
          </Box>
        )}
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
              {isSubjectLoading ? (
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
                          : 'noTeachersYet',
                    })}
                  </TableCell>
                </TableRow>
              ) : (
                displayClassrooms
                  .sort((a, b) =>
                    a.classroom_name > b.classroom_name ? 1 : -1
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
