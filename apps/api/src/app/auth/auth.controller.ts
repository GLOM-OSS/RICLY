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
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AUTH500 } from '../../exception';
import { IsPublic, Roles } from '../app.decorator';
import { NewPasswordDto, Role, User } from '../app.dto';
import { AuthenticatedGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { CustomGuard } from './custom/custom.guard';
import { GoogleGuard } from './google/google.guard';
import { LocalGuard } from './local/local.guard';

@Controller('auth')
@Roles(Role.DEVELOPER)
@ApiTags('Authentication')
@UseGuards(AuthenticatedGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @IsPublic()
  @Get('callback')
  @ApiExcludeEndpoint(true)
  @UseGuards(GoogleGuard)
  async register(@Req() request: Request, @Res() res: Response) {
    if (request.get('RICLY-API-KEY'))
      return res.redirect(`${process.env.RICLY_APP_SUCCESS_URL}/dashboard`);
    return res.redirect(`${process.env.RICLY_APP_SUCCESS_URL}/schools`);
  }

  @IsPublic()
  @Post('signin')
  @ApiExcludeEndpoint(true)
  @UseGuards(LocalGuard)
  async localSignIn(@Req() request: Request) {
    return request.user;
  }

  @IsPublic()
  @Get('google-signin')
  @ApiExcludeEndpoint(true)
  @UseGuards(GoogleGuard)
  async signIn() {
    //google authentication
  }

  @IsPublic()
  @Post('app-signin')
  @UseGuards(CustomGuard)
  async apiSignin(@Req() request: Request) {
    return request.user;
  }

  @Post('new-password')
  @ApiExcludeEndpoint(true)
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
    return request.user;
  }

  @Get('/close')
  async closeSession(@Req() request: Request, @Res() res: Response) {
    try {
      request.logOut({ keepSessionInfo: false }, (err) => {
        if (err) throw new Error(err);
        res.redirect(request.headers.origin);
      });
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
