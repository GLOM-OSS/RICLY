import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req, UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '../app.decorator';
import { CreateTimetableDto, getRoleId, Role, User } from '../app.dto';
import { AuthenticatedGuard } from '../Auth/auth.guard';
import { TimetableService } from './timetable.service';

@ApiTags('Timetables')
@Roles(Role.COORDINATOR)
@Controller('timetables')
@UseGuards(AuthenticatedGuard)
export class TimetableController {
  constructor(private timetableService: TimetableService) {}

  @Get('all')
  async getTimetables(@Query('classroom_id') classroom_id: string) {
    return this.timetableService.getTimetables(classroom_id);
  }

  @Get(':timestamp')
  @Roles(Role.TEACHER)
  async getTimetablePrograms(
    @Req() request: Request,
    @Param('timestamp') timestamp: number,
    @Query('classroom_id') classroom_id?: string
  ) {
    const {
      user: { school_id },
    } = request.session['passport'];
    const { roles } = request.user as User;
    return this.timetableService.getTimetablePrograms({
      OR: [
        { created_at: new Date(timestamp) },
        { start_date: { gte: new Date(timestamp) } },
      ],
      ClassroomHasSubject: {
        ...(classroom_id
          ? {
              Teacher: {
                teacher_id: getRoleId(roles, Role.COORDINATOR),
                Classrooms: { some: { classroom_id, school_id } },
              },
            }
          : {
              Classroom: { school_id },
              teacher_id: getRoleId(roles, Role.TEACHER),
            }),
      },
    });
  }

  @Post('new')
  async createNewTimetable(
    @Body()
    newTimetable: CreateTimetableDto
  ) {
    try {
      return this.timetableService.generateTimetable(newTimetable);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
