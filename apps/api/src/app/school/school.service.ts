import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getRandomString } from '../../prisma/utils';
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
    { school_acronym, school_domain, school_name }: SchoolPostDto
  ) {
    const school_code = await this.getSchoolCode(school_acronym as string);
    return this.prismaService.school.create({
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
