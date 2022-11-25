import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../app.decorator';
import { CreateTimetableDto, Role } from '../app.dto';
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
    @Param('timestamp') timestamp: number,
    @Query('classroom_id') classroom_id?: string
  ) {
    return this.timetableService.getTimetablePrograms({
      OR: [
        { created_at: new Date(timestamp) },
        { start_date: { gte: new Date(timestamp) } },
      ],
      ...(classroom_id ? { ClassroomHasSubject: { classroom_id } } : {}),
    });
  }

  //   verify published program in slot (if it exists put program and end)
  // get available teachers for slot (part time has priority and created at has priority)
  // verify for every subject, if is common_core subject
  // it it's not common_core, verify if classroom has hall_id
  // if it has hall_id, then use hall_id
  // if it's common_core or classroom does not have hall_id, verify hall with capacity (number of course students) available for that slot
  // sort list by hall_id, teacher_type and created_at
  // if nobody has hall_id,slot is left empty
  // else first person on list wins slot
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
