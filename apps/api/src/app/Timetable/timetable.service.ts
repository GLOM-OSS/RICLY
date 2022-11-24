import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

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
}
