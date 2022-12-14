import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import * as connectRedis from 'connect-redis';
import * as session from 'express-session';
import * as passport from 'passport';
import { createClient } from 'redis';

import { Logger } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { randomUUID } from 'crypto';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { AppController } from './app.controller';
import { AppInterceptor } from './app.interceptor';
import { AppService } from './app.service';
import { AuthModule } from './Auth/auth.module';
import { SchoolModule } from './School/school.module';
import { SubscriptionModule } from './Subscription/subscription.module';
import { BuildingModule } from './Building/building.module';
import { TeacherModule } from './Teacher/teacher.module';
import { ClassroomModule } from './Classroom/classrrom.module';
import { SubjectModule } from './Subject/subject.module';
import { StudentModule } from './Student/student.module';
import { AppMiddleware } from './app.middleware';
import { AvailabilityModule } from './Availability/availability.module';
import { TimeTableModule } from './Timetable/timetable.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({
      session: true,
    }),
    PrismaModule,
    AuthModule,
    SchoolModule,
    SubscriptionModule,
    BuildingModule,
    TeacherModule,
    ClassroomModule,
    SubjectModule,
    StudentModule,
    AvailabilityModule,
    TimeTableModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AppInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const redisClient = createClient({
      legacyMode: true,
      url: `redis://${process.env.REDIS_HOST}`,
    });
    redisClient.connect().catch((message) => Logger.error(message));
    const RedisStore = connectRedis(session);

    consumer
      .apply(
        session({
          name: 'RICLY-5BB35922144F',
          store: new RedisStore({
            client: redisClient,
          }),
          secret: process.env.SESSION_SECRET,
          genid: () => randomUUID(),
          saveUninitialized: false,
          resave: false,
          rolling: true,
          cookie: {
            maxAge: 15 * 60 * 1000, //15 minutes of inativity
          },
        }),
        passport.initialize(),
        passport.session(),
        AppMiddleware
      )
      .forRoutes('*');
  }
}
