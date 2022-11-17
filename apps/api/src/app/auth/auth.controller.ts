import {
  Controller,
  Get,
  Req,
  UseGuards
} from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedGuard } from './auth.guard';
import { GoogleGuard } from './google/google.guard';

@Controller('auth')
export class AuthController {

  @Get('')
  @UseGuards(GoogleGuard)
  async register(@Req() request: Request) {
    return request.user;
  }
  
  @Get('google-signin')
  @UseGuards(GoogleGuard)
  async signIn() {
    //google authentication
  }
  
  @Get('/user')
  @UseGuards(AuthenticatedGuard)
  async getUser(@Req() request: Request) {
    console.log(request.user);
    return request.user;
  }
}
