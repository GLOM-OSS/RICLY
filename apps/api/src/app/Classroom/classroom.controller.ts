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
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Readable } from 'stream';
import { AUTH500 } from '../../exception';
import { readAndProcessFile } from '../../utils/csv-parser';
import { Roles } from '../app.decorator';
import { DeleteClassroomDto, Role, User } from '../app.dto';
import { ClassroomService, ClassrooomCsvModel } from './classroom.service';

@ApiTags('Classrooms')
@Roles(Role.SECRETARY)
@Controller('classrooms')
export class classroomController {
  constructor(private classroomService: ClassroomService) {}

  @Post('imports')
  @UseInterceptors(FileInterceptor('classrooms'))
  async importClassrooms(
    @Session() session,
    @UploadedFile() file: Express.Multer.File
  ) {
    const {
      passport: {
        user: { school_id },
      },
    } = session;

    try {
      const data = await readAndProcessFile<ClassrooomCsvModel>(
        ['classroom_name', 'classroom_code', 'classroom_session', 'email'],
        Readable.from(file.buffer)
      );
      console.log(data)
      return this.classroomService.createMany(data, school_id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('all')
  async getClassrroms(@Session() session) {
    const {
      passport: {
        user: { school_id },
      },
    } = session;
    return this.classroomService.findAll(school_id);
  }

  @Delete('delete')
  async deleteClassrooms(
    @Req() request: Request,
    @Body() { classrooms }: DeleteClassroomDto
  ) {
    const { preferred_lang } = request.user as User;
    try {
      return await this.classroomService.deleteMany(classrooms);
    } catch (error) {
      throw new HttpException(
        AUTH500[preferred_lang],
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
