import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

export interface SubjectCsvModel {
  email: string;
  subject_code: string;
  subject_name: string;
  classroom_code: string;
}

@Injectable()
export class SubjectService {
  constructor(private prismaService: PrismaService) {}

  async createMany(csvSubjects: SubjectCsvModel[], school_id: string) {
    console.log(csvSubjects);
    const subjects: Prisma.SubjectCreateManyInput[] = [];
    const classroomHasSubjects: Prisma.ClassroomHasSubjectCreateManyInput[] =
      [];
    for (let i = 0; i < csvSubjects.length; i++) {
      const { email, classroom_code, subject_code, subject_name } =
        csvSubjects[i];
      const teacher = await this.prismaService.teacher.findFirst({
        where: { Person: { email }, School: { school_id } },
      });
      const classroom = await this.prismaService.classroom.findFirst({
        select: {
          classroom_id: true,
          School: { select: { school_code: true } },
        },
        where: { School: { school_id }, classroom_acronym: classroom_code },
      });
      if (teacher && classroom) {
        const subject_id = randomUUID();
        subjects.push({
          subject_id,
          subject_name,
          subject_acronym: subject_code,
          subject_code: `${classroom.School.school_code}${subject_code}`,
        });
        classroomHasSubjects.push({
          subject_id,
          teacher_id: teacher.teacher_id,
          classroom_id: classroom.classroom_id,
        });
      }
    }
    return this.prismaService.$transaction([
      this.prismaService.subject.createMany({
        data: subjects,
        skipDuplicates: true,
      }),
      this.prismaService.classroomHasSubject.createMany({
        data: classroomHasSubjects,
        skipDuplicates: true,
      }),
    ]);
  }

  async deleteMany(subjectIds: string[]) {
    return this.prismaService.subject.updateMany({
      data: { is_deleted: true },
      where: { OR: subjectIds.map((id) => ({ subject_id: id })) },
    });
  }

  async findAll(school_id: string) {
    const subjects = await this.prismaService.subject.findMany({
      select: {
        subject_id: true,
        subject_name: true,
        subject_acronym: true,
        ClassroomHasSubjects: {
          select: {
            Teacher: {
              select: { Person: { select: { email: true } } },
            },
            Classroom: {
              select: {
                classroom_id: true,
                classroom_name: true,
                classroom_acronym: true,
              },
            },
          },
        },
      },
      where: { ClassroomHasSubjects: { every: { Classroom: { school_id } } } },
    });
    return subjects.map(({ ClassroomHasSubjects, ...subject }) => {
      let teacher_email: string;
      const classrooms = ClassroomHasSubjects.map(
        ({
          Teacher: {
            Person: { email },
          },
          Classroom: { ...classroom },
        }) => {
          teacher_email = email;
          return {
            ...classroom,
          };
        }
      );
      return {
        ...subject,
        classrooms: classrooms.map(
          ({ classroom_acronym: classroom_code, ...classroom }) => ({
            classroom_code,
            ...classroom,
          })
        ),
        teacher_email,
      };
    });
  }
}
