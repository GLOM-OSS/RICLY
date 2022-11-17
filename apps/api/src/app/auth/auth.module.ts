import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthSerializer } from './auth.serializer';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google/google.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthSerializer, GoogleStrategy],
})
export class AuthModule {}
