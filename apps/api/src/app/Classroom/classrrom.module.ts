import { Module } from '@nestjs/common';
import { classroomController } from './classroom.controller';
import { ClassroomService } from './classroom.service';

@Module({
  providers: [ClassroomService],
  controllers: [classroomController],
})
export class ClassroomModule {}
