import { ReportRounded } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Break, Program } from '@ricly/interfaces';
import { theme } from '@ricly/theme';
import { ErrorMessage, useNotification } from '@ricly/toast';
import { random } from '@ricly/utils';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import ProgramCard from '../../components/timetables/programCard';

interface Slot {
  start_time: Date;
  end_time: Date;
  usage: 'slot' | 'break';
}

export default function TestTimetable() {
  const { formatMessage, formatDate, formatTime } = useIntl();
  const [breaktime, setBreaktime] = useState<Break>();
  const [isBreaktimeLoading, setIsBreaktimeLoading] = useState<boolean>(true);
  const [slots, setSlots] = useState<Slot[]>([]);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [displayPrograms, setDisplayPrograms] = useState<Program[][]>([]);
  const [areProgramsLoading, setAreProgramsLoading] = useState<boolean>(true);

  const loadBreaktime = () => {
    setIsBreaktimeLoading(true);
    setTimeout(() => {
      // TODO: CALL API TO GET class weekdays HERE with data selectedClassroom
      if (true) {
        const newBreaktime: Break = {
          break_id: 'dhsie',
          end_time: new Date('2022/11/13 13:00:00'),
          start_time: new Date('2022/11/13 12:00:00'),
        };
        setBreaktime(newBreaktime);
        setIsBreaktimeLoading(false);
      } else {
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

  const getSlots = (programs: Program[]): Slot[] => {
    const newSlots: Slot[] = slots;
    programs.forEach(({ start_date: sd, end_date: ed }) => {
      const start = new Date(
        new Date().setHours(sd.getHours(), sd.getMinutes(), sd.getSeconds())
      );
      const end = new Date(
        new Date().setHours(ed.getHours(), ed.getMinutes(), ed.getSeconds())
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
        console.log({
          sd: program.start_date.getHours(),
          ed: program.end_date.getHours(),
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
        //the object represents the adding of break time to day family
        //given that the breaktime is a date, we need to bring it back to the day of the programDayFamily's day and swap the time (as we know that to be the exact time)
        //else sorting the different programs for time coherency might have the break at the bottom or the top of the programDayFamily
        const breakProgram = {
          program_id: 'default_ui_break',
          end_date: new Date(
            new Date(program.end_date).setHours(
              breaktime.end_time.getHours(),
              breaktime.end_time.getMinutes(),
              breaktime.end_time.getSeconds()
            )
          ),
          start_date: new Date(
            new Date(program.start_date).setHours(
              breaktime.start_time.getHours(),
              breaktime.start_time.getMinutes(),
              breaktime.start_time.getSeconds()
            )
          ),
          fullname: 'default_ui_break',
          hall_name: 'default_ui_break',
          subject_name: 'default_ui_break',
        };
        displayPrograms = [...displayPrograms, [program, breakProgram]];
      }
    });
    return displayPrograms;
  };

  const loadPrograms = () => {
    setAreProgramsLoading(true);
    setTimeout(() => {
      // TODO: CALL API TO GET programs
      if (true) {
        const newPrograms: Program[] = [
          {
            end_date: new Date('2022/11/13 12:00:00'),
            fullname: 'Djembissie Marco',
            hall_name: 'B016',
            program_id: 'lslsl',
            start_date: new Date('2022/11/13 08:00:00'),
            subject_name: 'Systeme',
          },
          {
            end_date: new Date('2022/11/14 17:00:00'),
            fullname: 'Djembissie Marco',
            hall_name: 'B016',
            program_id: 'lslsl',
            start_date: new Date('2022/11/14 13:00:00'),
            subject_name: 'Toto',
          },
          {
            end_date: new Date('2022/11/12 17:00:00'),
            fullname: 'Djembissie Marco',
            hall_name: 'B0166',
            program_id: 'lslsl',
            start_date: new Date('2022/11/12 13:00:00'),
            subject_name: 'Exploietation',
          },
          {
            end_date: new Date('2022/11/17 12:00:00'),
            fullname: 'Djembissie Marco',
            hall_name: 'B0166',
            program_id: 'lslsl',
            start_date: new Date('2022/11/17 08:00:00'),
            subject_name: 'Biologie',
          },
          {
            end_date: new Date('2022/11/19 17:00:00'),
            fullname: 'Djembissie Marco',
            hall_name: 'B0166',
            program_id: 'lslsl',
            start_date: new Date('2022/11/19 13:00:00'),
            subject_name: 'Biologie',
          },
          {
            end_date: new Date('2022/11/12 20:00:00'),
            fullname: 'Djembissie Marco',
            hall_name: 'B01666',
            program_id: 'lslsl',
            start_date: new Date('2022/11/12 18:00:00'),
            subject_name: "Systeme d'exploietation",
          },
        ];
        setPrograms(newPrograms);
        setAreProgramsLoading(false);
      } else {
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
              // TODO: message should come from backend api
              message={formatMessage({ id: 'failedLoadingPrograms' })}
            />
          ),
          autoClose: false,
          icon: () => <ReportRounded fontSize="medium" color="error" />,
        });
      }
    }, 3000);
  };

  useEffect(() => {
    loadBreaktime();
    loadPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (breaktime) {
      const breakSlot: Slot = {
        start_time: new Date(
          new Date().setHours(
            breaktime.start_time.getHours(),
            breaktime.start_time.getMinutes(),
            breaktime.start_time.getSeconds()
          )
        ),
        end_time: new Date(
          new Date().setHours(
            breaktime.end_time.getHours(),
            breaktime.end_time.getMinutes(),
            breaktime.end_time.getSeconds()
          )
        ),
        usage: 'break',
      };
      //   console.log(programs)
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
        gridTemplateColumns: '75px 1fr',
      }}
    >
      <Scrollbars>
        <Box
          sx={{
            height: '100%',
            display: 'grid',
            gridTemplateRows: `${slots
              .map(({ usage }) => (usage === 'break' ? '50px' : '1fr'))
              .join(' ')}`,
          }}
        >
          {slots.map(({ start_time }, index) => {
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
            gridTemplateColumns: `${[...new Array(displayPrograms.length)]
              .map((_) => 'auto')
              .join(' ')} 1fr`,
            gap: theme.spacing(1),
          }}
        >
          {displayPrograms
            .sort((a, b) => (a[0].start_date > b[0].start_date ? 1 : -1))
            .map((programDayFamily) => {
              return (
                <Box sx={{ display: 'grid', gridTemplateRows: '1fr auto' }}>
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
                      .sort((a, b) => (a.start_time > b.start_time ? -1 : 1))
                      .map(({ start_time: st }, index) => {
                        const slotData = programDayFamily.find(
                          ({ end_date: ed, start_date: sd }) =>
                            new Date(
                              new Date().setHours(
                                st.getHours(),
                                st.getMinutes(),
                                st.getSeconds()
                              )
                            ).toUTCString() ===
                            new Date(
                              new Date().setHours(
                                sd.getHours(),
                                sd.getMinutes(),
                                sd.getSeconds()
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
                  <Typography sx={{ textAlign: 'center', fontWeight: 'bold' }}>
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
  );
}
