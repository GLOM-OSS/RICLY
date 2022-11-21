import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AUTH500 } from '../../exception';
import { Roles } from '../app.decorator';
import { Role, SchoolPostDto, User, UserRole } from '../app.dto';
import { AuthenticatedGuard } from '../auth/auth.guard';
import { SchoolService } from './school.service';

@ApiTags('School')
@Controller('school')
@Roles(Role.DEVELOPER)
@UseGuards(AuthenticatedGuard)
export class SchoolController {
  constructor(private schoolService: SchoolService) {}

  private getRoleId(roles: UserRole[], wantedRole: Role) {
    const { user_id: developer_id } = roles.find(
      ({ role }) => role === wantedRole
    );
    return developer_id;
  }

  @Post('new')
  async addNewSchool(
    @Req() request: Request,
    @Body() newSchool: SchoolPostDto
  ) {
    const { preferred_lang, roles } = request.user as User;
    try {
      return await this.schoolService.create(
        this.getRoleId(roles, Role.DEVELOPER),
        newSchool
      );
    } catch (error) {
      throw new HttpException(
        AUTH500[preferred_lang],
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('/all')
  async getSchools(@Req() request: Request) {
    const { roles } = request.user as User;
    return await this.schoolService.findAll(
      this.getRoleId(roles, Role.DEVELOPER)
    );
  }

  @Get(':school_code')
  async getSchool(@Param('school_code') school_code: string) {
    return await this.schoolService.findOne(school_code);
  }
}
