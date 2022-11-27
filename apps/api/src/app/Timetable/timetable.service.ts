import { Injectable } from '@nestjs/common';
import { Prisma, TeacherTypeEnum } from '@prisma/client';
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
      orderBy: [{ start_date: 'asc' }],
      select: { is_published: true, start_date: true, created_at: true },
      where: { ClassroomHasSubject: { classroom_id }, is_deleted: false },
    });
    const lastProgram = await this.prismaService.program.findMany({
      distinct: ['created_at'],
      orderBy: [{ end_date: 'desc' }],
      select: { end_date: true, created_at: true },
      where: { ClassroomHasSubject: { classroom_id }, is_deleted: false },
    });
    return firstProgram.map(({ is_published, start_date, created_at }) => ({
      is_published,
      start_date,
      created_at,
      end_date: lastProgram.find(
        (_) => _.created_at.toUTCString() === created_at.toUTCString()
      )?.end_date,
    }));
  }

  async getTimetablePrograms(where: Prisma.ProgramWhereInput) {
    const programs = await this.prismaService.program.findMany({
      orderBy: { start_date: 'asc' },
      include: {
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
    return {
      end_date: programs[programs.length - 1]?.end_date,
      start_date: programs[0]?.start_date,
      created_at: programs[0]?.created_at,
      is_published:
        programs[0]?.is_published &&
        programs[programs.length - 1]?.is_published,
      programs: programs.map(
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
      ),
    };
  }

  async generateTimetable({
    break: { end_time: breakEndTime, start_time: breakStartTime },
    classroom_id,
    course_duration_in_minutes,
    end_at,
    start_at,
  }: CreateTimetableDto) {
    const usedAvailabilities: string[] = [];
    const newPrograms: Prisma.ProgramCreateManyInput[] = [];
    const newAvailabilities: Prisma.AvailabilityCreateManyInput[] = [];
    let timetableStartDate = new Date(start_at);
    //bringing date to UTC
    const timetableEndDate = new Date(
      new Date(end_at).setDate(new Date(end_at).getDate() + 1)
    );
    const weekdays = await this.prismaService.weekday.findMany({
      where: { classroom_id },
    });
    console.log(timetableEndDate, weekdays);
    //monday < friday
    while (timetableStartDate < timetableEndDate) {
      //get monday
      const weekday = weekdays.find(
        (_) => _.weekday === timetableStartDate.getDay()
      );
      //if monday if classroom weekday
      if (weekday) {
        const { start_time, end_time } = weekday;
        let dayPeriodStartTime = new Date(
          new Date(timetableStartDate).setUTCHours(
            start_time.getUTCHours(),
            start_time.getUTCMinutes()
          )
        );
        //7:30 < 17:30
        const dalyProgrammedSubjects: string[] = [];
        while (
          dayPeriodStartTime <
          new Date(
            new Date(timetableStartDate).setUTCHours(
              end_time.getUTCHours(),
              end_time.getUTCMinutes()
            )
          )
        ) {
          const breakStartPeriod = new Date(breakStartTime);
          const breakEndPeriod = new Date(breakEndTime);
          let nextPeriodStartTime = new Date(
            new Date(dayPeriodStartTime).setUTCMinutes(
              dayPeriodStartTime.getUTCMinutes() + course_duration_in_minutes
            )
          );
          if (
            dayPeriodStartTime > breakStartPeriod &&
            nextPeriodStartTime < breakEndPeriod
          ) {
            //TODO split classroom course period containing a break period
            nextPeriodStartTime = new Date(
              new Date(dayPeriodStartTime).setUTCHours(
                new Date(breakEndTime).getUTCHours(),
                new Date(breakEndTime).getUTCMinutes()
              )
            );
            continue;
          }
          const programs = await this.prismaService.program.findMany({
            where: {
              ClassroomHasSubject: { classroom_id },
              NOT: {
                OR: [
                  {
                    end_date: { lte: dayPeriodStartTime },
                  },
                  {
                    start_date: { gte: nextPeriodStartTime },
                  },
                ],
              },
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
              dalyProgrammedSubjects
            );
            //retrieving implicated classroom subjects (classroom_has_subject_id)
            let classroomHasSubjects: IClassroomHasSubject[] = [];
            availableTeachers.forEach(
              ({ ClassroomHasSubjects, Availabilities }) => {
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
                    Availabilities.forEach(
                      ({
                        end_time,
                        start_time,
                        teacher_id,
                        availability_id,
                        availability_date,
                      }) => {
                        usedAvailabilities.push(availability_id);
                        const endTimeString = new Date(
                          new Date(timetableStartDate).setHours(
                            end_time.getHours(),
                            end_time.getMinutes(),
                            end_time.getSeconds()
                          )
                        );
                        const startTimeString = new Date(
                          new Date(timetableStartDate).setHours(
                            start_time.getHours(),
                            start_time.getMinutes(),
                            start_time.getSeconds()
                          )
                        );
                        if (
                          !(
                            endTimeString.toUTCString() ===
                              dayPeriodStartTime.toUTCString() &&
                            startTimeString.toUTCString() ===
                              dayPeriodStartTime.toUTCString()
                          )
                        ) {
                          if (
                            startTimeString > dayPeriodStartTime &&
                            endTimeString < nextPeriodStartTime
                          ) {
                            newAvailabilities.push(
                              {
                                availability_date: availability_date,
                                end_time: dayPeriodStartTime,
                                teacher_id,
                                start_time,
                              },
                              {
                                availability_date: availability_date,
                                start_time: nextPeriodStartTime,
                                teacher_id,
                                end_time,
                              }
                            );
                          } else if (startTimeString < dayPeriodStartTime) {
                            newAvailabilities.push({
                              availability_date: availability_date,
                              end_time: dayPeriodStartTime,
                              teacher_id,
                              start_time,
                            });
                          } else if (endTimeString > nextPeriodStartTime) {
                            newAvailabilities.push({
                              availability_date: availability_date,
                              start_time: nextPeriodStartTime,
                              teacher_id,
                              end_time,
                            });
                          }
                        }
                      }
                    );
                  }
                );
              }
            );

            //searching for coreSubjects
            const { commonSubjectHalls, commonSubjectsClassrooms } =
              await this.searchCommonSubjects(
                classroom_id,
                classroomHasSubjects,
                dalyProgrammedSubjects
              );

            //added coreSubjects to implicated classroom subjects (classroom_has_subject_id)
            classroomHasSubjects.push(...commonSubjectsClassrooms);
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
              commonSubjectsClassrooms,
              commonSubjectHalls
            );

            // prevent already programmed courses from appearing twice while others have not yet been programmed.
            //this is done by sending them to the bottom of the priority list
            classroomHasSubjects = classroomHasSubjects.sort((a, b) => {
              const aProgram = newPrograms.find(
                ({ classroom_has_subject_id: chs_id }) =>
                  chs_id === a.classroom_has_subject_id
              );
              const bProgram = newPrograms.find(
                ({ classroom_has_subject_id: chs_id }) =>
                  chs_id === b.classroom_has_subject_id
              );
              return aProgram && !bProgram ? -1 : 1;
            });

            //prevent a course from being programmed twice in the same day
            classroomHasSubjects = classroomHasSubjects.length
              ? classroomHasSubjects.filter(
                  ({ classroom_has_subject_id }) =>
                    !dalyProgrammedSubjects.includes(classroom_has_subject_id)
                )
              : [];
            const commonCores = classroomHasSubjects.length
              ? classroomHasSubjects.filter(
                  ({ subject_id }) =>
                    subject_id === classroomHasSubjects[0].subject_id
                )
              : [];
            // programs.push(...commonCores);
            dalyProgrammedSubjects.push(
              ...commonCores.map((_) => _.classroom_has_subject_id)
            );
            newPrograms.push(
              ...commonCores.map(({ hall_id, classroom_has_subject_id }) => ({
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
      timetableStartDate = new Date(
        new Date(timetableStartDate).setDate(
          new Date(timetableStartDate).getDate() + 1
        )
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
        where: {
          OR: usedAvailabilities.map((availability_id) => ({
            availability_id,
          })),
        },
      }),
      this.prismaService.availability.createMany({
        data: newAvailabilities,
        skipDuplicates: true,
      }),
    ]);
    return created_at.getTime();
  }

  async getAvailableTeachers(
    classroom_id: string,
    dayPeriod: { availability_date: Date; start_time: Date; end_time: Date },
    unwantedCourse: string[]
  ) {
    const availabilityDate = new Date(
      new Date(dayPeriod.availability_date).toDateString()
    );
    const teachers = await this.prismaService.teacher.findMany({
      orderBy: { teacher_type: 'asc' }, //This will prioritize part_time over permanent and permanent.
      select: {
        teacher_type: true,
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
        Availabilities: {
          select: {
            availability_date: true,
            availability_id: true,
            teacher_id: true,
            end_time: true,
            start_time: true,
          },
        },
      },
      where: {
        Availabilities: {
          some: {
            start_time: { lte: dayPeriod.start_time },
            end_time: { gte: dayPeriod.end_time },
            is_deleted: false,
            is_used: false,
          },
        },
        ClassroomHasSubjects: {
          some: {
            classroom_has_subject_id: {
              notIn: unwantedCourse,
            },
            Classroom: {
              classroom_id,
            },
          },
        },
      },
    });
    const availableTeachers = teachers.filter(({ Availabilities }) => {
      const index = Availabilities.findIndex(
        ({ availability_date }) =>
          availability_date.toDateString() === availabilityDate.toDateString()
      );
      return index >= 0;
    });
    const missionaries = availableTeachers.filter(
      (_) => _.teacher_type === 'MISSIONARY'
    );
    const otherTeachers = availableTeachers.filter(
      (_) => _.teacher_type !== TeacherTypeEnum.MISSIONARY
    );
    return [...missionaries, ...otherTeachers];
  }

  async searchCommonSubjects(
    classroom_id: string,
    classroomHasSubjects: IClassroomHasSubject[],
    unwantedCourse: string[]
  ) {
    const commonSubjectsClassrooms: IClassroomHasSubject[] = [];
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
      commonSubjectsClassrooms.push(
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

    return { commonSubjectsClassrooms, commonSubjectHalls };
  }

  attributeHalls(
    availableHalls: { hall_id: string }[],
    classroomHasSubjects: IClassroomHasSubject[],
    commonSubjectsClassrooms: IClassroomHasSubject[],
    commonSubjectHalls: { hall_id: string; subject_id: string }[]
  ) {
    let iterateHalls = availableHalls.length;

    return classroomHasSubjects
      .map((classroomHasSubject) => {
        --iterateHalls;
        //getting non core subjects hall_id
        const hall_id =
          iterateHalls >= 0 ? availableHalls[iterateHalls].hall_id : null;
        const commonCoreSubject = commonSubjectsClassrooms.find(
          ({ subject_id: id }) => id === classroomHasSubject.subject_id
        );
        return commonCoreSubject
          ? {
              ...classroomHasSubject,
              //setting coreSubject hall_id with capable hall_id,
              hall_id: commonSubjectHalls.find(
                ({ subject_id }) =>
                  subject_id === classroomHasSubject.subject_id
              ).hall_id,
            }
          : classroomHasSubject.hall_id === null
          ? {
              //TODO check available halls capacity before attributing it to course
              ...classroomHasSubject,
              hall_id,
            }
          : classroomHasSubject;
      })
      .filter(({ hall_id }) => hall_id);
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
