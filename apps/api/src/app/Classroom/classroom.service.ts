import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

export interface ClassrooomCsvModel {
  email: string;
  hall_code: string;
  classroom_name: string;
  classroom_code: string;
  classroom_session: 'DAY' | 'NIGHT';
}

@Injectable()
export class ClassroomService {
  constructor(private prismaService: PrismaService) {}

  async createClassrooms(
    csvClassrooms: ClassrooomCsvModel[],
    school_id: string
  ) {
    const classrooms: Prisma.ClassroomCreateManyInput[] = [];
    const weekdays: Prisma.WeekdayCreateManyInput[] = [];
    const weekdayBreaks: Prisma.BreakCreateManyInput[] = [];
    const teachers = await this.prismaService.teacher.findMany({
      where: {
        Person: { email: { in: csvClassrooms.map((_) => _.email) } },
        School: { school_id },
      },
      select: {
        teacher_id: true,
        Person: { select: { email: true } },
        School: { select: { school_code: true } },
      },
    });
    const halls = await this.prismaService.hall.findMany({
      select: { hall_id: true, hall_code: true },
      where: { hall_code: { in: csvClassrooms.map((_) => _.hall_code) } },
    });
    for (let i = 0; i < csvClassrooms.length; i++) {
      const {
        email,
        classroom_session,
        classroom_code,
        classroom_name,
        hall_code,
      } = csvClassrooms[i];
      const teacher = teachers.find(({ Person }) => Person.email === email);
      if (teacher) {
        const classroom_id = randomUUID();
        classrooms.push({
          school_id,
          classroom_id,
          classroom_name,
          coordinator: teacher.teacher_id,
          classroom_acronym: classroom_code,
          hall_id: halls.find((_) => _.hall_code === hall_code)?.hall_id,
          classroom_code: `${teacher.School.school_code}${classroom_code}`,
        });
        //seeding default classroom weekdays with thier start  and end time.
        const dayStartTime = new Date(new Date().setUTCHours(8, 30));
        const dayEndTime = new Date(new Date().setUTCHours(17, 30));
        const nightStartTime = new Date(new Date().setUTCHours(6, 30));
        const nightEndTime = new Date(new Date().setUTCHours(21, 30));
        const classWeekdays = [2, 3, 4, 5, 6].map((weekday) => {
          const weekday_id = randomUUID();
          //seeding default classroom weekday breaks
          weekdayBreaks.push({
            classroom_id,
            weekday_id,
            end_time: new Date(new Date().setUTCHours(12, 30)),
            start_time: new Date(new Date().setUTCHours(11, 30)),
          });

          return classroom_session === 'DAY'
            ? {
                weekday,
                weekday_id,
                classroom_id,
                end_time: dayEndTime,
                start_time: dayStartTime,
              }
            : {
                weekday,
                weekday_id,
                classroom_id,
                end_time: nightEndTime,
                start_time: nightStartTime,
              };
        });
        weekdays.push(...classWeekdays);
      }
    }
    return this.prismaService.$transaction([
      this.prismaService.classroom.createMany({
        data: classrooms,
        skipDuplicates: true,
      }),
      this.prismaService.weekday.createMany({
        data: weekdays,
        skipDuplicates: true,
      }),
      this.prismaService.break.createMany({
        data: weekdayBreaks,
        skipDuplicates: true,
      }),
      this.prismaService.classroom.updateMany({
        data: { is_deleted: false },
        where: {
          OR: classrooms.map(({ classroom_code }) => ({ classroom_code })),
        },
      }),
    ]);
  }

  async deleteMany(classroomIds: string[]) {
    return this.prismaService.classroom.updateMany({
      data: { is_deleted: true },
      where: { OR: classroomIds.map((id) => ({ classroom_id: id })) },
    });
  }

  async findAll(school_id: string) {
    const teachers = await this.prismaService.classroom.findMany({
      select: {
        classroom_id: true,
        classroom_name: true,
        classroom_acronym: true,
        Coordinator: { select: { Person: { select: { email: true } } } },
      },
      where: { school_id, is_deleted: false },
    });
    return teachers.map(
      ({
        Coordinator: {
          Person: { email },
        },
        classroom_acronym,
        ...teacher
      }) => ({
        ...teacher,
        coordinator_email: email,
        classroom_code: classroom_acronym,
      })
    );
  }

  async getClassroomBreak(classroom_id: string) {
    return this.prismaService.break.findFirst({
      select: { break_id: true, start_time: true, end_time: true },
      where: { classroom_id },
    });
  }

  async getClassroomWeekdays(classroom_id: string) {
    return this.prismaService.weekday.findMany({
      select: {
        weekday_id: true,
        weekday: true,
        end_time: true,
        start_time: true,
      },
      where: { classroom_id },
    });
  }
}
