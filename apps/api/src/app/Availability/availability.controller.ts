import { Controller, Get, Session, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@ricly/interfaces';
import { Roles } from '../app.decorator';
import { getRoleId } from '../app.dto';
import { AuthenticatedGuard } from '../Auth/auth.guard';
import { AvailabilityService } from './availability.service';

@ApiTags('Availabilities')
@Controller('availabilities')
@UseGuards(AuthenticatedGuard)
@Roles(Role.COORDINATOR, Role.TEACHER)
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @Get('all')
  async findAll(@Session() session) {
    const {
      passport: {
        user: { roles },
      },
    } = session;
    return this.availabilityService.findAll(getRoleId(roles, Role.TEACHER));
  }
}
