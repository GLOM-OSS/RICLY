import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Lang } from '@prisma/client';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AUTH01 } from '../../../exception';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      callbackURL: `${process.env.NX_API_BASE_URL}/auth`,
      clientSecret: process.env.GOOGLE_SECRET,
      clientID: process.env.GOOGLE_CLIENT_ID,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile
  ) {
    const {
      _json: { email_verified, email, locale, given_name, family_name },
    } = profile;
    if (email_verified)
      return this.authService.validateUser({
        email,
        preferred_lang: locale as Lang,
        fullname: `${given_name} ${family_name}`,
      });
    throw new UnauthorizedException({
      statusCode: HttpStatus.UNAUTHORIZED,
      error: 'Unauthorized access',
      message: AUTH01['en'],
    });
  }
}
