import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTimetableDto } from '../app.dto';

interface IClassroomHasSubject {
  hall_id: string;
  classroom_id: string;
  subject_id: string;
  classroom_has_subject_id: string;
}
@Injectable()
export class TimetableService {
  constructor(private prismaService: PrismaService) {}

  async getTimetables(classroom_id: string) {
    const firstProgram = await this.prismaService.program.findMany({
      distinct: ['created_at'],
      orderBy: [{ created_at: 'asc' }],
      select: { is_published: true, start_date: true, created_at: true },
      where: { ClassroomHasSubject: { classroom_id }, is_deleted: false },
    });
    const lastProgram = await this.prismaService.program.findMany({
      distinct: ['created_at'],
      orderBy: [{ created_at: 'desc' }],
      select: { end_date: true, created_at: true },
      where: { ClassroomHasSubject: { classroom_id }, is_deleted: false },
    });
    return firstProgram.map(({ is_published, start_date, created_at }) => ({
      is_published,
      start_date,
      created_at,
      ends_at: lastProgram.find((_) => _.created_at === created_at).end_date,
    }));
  }

  async getTimetablePrograms(where: Prisma.ProgramWhereInput) {
    const programs = await this.prismaService.program.findMany({
      select: {
        program_id: true,
        start_date: true,
        end_date: true,
        Hall: { select: { hall_code: true } },
        ClassroomHasSubject: {
          select: {
            Subject: { select: { subject_name: true } },
            Classroom: { select: { classroom_acronym: true } },
            Teacher: { select: { Person: { select: { fullname: true } } } },
          },
        },
      },
      where: { ...where, is_deleted: false },
    });
    return programs.map(
      ({
        ClassroomHasSubject: {
          Classroom: { classroom_acronym: classroom_code },
          Subject: { subject_name },
          Teacher: {
            Person: { fullname },
          },
        },
        Hall: { hall_code },
        ...program
      }) => ({
        fullname,
        hall_code,
        ...program,
        subject_name,
        classroom_code,
      })
    );
  }

