import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Session,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { Readable } from 'stream';
import { AUTH500 } from '../../exception';
import { readAndProcessFile } from '../../utils/csv-parser';
import { Roles } from '../app.decorator';
import { DeleteTeacherDto, Role, User } from '../app.dto';
import { AuthenticatedGuard } from '../Auth/auth.guard';
import { TeacherService } from './teacher.service';

@Roles(Role.SECRETARY)
@ApiTags('Controller')
@Controller('teachers')
@UseGuards(AuthenticatedGuard)
export class TeacherController {
  constructor(private teacherService: TeacherService) {}

  @Post('imports')
  @UseInterceptors(FileInterceptor('teachers'))
  async importTeachers(
    @Session() session,
    @UploadedFile() file: Express.Multer.File
  ) {
    const {
      passport: {
        user: { school_id },
      },
    } = session;

    try {
      const data = await readAndProcessFile<{
        email: string;
        phone_number: string;
        hours_per_week: number;
        teacher_type: 'PART_TIME' | 'PERMAMENT' | 'MISSIONARY';
      }>(
        ['email', 'phone_number', 'teacher_type', 'hours_per_week'],
        Readable.from(file.buffer)
      );
      const persons: Prisma.PersonCreateManyInput[] = [];
      const teachers: Prisma.TeacherCreateManyInput[] = [];
      data.forEach(({ email, ...teacher }) => {
        const person_id = randomUUID();
        persons.push({
          email,
          person_id,
        });
        teachers.push({
          person_id,
          school_id,
          ...teacher,
        });
      });
      return this.teacherService.createMany(persons, teachers);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('all')
  async getTeachers(@Session() session) {
    const {
      passport: {
        user: { school_id },
      },
    } = session;
    return this.teacherService.findAll(school_id);
  }

  @Delete('delete')
  async deleteTeachers(
    @Req() request: Request,
    @Body() { teachers }: DeleteTeacherDto
  ) {
    const { preferred_lang } = request.user as User;
    try {
      return await this.teacherService.deleteMany(teachers);
    } catch (error) {
      throw new HttpException(
        AUTH500[preferred_lang],
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
