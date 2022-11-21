import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Session,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Readable } from 'stream';
import { AUTH500 } from '../../exception';
import { readAndProcessFile } from '../../utils/csv-parser';
import { Roles } from '../app.decorator';
import { DeleteSubjectDto, Role, User } from '../app.dto';
import { AuthenticatedGuard } from '../Auth/auth.guard';
import { SubjectCsvModel, SubjectService } from './subject.service';

@ApiTags('Subjects')
@Roles(Role.SECRETARY)
@Controller('subjects')
@UseGuards(AuthenticatedGuard)
export class SubjectController {
  constructor(private subjectService: SubjectService) {}

  @Post('imports')
  @UseInterceptors(FileInterceptor('subjects'))
  async importSubjects(
    @Session() session,
    @UploadedFile() file: Express.Multer.File
  ) {
    const {
      passport: {
        user: { school_id },
      },
    } = session;

    try {
      const data = await readAndProcessFile<SubjectCsvModel>(
        ['subject_name', 'subject_code', 'classroom_code', 'email'],
        Readable.from(file.buffer)
      );
      return this.subjectService.createMany(data, school_id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('all')
  async getSubjects(
    @Query()
    {
      classroom_id,
      teacher_id,
    }: { classroom_id?: string; teacher_id?: string },
    @Session() session
  ) {
    const {
      passport: {
        user: { school_id },
      },
    } = session;
    return this.subjectService.findAll({
      ClassroomHasSubjects: {
        every: { teacher_id, Classroom: { school_id, classroom_id } },
      },
    });
  }

  @Get(':subject_id')
  async getSubject(@Param('subject_id') subject_id: string) {
    return this.subjectService.findOne(subject_id);
  }

  @Delete('delete')
  async deleteSubjects(
    @Req() request: Request,
    @Body() { subjects }: DeleteSubjectDto
  ) {
    const { preferred_lang } = request.user as User;
    try {
      return await this.subjectService.deleteMany(subjects);
    } catch (error) {
      throw new HttpException(
        AUTH500[preferred_lang],
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
