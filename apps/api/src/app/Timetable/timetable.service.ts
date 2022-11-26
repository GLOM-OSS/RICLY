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
    const usedAvailabilities: string[] = [];
    const newPrograms: Prisma.ProgramCreateManyInput[] = [];
    const newAvailabilities: Prisma.AvailabilityCreateManyInput[] = [];
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
            const availableTeachers = await this.getAvailableTeachers(
              classroom_id,
              {
                start_time: dayPeriodStartTime,
                end_time: nextPeriodStartTime,
                availability_date: dayPeriodStartTime,
              },
              dalyProgrammedSubjects.map(
                (classroom_has_subject_id) => classroom_has_subject_id
              )
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
            const { commonSubjectHalls, uniqueCoreSubjects } =
              await this.searchCommonSubjects(
                classroom_id,
                classroomHasSubjects,
                dalyProgrammedSubjects.map((id) => id)
              );

            //added coreSubjects to implicated classroom subjects (classroom_has_subject_id)
            classroomHasSubjects.push(...uniqueCoreSubjects);
            const availableHalls = await this.prismaService.hall.findMany({
              select: { hall_id: true },
              where: {
                NOT: {
                  OR: commonSubjectHalls.map(({ hall_id }) => ({ hall_id })),
                },
              },
            });

            // Attributing halls to courses;
            classroomHasSubjects = this.attributeHalls(
              availableHalls,
              classroomHasSubjects,
              uniqueCoreSubjects,
              commonSubjectHalls
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
            const {
              newAvailabilities: new_availabilities,
              usedAvailabilities: used_availabilities,
            } = await this.updateTeacherAvailabilities(
              {
                availability_date: dayPeriodStartTime,
                end_time: nextPeriodStartTime,
                start_time: dayPeriodStartTime,
              },
              newPrograms
            );
            newAvailabilities.push(...new_availabilities);
            usedAvailabilities.push(...used_availabilities);
          }
          dayPeriodStartTime = nextPeriodStartTime;
        }
      }
      timetableDate = new Date(
        timetableDate.setDate(timetableDate.getDate() + 1)
      );
    }
    const created_at = new Date();
    await this.prismaService.$transaction([
      this.prismaService.program.createMany({
        data: newPrograms.map((program) => ({ ...program, created_at })),
        skipDuplicates: true,
      }),
      this.prismaService.availability.updateMany({
        data: { is_used: true },
        where: { availability_id: { in: usedAvailabilities } },
      }),
      this.prismaService.availability.createMany({
        data: newAvailabilities,
        skipDuplicates: true,
      }),
    ]);
    return created_at.getTime()
  }

  async getAvailableTeachers(
    classroom_id: string,
    dayPeriod: { availability_date: Date; start_time: Date; end_time: Date },
    unwantedCourse: string[]
  ) {
    return this.prismaService.teacher.findMany({
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
            availability_date: dayPeriod.availability_date,
            start_time: { lte: dayPeriod.start_time },
            end_time: { gte: dayPeriod.end_time },
            is_deleted: false,
            is_used: false,
          },
        },
        ClassroomHasSubjects: {
          none: {
            classroom_has_subject_id: {
              in: unwantedCourse,
            },
          },
          some: {
            Classroom: {
              classroom_id,
            },
          },
        },
      },
    });
  }

  async searchCommonSubjects(
    classroom_id: string,
    classroomHasSubjects: IClassroomHasSubject[],
    unwantedCourse: string[]
  ) {
    const uniqueCoreSubjects: IClassroomHasSubject[] = [];
    const commonSubjectHalls: { hall_id: string; subject_id: string }[] = [];
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
                ...unwantedCourse,
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
          hall_capacity: { gte: nombreOfStudent },
          NOT: {
            OR: commonSubjectHalls.map(({ hall_id }) => ({ hall_id })),
          },
        }, //TODO should check if the hall is too big
      });
      commonSubjectHalls.push({
        hall_id: capableHall?.hall_id,
        subject_id,
      });
    }

    return { uniqueCoreSubjects, commonSubjectHalls };
  }

  attributeHalls(
    availableHalls: { hall_id: string }[],
    classroomHasSubjects: IClassroomHasSubject[],
    uniqueCoreSubjects: IClassroomHasSubject[],
    commonSubjectHalls: { hall_id: string; subject_id: string }[]
  ) {
    let iterateHalls = availableHalls.length;

    return classroomHasSubjects.map((classroomHasSubject) => {
      --iterateHalls;
      //getting non core subjects hall_id
      const hall_id =
        iterateHalls >= 0 ? availableHalls[iterateHalls].hall_id : null;
      const coreSubject = uniqueCoreSubjects.find(
        ({ subject_id: id }) => id === classroomHasSubject.subject_id
      );
      return coreSubject
        ? {
            ...classroomHasSubject,
            //setting coreSubject hall_id with capable hall_id,
            hall_id: commonSubjectHalls.find(
              ({ subject_id }) => subject_id === classroomHasSubject.subject_id
            ).hall_id,
          }
        : classroomHasSubject.hall_id === null
        ? {
            ...classroomHasSubject,
            hall_id,
          }
        : classroomHasSubject;
    });
  }

  async updateTeacherAvailabilities(
    {
      availability_date,
      end_time,
      start_time,
    }: {
      availability_date: Date;
      start_time: Date;
      end_time: Date;
    },
    concernedPrograms: { classroom_has_subject_id: string }[]
  ) {
    const usedAvailabilities: string[] = [];
    const newAvailabilities: Prisma.AvailabilityCreateManyInput[] = [];
    const availabilities = await this.prismaService.availability.findMany({
      where: {
        is_used: false,
        availability_date,
        end_time: { gte: end_time },
        start_time: { lte: start_time },
        Teacher: {
          ClassroomHasSubjects: {
            some: {
              OR: concernedPrograms,
            },
          },
        },
      },
    });
    availabilities.forEach(
      ({ availability_id, teacher_id, end_time, start_time }) => {
        usedAvailabilities.push(availability_id);
        newAvailabilities.push(
          {
            availability_date: start_time,
            end_time: start_time,
            teacher_id,
            start_time,
          },
          {
            end_time,
            teacher_id,
            start_time: end_time,
            availability_date: start_time,
          }
        );
      }
    );
    return { usedAvailabilities, newAvailabilities };
  }
}
