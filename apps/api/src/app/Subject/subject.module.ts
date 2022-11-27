import { Module } from '@nestjs/common';
import { SubjectController } from './subject.controller';
import { SubjectService } from './subject.service';

@Module({
  providers: [SubjectService],
  controllers: [SubjectController],
})
export class SubjectModule {}
