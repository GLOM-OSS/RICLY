import {
  ExecutionContext, HttpStatus,
  UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AUTH400 } from '../../../exception';

export class GoogleGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    try {
      const result = (await super.canActivate(context)) as boolean;
      await super.logIn(request);
      return result;
    } catch (error) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: AUTH400['fr'],
      });
    }
  }
}
