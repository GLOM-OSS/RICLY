import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeacherService {
  constructor(private prismaService: PrismaService) {}

  async createMany(
    persons: Prisma.PersonCreateManyInput[],
    teachers: Prisma.TeacherCreateManyInput[]
  ) {
    return this.prismaService.$transaction([
      this.prismaService.person.createMany({
        data: persons,
        skipDuplicates: true,
      }),
      this.prismaService.teacher.createMany({
        data: teachers,
        skipDuplicates: true,
      }),
      this.prismaService.teacher.updateMany({
        data: { is_deleted: false },
        where: { OR: persons.map(({ email }) => ({ Person: { email } })) },
      }),
    ]);
  }

  async deleteMany(teacherIds: string[]) {
    return this.prismaService.teacher.updateMany({
      data: { is_deleted: true },
      where: { OR: teacherIds.map((id) => ({ teacher_id: id })) },
    });
  }

  async findAll(school_id: string) {
    const teachers = await this.prismaService.teacher.findMany({
      select: {
        teacher_id: true,
        teacher_type: true,
        hours_per_week: true,
        Person: { select: { fullname: true, email: true, phone_number: true } },
      },
      where: { school_id, is_deleted: false },
    });
    return teachers.map(({ Person, ...teacher }) => ({
      ...teacher,
      ...Person,
    }));
  }
}
