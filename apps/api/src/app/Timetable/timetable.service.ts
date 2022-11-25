import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTimetableDto } from '../app.dto';

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
    // const transasction = this.prismaService.$transaction
    //monday < friday
    while (timetableDate < new Date(end_at)) {
      Logger.debug(`Day timestamp: ${timetableDate.toISOString()}`);
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
          Logger.debug(
            `timestamp: ${dayPeriodStartTime.toISOString()}, programs: ${
              newPrograms.length
            }`
          );
          if (programs.length === 0) {
            //get available teachers
            const availableTeachers = await this.prismaService.teacher.findMany(
              {
                orderBy: { teacher_type: 'asc' }, //This will prioritize part_time over permanent and permanent.
                select: {
                  Classrooms: {
                    select: {
                      hall_id: true,
                      ClassroomHasSubjects: {
                        select: {
                          classroom_has_subject_id: true,
                          subject_id: true,
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
                  },
                  Classrooms: {
                    some: {
                      classroom_id,
                    },
                  },
                },
              }
            );
            //retrieving implicated classroom subjects (classroom_has_subject_id)
            let classroomHasSubjects: {
              hall_id: string;
              classroom_id: string;
              subject_id: string;
              classroom_has_subject_id: string;
            }[] = [];
            availableTeachers.map(({ Classrooms }) => {
              const { hall_id, ClassroomHasSubjects } = Classrooms[0];
              ClassroomHasSubjects.map(
                ({ classroom_has_subject_id, subject_id }) => {
                  classroomHasSubjects.push({
                    hall_id,
                    subject_id,
                    classroom_id,
                    classroom_has_subject_id,
                  });
                }
              );
            });
            Logger.debug(
              `availableTeachers : ${availableTeachers.length}, classroomHasSubjects : ${classroomHasSubjects.length}`
            );
            //searching for coreSubjects
            const coreSubjects =
              await this.prismaService.classroomHasSubject.findMany({
                select: {
                  subject_id: true,
                  classroom_id: true,
                  classroom_has_subject_id: true,
                  Classroom: { select: { hall_id: true } },
                },
                where: {
                  is_deleted: false,
                  OR: classroomHasSubjects.map(({ subject_id }) => ({
                    subject_id,
                  })),
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
            Logger.debug(`coreSubjects : ${coreSubjects.length}`);
            //added coreSubjects to implicated classroom subjects (classroom_has_subject_id)
            classroomHasSubjects.push(
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
                  ...coreSubjects.map(({ classroom_id }) => ({ classroom_id })),
                  { classroom_id },
                ],
              },
            });
            Logger.debug(
              `nombreOfStudent: ${nombreOfStudent}, classroomHasSubjects: ${classroomHasSubjects.length}`
            );
            const capableHall = await this.prismaService.hall.findFirst({
              select: { hall_id: true },
              where: {
                is_used: false,
                hall_capacity: { gte: nombreOfStudent },
              }, //TODO should check if the hall is too big
            });
            const availableHalls = await this.prismaService.hall.findMany({
              select: { hall_id: true },
              where: {
                is_used: false,
                NOT: {
                  OR: [capableHall ? { hall_id: capableHall.hall_id } : {}],
                },
              },
            });
            let iterateHalls = availableHalls.length;
            Logger.debug(`availableHalls : ${availableHalls.length}`);

            classroomHasSubjects = classroomHasSubjects.map(
              (classroomHasSubject) => {
                --iterateHalls;
                const hall_id =
                  iterateHalls >= 0
                    ? availableHalls[iterateHalls].hall_id
                    : null;
                const coreSubject = coreSubjects.find(
                  ({ subject_id: id }) =>
                    id === classroomHasSubject.subject_id
                );
                return coreSubject
                  ? //setting coreSubject hall_id with capable hall_id,
                    {
                      ...classroomHasSubject,
                      ...(capableHall ? { hall_id: capableHall.hall_id } : {}),
                    }
                  : classroomHasSubject.hall_id === null
                  ? {
                      ...classroomHasSubject,
                      //setting non core subjects hall_id with available halls ids
                      hall_id,
                    }
                  : classroomHasSubject;
              }
            );
            newPrograms.push(
              ...classroomHasSubjects.map(
                ({ hall_id, classroom_has_subject_id }) => ({
                  hall_id,
                  classroom_has_subject_id,
                  end_date: nextPeriodStartTime,
                  start_date: dayPeriodStartTime,
                })
              )
            );
            newPrograms.forEach(({ classroom_has_subject_id }) => {
              if (
                !dalyProgrammedSubjects.find(
                  (id) => id === classroom_has_subject_id
                )
              )
                dalyProgrammedSubjects.push(classroom_has_subject_id);
            });
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

  async findPrograms(where: Prisma.ProgramWhereInput) {
    return this.prismaService.program.findMany({
      where,
    });
  }

  async addPrograms(data: Prisma.ProgramCreateManyInput[]) {
    return this.prismaService.program.createMany({
      data,
      skipDuplicates: true,
    });
  }
  async getCommonClassrooms(where: Prisma.ClassroomHasSubjectWhereInput) {
    return this.prismaService.classroomHasSubject.findMany({
      where,
    });
  }
}
