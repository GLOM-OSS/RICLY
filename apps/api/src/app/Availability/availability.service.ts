import { Injectable } from '@nestjs/common';
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
}
