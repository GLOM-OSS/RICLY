import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private prismaService: PrismaService) {}

  async findAll(teacher_id: string) {
    return this.prismaService.availability.findMany({
      select: {
        availability_id: true,
        availability_date: true,
        start_time: true,
        end_time: true,
        is_used: true,
      },
      where: { is_deleted: false, teacher_id },
    });
  }

  async addNewAvailibilities(
    availabilities: Prisma.AvailabilityCreateManyInput[]
  ) {
    return this.prismaService.$transaction([
      this.prismaService.availability.createMany({
        data: availabilities,
        skipDuplicates: true,
      }),
      this.prismaService.availability.updateMany({
        data: { is_deleted: false },
        where: {
          OR: availabilities.map(({ availability_date }) => ({
            availability_date,
          })),
        },
      }),
    ]);
  }

  async deleteAvailabilities(availabilityIds: string[]) {
    return this.prismaService.availability.updateMany({
      data: { is_deleted: true },
      where: {
        is_used: false,
        OR: availabilityIds.map((availability_id) => ({ availability_id })),
      },
    });
  }

  async getAvailableTeachers(classroom_id: string) {
    const teachers = await this.prismaService.teacher.findMany({
      select: {
        teacher_id: true,
        teacher_type: true,
        hours_per_week: true,
        Person: { select: { fullname: true, email: true, phone_number: true } },
      },
      where: {
        is_deleted: false,
        ClassroomHasSubjects: { some: { classroom_id } },
        Availabilities: {
          every: { is_used: false, availability_date: { gt: new Date() } },
        },
      },
    });
    return teachers.map(({ Person, ...teacher }) => ({
      ...teacher,
      ...Person,
    }));
  }

  async getCoordinatorClasses(coordinator: string) {
    const teachers = await this.prismaService.classroom.findMany({
      select: {
        classroom_id: true,
        classroom_name: true,
        classroom_acronym: true,
        Coordinator: { select: { Person: { select: { email: true } } } },
      },
      where: { coordinator, is_deleted: false },
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
}
