import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role, SchoolPostDto, User } from '@ricly/dto';
import { Request } from 'express';
import { AUTH500 } from '../../exception';
import { Roles } from '../app.decorator';
import { AuthenticatedGuard } from '../auth/auth.guard';
import { SchoolService } from './school.service';

@ApiTags('School')
@Controller('school')
@Roles(Role.DEVELOPER)
@UseGuards(AuthenticatedGuard)
export class SchoolController {
  constructor(private schoolService: SchoolService) {}

  @Post('new')
  async addNewSchool(
    @Req() request: Request,
    @Body() newSchool: SchoolPostDto
  ) {
    const { preferred_lang, roles } = request.user as User;
    try {
      const { user_id: developer_id } = roles.find(
        ({ role }) => role === Role.DEVELOPER
      );
      return await this.schoolService.create(developer_id, newSchool);
    } catch (error) {
      throw new HttpException(
        AUTH500[preferred_lang],
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
