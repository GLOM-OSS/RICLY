import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { NewPasswordDto, Role, User } from '@ricly/dto';
import { Request, Response } from 'express';
import { IsPublic, Roles } from '../app.decorator';
import { AuthenticatedGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { GoogleGuard } from './google/google.guard';
import { LocalGuard } from './local/local.guard';

@Controller('auth')
@Roles(Role.DEVELOPER)
@UseGuards(AuthenticatedGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('')
  @IsPublic()
  @UseGuards(GoogleGuard)
  async register(@Res() res: Response) {
    return res.redirect(`${process.env.RICLY_APP_SUCCESS_URL}`);
  }

  @IsPublic()
  @Post('signin')
  @UseGuards(LocalGuard)
  async localSignIn(@Req() request: Request) {
    return request.user;
  }

  @IsPublic()
  @Get('google-signin')
  @UseGuards(GoogleGuard)
  async signIn() {
    //google authentication
  }

  @Post('new-password')
  async resetPassword(
    @Req() request: Request,
    @Body() newPassword: NewPasswordDto
  ) {
    const { roles } = request.user as User;
    try {
      const { user_id: developer_id } = roles.find(
        ({ role }) => role === Role.DEVELOPER
      );
      return await this.authService.changePassword(developer_id, newPassword);
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/user')
  async getUser(@Req() request: Request) {
    console.log(request.user);
    return request.user;
  }
}
