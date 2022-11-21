import { Module } from '@nestjs/common';
import { BuildingController } from './building.controller';
import { BuildingService } from './building.service';

@Module({
  controllers: [BuildingController],
  providers: [BuildingService],
})
export class BuildingModule {}
