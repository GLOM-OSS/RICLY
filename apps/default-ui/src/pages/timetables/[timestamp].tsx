import { ReportRounded } from '@mui/icons-material';
import { Skeleton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Break, Program } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import { random } from '@ricly/utils';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { start } from 'repl';
import ProgramCard from '../../components/timetables/programCard';
import { getClassroomBreak } from '../../services/classroom.service';
import { getTimetablePrograms } from '../../services/timetable.service';

interface Slot {
  start_time: Date;
  end_time: Date;
  usage: 'slot' | 'break';
}

export default function TestTimetable() {
  const { classroom_id, timestamp } = useParams();

  const [breaktime, setBreaktime] = useState<Break>();
  const [slots, setSlots] = useState<Slot[]>([]);
  const { formatMessage, formatDate, formatTime, formatDateTimeRange } =
    useIntl();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [displayPrograms, setDisplayPrograms] = useState<Program[][]>([]);
  const [areProgramsLoading, setAreProgramsLoading] = useState<boolean>(true);
  const [tableInterval, setTableInterval] = useState<{
    start_date: Date;
    end_date: Date;
  }>();

  const loadBreaktime = () => {
    getClassroomBreak(classroom_id as string)
      .then(({ break_id, end_time, start_time }) => {
        setBreaktime({
          break_id,
          end_time: new Date(end_time),
          start_time: new Date(start_time),
        });
      })
      .catch((error) => {
        const notif = new useNotification();
        notif.notify({
          render: formatMessage({ id: 'loadingBreaktime' }),
        });
        notif.update({
          type: 'ERROR',
          render: (
            <ErrorMessage
              retryFunction={loadBreaktime}
              notification={notif}
              message={
                error?.message ||
                formatMessage({ id: 'failedLoadingBreaktime' })
              }
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      });
  };

  const getSlots = (programs: Program[]): Slot[] => {
    const newSlots: Slot[] = [];
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

  const getProgramDayFamilies = (
    programs: Program[],
    breaktime: Break
  ): Program[][] => {
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
        //the object represents the adding of break time to day family
        //given that the breaktime is a date, we need to bring it back to the day of the programDayFamily's day and swap the time (as we know that to be the exact time)
        //else sorting the different programs for time coherency might have the break at the bottom or the top of the programDayFamily
        const breakProgram: Program = {
          program_id: 'default_ui_break',
          end_date: new Date(
            new Date(program.end_date).setUTCHours(
              breaktime.end_time.getUTCHours(),
              breaktime.end_time.getUTCMinutes(),
              breaktime.end_time.getUTCSeconds()
            )
          ),
          start_date: new Date(
            new Date(program.start_date).setUTCHours(
              breaktime.start_time.getUTCHours(),
              breaktime.start_time.getUTCMinutes(),
              breaktime.start_time.getUTCSeconds()
            )
          ),
          fullname: 'default_ui_break',
          hall_code: 'default_ui_break',
          subject_name: 'default_ui_break',
          classroom_code: program.classroom_code,
        };
        displayPrograms = [...displayPrograms, [program, breakProgram]];
      }
    });
    return displayPrograms;
  };

  const loadPrograms = () => {
    setAreProgramsLoading(true);
    getTimetablePrograms(Number(timestamp), classroom_id as string)
      .then(({ programs, start_date, end_date }) => {
        setTableInterval({ start_date, end_date });
        setPrograms(
          programs.map(({ end_date, start_date, ...program }) => ({
            end_date: new Date(end_date),
            start_date: new Date(start_date),
            ...program,
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
    if (timestamp && classroom_id) {
      loadBreaktime();
      loadPrograms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timestamp, classroom_id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (breaktime) {
      const breakSlot: Slot = {
        start_time: new Date(
          new Date().setUTCHours(
            breaktime.start_time.getUTCHours(),
            breaktime.start_time.getUTCMinutes(),
            breaktime.start_time.getUTCSeconds()
          )
        ),
        end_time: new Date(
          new Date().setUTCHours(
            breaktime.end_time.getUTCHours(),
            breaktime.end_time.getUTCMinutes(),
            breaktime.end_time.getUTCSeconds()
          )
        ),
        usage: 'break',
      };
      setSlots(
        [breakSlot, ...getSlots(programs)].sort((a, b) =>
          a.start_time > b.start_time ? -1 : 1
        )
      );
      setDisplayPrograms(getProgramDayFamilies(programs, breaktime));
    } else setSlots(getSlots(programs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breaktime, programs]);

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
          )} ( ${programs[0].classroom_code} )`}
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
              gridTemplateRows: `${slots
                .map(({ usage }, index) => (usage === 'break' ? '50px' : '1fr'))
                .join(' ')}`,
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
                              .map(({ usage }) =>
                                usage === 'break' ? '50px' : '1fr'
                              )
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
                                <ProgramCard program={slotData} />
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
