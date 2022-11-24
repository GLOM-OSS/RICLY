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
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@ricly/interfaces';
import { Request } from 'express';
import { Roles } from '../app.decorator';
import { CreateAvailabilityDto, getRoleId, User } from '../app.dto';
import { AuthenticatedGuard } from '../Auth/auth.guard';
import { AvailabilityService } from './availability.service';

@Roles(Role.TEACHER)
@ApiTags('Availabilities')
@Controller('availabilities')
@UseGuards(AuthenticatedGuard)
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @Get('all')
  async findAll(@Req() request: Request) {
    const { roles } = request.user as User;
    return this.availabilityService.findAll(getRoleId(roles, Role.TEACHER));
  }

  @Post('new')
  async addAvailabilities(
    @Req() request: Request,
    @Body() { availabilities, end_time, start_time }: CreateAvailabilityDto
  ) {
    try {
      const { roles } = request.user as User;
      const newAvailabilities = availabilities.map((availability_date) => ({
        end_time: new Date(end_time),
        start_time: new Date(start_time),
        teacher_id: getRoleId(roles, Role.TEACHER),
        availability_date: new Date(availability_date),
      }));
      return this.availabilityService.addNewAvailibilities(newAvailabilities);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('delete')
  async deleteAvailabities(@Query() { availabilities }) {
    try {
      return this.availabilityService.deleteAvailabilities(availabilities);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('teachers')
  async getAvailableTeachers(@Query('classroom_id') classroom_id: string) {
    return this.availabilityService.getAvailableTeachers(classroom_id);
  }

  @Get('classrooms')
  @Roles(Role.COORDINATOR)
  async getCoordinatorClassrooms(@Req() request: Request) {
    const { roles } = request.user as User;
    return this.availabilityService.getCoordinatorClasses(
      getRoleId(roles, Role.COORDINATOR)
    );
  }
}
