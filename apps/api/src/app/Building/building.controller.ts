import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post, Req,
  Session,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import 'multer';
import { Readable } from 'stream';
import { AUTH500 } from '../../exception';
import { readAndProcessFile } from '../../utils/csv-parser';
import { Roles } from '../app.decorator';
import { DeleteBuildingDto, DeleteHallDto, Role, User } from '../app.dto';
import { AuthenticatedGuard } from '../Auth/auth.guard';
import { BuildingService } from './building.service';

export interface Hall {
  hall_code: string;
  hall_capacity: number;
  building_code: string;
}

@ApiTags('Buildings')
@Roles(Role.SECRETARY)
@Controller('buildings')
@UseGuards(AuthenticatedGuard)
export class BuildingController {
  constructor(private buildingService: BuildingService) {}

  @Post('imports')
  @UseInterceptors(FileInterceptor('buildings'))
  async addBuildings(
    @Session() session,
    @UploadedFile() file: Express.Multer.File
  ) {
    const {
      passport: {
        user: { school_id },
      },
    } = session;
    try {
      const data = await readAndProcessFile<Hall>(
        ['hall_code', 'hall_capacity', 'building_code'],
        Readable.from(file.buffer)
      );
      const buildings: Prisma.BuildingCreateManyInput[] = [];
      const halls: Prisma.HallCreateManyInput[] = [];
      data.forEach(({ building_code, hall_capacity, hall_code }) => {
        const building = buildings.find(
          (_) => _.building_code === building_code
        );
        if (!building)
          buildings.push({
            building_id: randomUUID(),
            building_code,
            school_id,
          });
        const hall = halls.find((_) => _.hall_code === hall_code);
        if (!hall)
          halls.push({
            building_id: buildings.find(
              (_) => _.building_code === building_code
            ).building_id,
            hall_capacity,
            hall_code,
          });
      });
      return await this.buildingService.createMany(buildings, halls);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('all')
  async getBuildings(@Session() session) {
    const {
      passport: {
        user: { school_id },
      },
    } = session;
    return this.buildingService.findAll(school_id);
  }

  @Delete('delete')
  async deleteBuildings(
    @Req() request: Request,
    @Body() { buildings }: DeleteBuildingDto
  ) {
    const { preferred_lang } = request.user as User;
    try {
      return await this.buildingService.deleteBuildings(buildings);
    } catch (error) {
      throw new HttpException(
        AUTH500[preferred_lang],
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
 
  }
  
  @Delete('halls/delete')
  async deleteHalls(
    @Req() request: Request,
    @Body() { halls }: DeleteHallDto
  ) {
    const { preferred_lang } = request.user as User;
    try {
      return await this.buildingService.deleteHalls(halls);
    } catch (error) {
      throw new HttpException(
        AUTH500[preferred_lang],
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
