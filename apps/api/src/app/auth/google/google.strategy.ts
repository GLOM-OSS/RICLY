import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Lang } from '@prisma/client';
import { Request } from 'express';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AUTH01 } from '../../../exception';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      callbackURL: `${process.env.NX_API_BASE_URL}/auth`,
      clientSecret: process.env.NX_GOOGLE_SECRET,
      clientID: process.env.NX_GOOGLE_CLIENT_ID,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: Profile
  ) {
    const {
      _json: { email_verified, email, locale, given_name, family_name },
    } = profile;
    if (email_verified) {
      const user = {
        email,
        preferred_lang: locale.substring(0, 2) as Lang,
        fullname: `${given_name} ${family_name}`,
      };
      const clientApiKey = request.get('RICLY-API-KEY');
      if (!clientApiKey) {
        return this.authService.validateUser(user);
      }
      return this.authService.validateUser(user, {
        client_api_key: clientApiKey,
        client_urL: request.headers.origin,
      });
    }
    throw new UnauthorizedException({
      statusCode: HttpStatus.UNAUTHORIZED,
      error: 'Unauthorized access',
      message: AUTH01['en'],
    });
  }
}
