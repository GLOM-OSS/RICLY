import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

export interface ClassrooomCsvModel {
  email: string;
  classroom_session: 'DAY' | 'NIGHT';
  classroom_name: string;
  classroom_code: string;
}

@Injectable()
export class ClassroomService {
  constructor(private prismaService: PrismaService) {}

  async createMany(csvClassrooms: ClassrooomCsvModel[], school_id: string) {
    const classrooms: Prisma.ClassroomCreateManyInput[] = [];
    const weekdays: Prisma.WeekdayCreateManyInput[] = [];
    for (let i = 0; i < csvClassrooms.length; i++) {
      const { email, classroom_session, ...classroom } = csvClassrooms[i];
      const teacher = await this.prismaService.teacher.findFirst({
        where: { Person: { email } },
      });
      if (teacher) {
        const classroom_id = randomUUID();
        classrooms.push({
          school_id,
          classroom_id,
          ...classroom,
          coordinator: teacher.teacher_id,
        });
        const dayStartTime = new Date(new Date().setHours(8, 30));
        const dayEndTime = new Date(new Date().setHours(17, 30));
        const nightStartTime = new Date(new Date().setHours(6, 30));
        const nightEndTime = new Date(new Date().setHours(21, 30));
        const classWeekdays = [2, 3, 4, 5, 6].map((weekday) =>
          classroom_session === 'DAY'
            ? {
                weekday,
                start_time: dayStartTime,
                end_time: dayEndTime,
                classroom_id,
              }
            : {
                weekday,
                start_time: nightStartTime,
                end_time: nightEndTime,
                classroom_id,
              }
        );
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
        classroom_code: true,
        Coordinator: { select: { Person: { select: { email: true } } } },
      },
      where: { school_id, is_deleted: false },
    });
    return teachers.map(
      ({
        Coordinator: {
          Person: { email },
        },
        ...teacher
      }) => ({
        ...teacher,
        teacher_email: email,
      })
    );
  }
}