import { FileDownloadOutlined, ReportRounded } from '@mui/icons-material';
import {
    Box,
    Button,
    MenuItem,
    Skeleton,
    Table,
    TableBody,
    TextField,
    Typography
} from '@mui/material';
import { Classroom, TimeTable } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import { random } from '@ricly/utils';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import NewAvailabilityDialog from '../../components/availabilities/newAvailabilityDialog';
import TimetableCard from '../../components/timetables/timetableCard';
import { useUser } from '../../contexts/UserContextProvider';

export default function Timetables() {
  const { formatMessage } = useIntl();
  const [timetables, setTimetables] = useState<TimeTable[]>([]);
  const [areTimetablesLoading, setAreTimetablesLoading] =
    useState<boolean>(true);

  const loadTimetables = () => {
    setAreTimetablesLoading(true);
    setTimeout(() => {
      // TODO: CALL API TO GET SCHOOL teachers HERE with data school_code
      if (random() > 5) {
        const newTimetables: TimeTable[] = [];
        setTimetables(newTimetables);
        setAreTimetablesLoading(false);
      } else {
        const notif = new useNotification();
        notif.notify({
          render: formatMessage({ id: 'loadingTimetables' }),
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadTimetables}
              notification={notif}
              // TODO: message should come from backend api
              message={formatMessage({ id: 'failedLoadingTimetables' })}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>();
  const [areClassroomsLoading, setAreClassroomsLoading] =
    useState<boolean>(true);


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


  const {
    user: { roles },
  } = useUser();
  useEffect(() => {
    if (roles.find(({ role }) => role === 'COORDINATOR')) {
      loadTimetables();
      loadClassrooms()
    }else {
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
  }, [selectedClassroom]);

  const [isNewTimetableDialogOpen, setIsNewTimetableDialogOpen] =
    useState<boolean>(false);
  return (
    <>
      <NewAvailabilityDialog
        isDialogOpen={isNewTimetableDialogOpen}
        closeDialog={() => setIsNewTimetableDialogOpen(false)}
      />
      <Box
        sx={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr' }}
      >
        <Box
          sx={{
            marginBottom: theme.spacing(3.75),
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            justifyItems: 'end',
          }}
        >
          <Typography variant="h3">
            {formatMessage({ id: 'Timetables' })}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsNewTimetableDialogOpen(true)}
            sx={{ textTransform: 'none' }}
            disabled={isNewTimetableDialogOpen}
            size="small"
            endIcon={
              <FileDownloadOutlined
                sx={{
                  color: theme.common.white,
                }}
              />
            }
          >
            {formatMessage({ id: 'newTimetable' })}
          </Button>
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
          <Typography
            sx={{
              backgroundColor: theme.common.CSK200,
              padding: `${theme.spacing(2)} ${theme.spacing(4.625)}`,
            }}
          >{`${formatMessage({ id: 'timetables' })} (${
            timetables.length
          })`}</Typography>

          <TextField
            select
            size="small"
            sx={{ m: 1, width: '25ch', backgroundColor:theme.common.white }}
            label={formatMessage({ id: 'classroom' })}
            disabled={areTimetablesLoading || areClassroomsLoading}
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


          <Scrollbars>
            <Table sx={{ minWidth: 650 }}>
              <TableBody>
                {areTimetablesLoading ? (
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
                ) : timetables.length === 0 ? (
                  <Typography variant="h5" sx={{ textAlign: 'center' }}>
                    {formatMessage({
                      id: 'noTimetablesYet',
                    })}
                  </Typography>
                ) : (
                  timetables
                    .sort((a, b) =>
                      new Date(a.created_at) >
                      new Date(b.created_at)
                        ? 1
                        : -1
                    )
                    .map((timetable, index) => (
                      <TimetableCard
                        key={index}
                        timetable={timetable}
                      />
                    ))
                )}
              </TableBody>
            </Table>
          </Scrollbars>
        </Box>
      </Box>
    </>
  );
}
