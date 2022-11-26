import { Module } from '@nestjs/common';
import { ClassroomController } from './classroom.controller';
import { ClassroomService } from './classroom.service';

@Module({
  providers: [ClassroomService],
  controllers: [ClassroomController],
})
export class ClassroomModule {}
