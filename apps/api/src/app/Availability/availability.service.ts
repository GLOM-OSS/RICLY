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
}
