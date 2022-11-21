import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AUTH500 } from '../../exception';
import { IsPublic, Roles } from '../app.decorator';
import { NewPasswordDto, Role, User } from '../app.dto';
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
    const { preferred_lang, roles } = request.user as User;
    try {
      const { user_id: developer_id } = roles.find(
        ({ role }) => role === Role.DEVELOPER
      );
      return await this.authService.changePassword(developer_id, newPassword);
    } catch (error) {
      throw new HttpException(
        AUTH500[preferred_lang],
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('/user')
  async getUser(@Req() request: Request) {
    console.log(request.user);
    return request.user;
  }
}
