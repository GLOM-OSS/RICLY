import { Injectable } from '@nestjs/common';
import { SchoolPostDto } from '@ricly/dto';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

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
    { school_acronym, school_domain, school_name }: SchoolPostDto
  ) {
    const school_code = await this.getSchoolCode(school_acronym as string);
    const api_test_key = `${randomUUID().replace('-', '')}`;
    const api_key = `${randomUUID().replace('-', '')}${randomUUID().replace(
      '-',
      ''
    )}`;
    return this.prismaService.school.create({
      data: {
        api_key,
        school_name,
        school_code,
        api_test_key,
        school_domain,
        school_acronym,
        api_calls_left: 0,
        api_calls_used: 0,
        test_api_calls_left: 500,
        Developer: { connect: { developer_id } },
      },
    });
  }

  async findAll(developer_id: string) {
    return this.prismaService.school.findMany({
      where: { developer_id },
    });
  }

  async findOne(school_id: string) {
    return this.prismaService.school.findUnique({
      where: { school_id },
    });
  }
}
