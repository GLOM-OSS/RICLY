import { ReportRounded } from '@mui/icons-material';
import { Skeleton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Program } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import { random } from '@ricly/utils';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import ProgramCard from '../../components/timetables/programCard';
import { getTimetablePrograms } from '../../services/timetable.service';

interface Slot {
  start_time: Date;
  end_time: Date;
  usage: 'slot' | 'break';
}

export default function Schedules() {
  const { formatMessage, formatDate, formatTime, formatDateTimeRange } =
    useIntl();
  const [slots, setSlots] = useState<Slot[]>([]);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [displayPrograms, setDisplayPrograms] = useState<Program[][]>([]);
  const [areProgramsLoading, setAreProgramsLoading] = useState<boolean>(true);
  const [tableInterval, setTableInterval] = useState<{
    start_date: Date;
    end_date: Date;
  }>();

  const getSlots = (programs: Program[]): Slot[] => {
    const newSlots: Slot[] = slots;
    programs.forEach(({ start_date: sd, end_date: ed }) => {
      const start = new Date(
        new Date().setUTCHours(
          sd.getUTCHours(),
          sd.getUTCMinutes(),
          sd.getUTCSeconds()
        )
      );
      const end = new Date(
        new Date().setUTCHours(
          ed.getUTCHours(),
          ed.getUTCMinutes(),
          ed.getUTCSeconds()
        )
      );
      const overlappingSlot = newSlots.find(
        ({ start_time: st, end_time: et }) => {
          return (
            st.toUTCString() === start.toUTCString() &&
            et.toUTCString() === end.toUTCString()
          );
        }
      );

      if (!overlappingSlot)
        newSlots.push({ start_time: start, end_time: end, usage: 'slot' });
    });
    return newSlots;
  };

  const getProgramDayFamilies = (programs: Program[]): Program[][] => {
    let displayPrograms: Program[][] = [];

    programs.forEach((program) => {
      //Verify if program array already exists in displayPrograms
      const programList = displayPrograms.find(
        (programDayFamily) =>
          programDayFamily[0].start_date.toDateString() ===
          program.start_date.toDateString()
      );
      //if program's day family does exist, push it into it's family and update displayPrograms
      if (programList) {
        console.log({
          sd: program.start_date.getUTCHours(),
          ed: program.end_date.getUTCHours(),
        });
        //look for the programDayFamily and swap it with a new one containing this program
        displayPrograms = displayPrograms.map((programDayFamily) => {
          if (
            programDayFamily[0].start_date.toDateString() ===
            program.start_date.toDateString()
          )
            return [...programList, program];
          else return programDayFamily;
        });
      } else {
        //if program's day family doesn't exist yet, create one and update displayPrograms
        displayPrograms = [...displayPrograms, [program]];
      }
    });
    return displayPrograms;
  };

  const loadPrograms = () => {
    setAreProgramsLoading(true);
    const timestamp = new Date().setDate(new Date().getDate() - 7);
    getTimetablePrograms(timestamp)
      .then(({ programs, start_date, end_date }) => {
        setTableInterval({ start_date, end_date });
        setPrograms(
          programs.map(({ start_date, end_date, ...program }) => ({
            ...program,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
          }))
        );
        setAreProgramsLoading(false);
      })
      .catch((error) => {
        const notif = new useNotification();
        notif.notify({
          render: formatMessage({ id: 'loadingPrograms' }),
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadPrograms}
              notification={notif}
              message={
                error?.message || formatMessage({ id: 'failedLoadingPrograms' })
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  useEffect(() => {
    loadPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSlots(
      [...getSlots(programs)].sort((a, b) =>
        a.start_time > b.start_time ? -1 : 1
      )
    );
    setDisplayPrograms(getProgramDayFamilies(programs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programs]);

  return (
    <Box
      sx={{
        display: 'grid',
        height: '100%',
        gap: theme.spacing(2),
        gridTemplateRows: 'auto 1fr',
      }}
    >
      {tableInterval ? (
        <Typography
          variant="h4"
          sx={{ textAlign: 'center', borderBottom: '1px solid black' }}
        >
          {`${formatDateTimeRange(
            new Date(tableInterval.start_date),
            new Date(tableInterval.end_date),
            {
              year: 'numeric',
              month: 'long',
              day: '2-digit',
            }
          )}`}
        </Typography>
      ) : (
        <Skeleton animation="wave" width="40%" />
      )}
      <Box
        sx={{
          display: 'grid',
          height: '100%',
          gridTemplateColumns: '75px 1fr',
        }}
      >
        <Scrollbars>
          <Box
            sx={{
              height: '100%',
              display: 'grid',
              gridTemplateRows: `${slots.map(() => '1fr').join(' ')}`,
            }}
          >
            {slots.map(({ start_time, end_time }, index) => {
              return (
                <Typography
                  key={index}
                  sx={{
                    fontWeight: 'bold',
                    alignSelf: 'end',
                  }}
                >
                  {formatTime(start_time)}
                </Typography>
              );
            })}
          </Box>
        </Scrollbars>
        <Scrollbars>
          <Box
            sx={{
              display: 'grid',
              height: '100%',
              gridTemplateColumns: `${[
                ...new Array(areProgramsLoading ? 5 : displayPrograms.length),
              ]
                .map((_) => 'auto')
                .join(' ')} 1fr`,
              gap: theme.spacing(1),
            }}
          >
            {areProgramsLoading
              ? [...new Array(5)].map((progDay) => (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateRows: '1fr auto',
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        height: '100%',
                        gap: theme.spacing(1),
                        gridTemplateRows: `1fr 1fr 50px 1fr`,
                      }}
                    >
                      {[...new Array(4)].map((prog) =>
                        random() > 5 ? (
                          <Skeleton
                            height="100%"
                            width="300px"
                            animation="wave"
                          />
                        ) : (
                          <Box></Box>
                        )
                      )}
                    </Box>
                    <Typography>
                      <Skeleton animation="wave" />
                    </Typography>
                  </Box>
                ))
              : displayPrograms
                  .sort((a, b) => (a[0].start_date > b[0].start_date ? 1 : -1))
                  .map((programDayFamily) => {
                    return (
                      <Box
                        sx={{ display: 'grid', gridTemplateRows: '1fr auto' }}
                      >
                        <Box
                          sx={{
                            display: 'grid',
                            gap: theme.spacing(1),
                            gridTemplateRows: `${slots
                              .map(({ usage }) => '1fr')
                              .join(' ')}`,
                          }}
                        >
                          {slots
                            .sort((a, b) =>
                              a.start_time > b.start_time ? -1 : 1
                            )
                            .map(({ start_time: st }, index) => {
                              const slotData = programDayFamily.find(
                                ({ end_date: ed, start_date: sd }) =>
                                  new Date(
                                    new Date().setUTCHours(
                                      st.getUTCHours(),
                                      st.getUTCMinutes(),
                                      st.getUTCSeconds()
                                    )
                                  ).toUTCString() ===
                                  new Date(
                                    new Date().setUTCHours(
                                      sd.getUTCHours(),
                                      sd.getUTCMinutes(),
                                      sd.getUTCSeconds()
                                    )
                                  ).toUTCString()
                              );
                              return slotData ? (
                                <ProgramCard forTeacher program={slotData} />
                              ) : (
                                <Box></Box>
                              );
                            })}
                        </Box>
                        <Typography
                          sx={{ textAlign: 'center', fontWeight: 'bold' }}
                        >
                          {formatDate(programDayFamily[0].end_date, {
                            year: 'numeric',
                            month: 'long',
                            day: '2-digit',
                          })}
                        </Typography>
                      </Box>
                    );
                  })}
          </Box>
        </Scrollbars>
      </Box>
    </Box>
  );
}
