import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../app.decorator';
import { Role } from '../app.dto';
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
}
