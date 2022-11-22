import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { getRandomString } from '../../utils';
import { SchoolPostDto } from '../app.dto';

@Injectable()
export class SchoolService {
  constructor(private prismaService: PrismaService) {}

  private getNumberString(number: number) {
    return number < 10
      ? `000${number}`
      : number < 100
      ? `00${number}`
      : number < 1000
      ? `0${number}`
      : `${number}`;
  }

  private async getSchoolCode(acronym: string) {
    const numberOfSchools = await this.prismaService.school.count({
      where: { school_acronym: acronym },
    });
    return `${acronym}${this.getNumberString(numberOfSchools + 1)}`;
  }

  async create(
    developer_id: string,
    {
      school_acronym,
      school_domain,
      school_name,
      secretary_email,
    }: SchoolPostDto
  ) {
    const school_code = await this.getSchoolCode(school_acronym as string);
    const { api_key, ...school } = await this.prismaService.school.create({
      data: {
        school_name,
        school_code,
        school_domain,
        school_acronym,
        api_calls_left: 0,
        api_calls_used: 0,
        test_api_calls_left: 500,
        api_key: getRandomString(64),
        api_test_key: getRandomString(32),
        Developer: { connect: { developer_id } },
        Secretaries: {
          create: {
            Person: {
              connectOrCreate: {
                create: { email: secretary_email },
                where: { email: secretary_email },
              },
            },
          },
        },
      },
    });
    return { ...school, api_key: school_domain ? api_key : null };
  }

  async findAll(developer_id: string) {
    return await this.prismaService.school.findMany({
      select: {
        school_domain: true,
        school_code: true,
        school_acronym: true,
        school_name: true,
      },
      where: { developer_id, is_deleted: false },
    });
  }

  async findOne(where: Prisma.SchoolWhereInput) {
    const school = await this.prismaService.school.findFirst({
      select: {
        school_name: true,
        school_code: true,
        school_acronym: true,
        school_domain: true,
        api_key: true,
        api_test_key: true,
        api_calls_used: true,
        api_calls_left: true,
        test_api_calls_left: true,
      },
      where,
    });
    if (school) {
      const { api_key, ...data } = school;
      return { ...data, api_key: data.school_domain ? api_key : null };
    }
    return null;
  }

  async deleteSchool(school_code: string) {
    return this.prismaService.school.update({
      data: { is_deleted: true },
      where: { school_code },
    });
  }
}
