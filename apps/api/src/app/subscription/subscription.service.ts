import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private prismaService: PrismaService) {}

  async create(subscribeData: Prisma.SubscriptionCreateInput) {
    return this.prismaService.subscription.create({
      data: subscribeData,
    });
  }

  async findAll(school_id: string) {
    return this.prismaService.subscription.findMany({
      where: { school_id },
    });
  }
}
