import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class CustomStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(request: Request) {
    const clientUrl = request.headers.origin;
    const clientApiKey = request.get('RICLY-API-KEY');
    return this.authService.validateRequest(
      request.body,
      clientUrl,
      clientApiKey
    );
  }
}
