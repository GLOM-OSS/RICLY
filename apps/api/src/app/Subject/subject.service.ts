import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Subject } from '@ricly/interfaces';
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
      this.prismaService.classroomHasSubject.updateMany({
        data: { is_deleted: false },
        where: {
          OR: subjects.map(({ subject_code }) => ({
            Subject: { subject_code },
          })),
        },
      }),
    ]);
  }

  async deleteMany(subjectIds: string[]) {
    return this.prismaService.classroomHasSubject.updateMany({
      data: { is_deleted: true },
      where: { OR: subjectIds.map((id) => ({ Subject: { subject_id: id } })) },
    });
  }

  async removeClassrooms(subject_id: string, classroomIds: string[]) {
    return this.prismaService.classroomHasSubject.updateMany({
      data: { is_deleted: true },
      where: {
        subject_id,
        OR: classroomIds.map((id) => ({ classroom_id: id, subject_id })),
      },
    });
  }

  async findAll(where: Prisma.ClassroomHasSubjectWhereInput, take?: number) {
    const classroomHasSubjects =
      await this.prismaService.classroomHasSubject.findMany({
        take,
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
          Subject: {
            select: {
              subject_id: true,
              subject_name: true,
              subject_acronym: true,
            },
          },
        },
        where,
      });
    let subjects: Subject[] = [];
    classroomHasSubjects.forEach(
      ({
        Teacher: {
          Person: { email },
        },
        Subject,
        Classroom: { classroom_acronym: classroom_code, ...classroom },
      }) => {
        const subjectData = subjects.find(
          (_) => _.subject_id === Subject.subject_id
        );
        if (subjectData) {
          subjects = subjects.map((subject) =>
            subject.subject_id === Subject.subject_id
              ? {
                  ...subject,
                  classrooms: [
                    ...subject.classrooms,
                    { classroom_code, ...classroom },
                  ],
                }
              : subject
          );
        } else {
          const { subject_acronym, ...subjectData } = Subject;
          subjects.push({
            ...subjectData,
            teacher_email: email,
            subject_code: subject_acronym,
            classrooms: [{ classroom_code, ...classroom }],
          });
        }
      }
    );
    return subjects;
  }

  async findOne(subject_id: string) {
    const subjects = await this.findAll({ subject_id }, 1);
    if (subjects.length > 0) {
      return subjects[0];
    }
  }
}
