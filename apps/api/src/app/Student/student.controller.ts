import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  Session,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Readable } from 'stream';
import { AUTH500 } from '../../exception';
import { readAndProcessFile } from '../../utils/csv-parser';
import { Roles } from '../app.decorator';
import { DeleteStudentDto, Role, User } from '../app.dto';
import { AuthenticatedGuard } from '../Auth/auth.guard';
import { StudentService } from './student.service';

@ApiTags('Students')
@Roles(Role.SECRETARY)
@Controller('students')
@UseGuards(AuthenticatedGuard)
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Post('imports')
  @UseInterceptors(FileInterceptor('students'))
  async importStudents(
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
        fullname: string;
        email: string;
        classroom_code: string;
      }>(['fullname', 'email', 'classroom_code'], Readable.from(file.buffer));
      return this.studentService.createMany(data, school_id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('all')
  async getStudents(
    @Query()
    {
      classroom_id,
      subject_id,
    }: { classroom_id?: string; subject_id?: string },
    @Session() session
  ) {
    const {
      passport: {
        user: { school_id },
      },
    } = session;
    return this.studentService.findAll({
      Classroom: {
        school_id,
        classroom_id,
        ...(subject_id
          ? { ClassroomHasSubjects: { some: { subject_id } } }
          : {}),
      },
    });
  }

  @Delete('delete')
  async deleteStudents(
    @Req() request: Request,
    @Body() { students }: DeleteStudentDto
  ) {
    const { preferred_lang } = request.user as User;
    try {
      return await this.studentService.deleteMany(students);
    } catch (error) {
      throw new HttpException(
        AUTH500[preferred_lang],
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