  async generateTimetable({
    // break: { end_time, start_time },
    classroom_id,
    course_duration_in_minutes,
    end_at,
    start_at,
  }: CreateTimetableDto) {
    const newPrograms: Prisma.ProgramCreateManyInput[] = [];
    let timetableDate = new Date(start_at);
    //monday < friday
    while (timetableDate < new Date(end_at)) {
      //get monday
      const weekday = await this.prismaService.weekday.findFirst({
        where: { classroom_id, weekday: timetableDate.getDay() },
      });
      //if monday if classroom weekday
      if (weekday) {
        const { start_time, end_time } = weekday;
        let dayPeriodStartTime = new Date(
          new Date(timetableDate).setHours(
            start_time.getHours(),
            start_time.getMinutes()
          )
        );
        //7:30 < 17:30
        const dalyProgrammedSubjects: string[] = [];
        while (
          dayPeriodStartTime <
          new Date(
            new Date(timetableDate).setHours(
              end_time.getHours(),
              end_time.getMinutes()
            )
          )
        ) {
          const nextPeriodStartTime = new Date(
            new Date(dayPeriodStartTime).setMinutes(
              dayPeriodStartTime.getMinutes() + course_duration_in_minutes
            )
          );
          const programs = await this.prismaService.program.findMany({
            where: {
              ClassroomHasSubject: { classroom_id },
              end_date: nextPeriodStartTime,
              start_date: dayPeriodStartTime,
              is_published: true,
            },
          });
          if (programs.length === 0) {
            //get available teachers
            const availableTeachers = await this.prismaService.teacher.findMany(
              {
                orderBy: { teacher_type: 'asc' }, //This will prioritize part_time over permanent and permanent.
                select: {
                  ClassroomHasSubjects: {
                    select: {
                      classroom_has_subject_id: true,
                      subject_id: true,
                      classroom_id: true,
                      Classroom: {
                        select: {
                          hall_id: true,
                        },
                      },
                    },
                  },
                },
                where: {
                  Availabilities: {
                    some: {
                      end_time: { gte: nextPeriodStartTime },
                      start_time: { lte: dayPeriodStartTime },
                      is_deleted: false,
                      is_used: false,
                    },
                  },
                  ClassroomHasSubjects: {
                    none: {
                      classroom_has_subject_id: {
                        in: dalyProgrammedSubjects.map(
                          (classroom_has_subject_id) => classroom_has_subject_id
                        ),
                      },
                    },
                    some: {
                      Classroom: {
                        classroom_id,
                      },
                    },
                  },
                },
              }
            );
            //retrieving implicated classroom subjects (classroom_has_subject_id)
            let classroomHasSubjects: IClassroomHasSubject[] = [];
            availableTeachers.map(({ ClassroomHasSubjects }) => {
              ClassroomHasSubjects.map(
                ({
                  classroom_has_subject_id,
                  subject_id,
                  classroom_id: id,
                  Classroom: { hall_id },
                }) => {
                  if (classroom_id === id)
                    classroomHasSubjects.push({
                      hall_id,
                      subject_id,
                      classroom_id,
                      classroom_has_subject_id,
                    });
                }
              );
            });
            //searching for coreSubjects
            const uniqueCoreSubjects: IClassroomHasSubject[] = [];
            const coreSubjectHalls: { hall_id: string; subject_id: string }[] =
              [];
            for (let i = 0; i < classroomHasSubjects.length; i++) {
              const { subject_id } = classroomHasSubjects[i];
              const coreSubjects =
                await this.prismaService.classroomHasSubject.findMany({
                  select: {
                    subject_id: true,
                    classroom_id: true,
                    classroom_has_subject_id: true,
                    Classroom: { select: { hall_id: true } },
                  },
                  where: {
                    subject_id,
                    is_deleted: false,
                    classroom_has_subject_id: {
                      notIn: [
                        ...classroomHasSubjects.map(
                          ({ classroom_has_subject_id: id }) => id
                        ),
                        ...dalyProgrammedSubjects.map((id) => id),
                      ],
                    },
                  },
                });
              uniqueCoreSubjects.push(
                ...coreSubjects.map(
                  ({
                    subject_id,
                    classroom_id,
                    Classroom: { hall_id },
                    classroom_has_subject_id,
                  }) => ({
                    classroom_has_subject_id,
                    classroom_id,
                    subject_id,
                    hall_id,
                  })
                )
              );
              const nombreOfStudent = await this.prismaService.student.count({
                where: {
                  OR: [
                    ...coreSubjects.map(({ classroom_id }) => ({
                      classroom_id,
                    })),
                    { classroom_id },
                  ],
                },
              });
              const capableHall = await this.prismaService.hall.findFirst({
                select: { hall_id: true },
                where: {
                  is_used: false,
                  hall_capacity: { gte: nombreOfStudent },
                  NOT: {
                    OR: coreSubjectHalls.map(({ hall_id }) => ({ hall_id })),
                  },
                }, //TODO should check if the hall is too big
              });
              coreSubjectHalls.push({
                hall_id: capableHall?.hall_id,
                subject_id,
              });
            }

            //added coreSubjects to implicated classroom subjects (classroom_has_subject_id)
            classroomHasSubjects.push(...uniqueCoreSubjects);
            const availableHalls = await this.prismaService.hall.findMany({
              select: { hall_id: true },
              where: {
                is_used: false,
                NOT: {
                  OR: coreSubjectHalls.map(({ hall_id }) => ({ hall_id })),
                },
              },
            });
            let iterateHalls = availableHalls.length;

            classroomHasSubjects = classroomHasSubjects.map(
              (classroomHasSubject) => {
                --iterateHalls;
                //getting non core subjects hall_id
                const hall_id =
                  iterateHalls >= 0
                    ? availableHalls[iterateHalls].hall_id
                    : null;
                const coreSubject = uniqueCoreSubjects.find(
                  ({ subject_id: id }) => id === classroomHasSubject.subject_id
                );
                return coreSubject
                  ? {
                      ...classroomHasSubject,
                      //setting coreSubject hall_id with capable hall_id,
                      hall_id: coreSubjectHalls.find(
                        ({ subject_id }) =>
                          subject_id === classroomHasSubject.subject_id
                      ).hall_id,
                    }
                  : classroomHasSubject.hall_id === null
                  ? {
                      ...classroomHasSubject,
                      hall_id,
                    }
                  : classroomHasSubject;
              }
            );
            const programs: IClassroomHasSubject[] = [];
            classroomHasSubjects.forEach(
              ({
                hall_id,
                classroom_has_subject_id,
                classroom_id: id,
                subject_id,
              }) => {
                if (
                  !programs.find(
                    (_) => _.subject_id !== subject_id && _.classroom_id === id
                  ) ||
                  id === classroom_id
                )
                  programs.push({
                    hall_id,
                    subject_id,
                    classroom_id,
                    classroom_has_subject_id,
                  });
                if (
                  !dalyProgrammedSubjects.find(
                    (id) => id === classroom_has_subject_id
                  )
                )
                  dalyProgrammedSubjects.push(classroom_has_subject_id);
              }
            );

            newPrograms.push(
              ...programs.map(({ hall_id, classroom_has_subject_id }) => ({
                hall_id,
                classroom_has_subject_id,
                end_date: nextPeriodStartTime,
                start_date: dayPeriodStartTime,
              }))
            );
          }
          dayPeriodStartTime = nextPeriodStartTime;
        }
      }
      timetableDate = new Date(
        timetableDate.setDate(timetableDate.getDate() + 1)
      );
    }
    return newPrograms;
  }
}
