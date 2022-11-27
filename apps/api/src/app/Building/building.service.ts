import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BuildingService {
  constructor(private prismaService: PrismaService) {}

  async createMany(
    buildings: Prisma.BuildingCreateManyInput[],
    halls: Prisma.HallCreateManyInput[]
  ) {
    return this.prismaService.$transaction([
      this.prismaService.building.createMany({
        data: buildings,
        skipDuplicates: true,
      }),
      this.prismaService.hall.createMany({
        data: halls,
        skipDuplicates: true,
      }),
    ]);
  }

  async createManyBuildings(buildings: Prisma.BuildingCreateManyInput[]) {
    return this.prismaService.building.createMany({
      data: buildings,
      skipDuplicates: true,
    });
  }

  async createManyHalls(halls: Prisma.HallCreateManyInput[]) {
    return this.prismaService.hall.createMany({
      data: halls,
      skipDuplicates: true,
    });
  }

  async findAll(school_id: string) {
    return this.prismaService.building.findMany({
      select: {
        building_id: true,
        building_code: true,
        Halls: {
          select: { hall_capacity: true, hall_code: true, hall_id: true },
        },
      },
      where: {
        school_id,
        is_deleted: false,
        Halls: { every: { is_deleted: false } },
      },
    });
  }

  async deleteBuildings(buildingIds: string[]) {
    return this.prismaService.building.updateMany({
      data: { is_deleted: true },
      where: {
        OR: buildingIds.map((building_id) => ({ building_id })),
      },
    });
  }

  async deleteHalls(hallIds: string[]) {
    return this.prismaService.hall.updateMany({
      data: { is_deleted: true },
      where: {
        OR: hallIds.map((hall_id) => ({ hall_id })),
      },
    });
  }
}
