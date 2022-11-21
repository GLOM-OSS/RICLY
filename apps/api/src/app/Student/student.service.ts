import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

export interface StudentCsvModel {
  email: string;
  fullname: string;
  classroom_code: string;
}

@Injectable()
export class StudentService {
  constructor(private prismaService: PrismaService) {}

  async createMany(csvStudents: StudentCsvModel[], school_id: string) {
    const persons: Prisma.PersonCreateManyInput[] = [];
    const students: Prisma.StudentCreateManyInput[] = [];
    for (let i = 0; i < csvStudents.length; i++) {
      const { fullname, email, classroom_code } = csvStudents[i];
      const person_id = randomUUID();
      const classroom = await this.prismaService.classroom.findFirst({
        where: { school_id, classroom_acronym: classroom_code },
      });
      if (classroom) {
        persons.push({
          email,
          fullname,
          person_id,
        });
        students.push({
          person_id,
          classroom_id: classroom.classroom_id,
        });
      }
    }
    return this.prismaService.$transaction([
      this.prismaService.person.createMany({
        data: persons,
        skipDuplicates: true,
      }),
      this.prismaService.student.createMany({
        data: students,
        skipDuplicates: true,
      }),
    ]);
  }

  async deleteMany(studentIds: string[]) {
    return this.prismaService.student.updateMany({
      data: { is_deleted: true },
      where: { OR: studentIds.map((id) => ({ student_id: id })) },
    });
  }

  async findAll(where: Prisma.StudentWhereInput) {
    const students = await this.prismaService.student.findMany({
      select: {
        student_id: true,
        Classroom: { select: { classroom_acronym: true } },
        Person: { select: { email: true, fullname: true } },
      },
      where: { ...where, is_deleted: false },
    });
    return students.map(
      ({
        Person: { email, fullname },
        Classroom: { classroom_acronym },
        student_id,
      }) => ({
        email,
        fullname,
        student_id,
        classroom_code: classroom_acronym,
      })
    );
  }
}
