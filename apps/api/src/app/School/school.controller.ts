import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ERR03 } from '../../exception';
import { Roles } from '../app.decorator';
import { Role, SchoolPostDto, User, UserRole } from '../app.dto';
import { AuthenticatedGuard } from '../Auth/auth.guard';
import { SchoolService } from './school.service';

@Controller('school')
@UseGuards(AuthenticatedGuard)
@Roles(Role.DEVELOPER, Role.SECRETARY)
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
      const existingSchool = await this.schoolService.findOne({
        school_domain: newSchool.school_domain,
      });
      if (existingSchool)
        throw new HttpException(
          ERR03('school')[preferred_lang],
          HttpStatus.NOT_ACCEPTABLE
        );

      return await this.schoolService.create(
        this.getRoleId(roles, Role.DEVELOPER),
        newSchool
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('profile')
  async getSchoolProfile(@Req() request: Request) {
    const clientUrl = request.headers.origin;
    const clientApiKey = request.get('RICLY-API-KEY');
    return await this.schoolService.findOne({
      OR: {
        api_test_key: clientApiKey,
        AND: {
          api_key: clientApiKey,
          school_domain: clientUrl,
        },
      },
    });
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
    return await this.schoolService.findOne({ school_code });
  }

  @Delete(':school_code/delete')
  async deleteSchool(@Param('school_code') school_code: string) {
    return await this.schoolService.deleteSchool(school_code);
  }
}
