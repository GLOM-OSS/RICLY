import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from './auth.guard';
import { GoogleGuard } from './google/google.guard';

@Controller('auth')
export class AuthController {

  @Get('')
  @UseGuards(GoogleGuard)
  async register(@Res() res: Response) {
    return res.redirect(`${process.env.RICLY_APP_SUCCESS_URL}`);
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
