import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

export class CustomGuard extends AuthGuard('custom') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const clientApiKey = request.get('RICLY-API-KEY');
    let result = false;
    if (clientApiKey) {
      result = (await super.canActivate(context)) as boolean;
      await super.logIn(request);
      return result;
    }
    return result;
  }
}
