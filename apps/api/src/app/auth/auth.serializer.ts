import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { Person } from '@prisma/client';
import { User } from '../app.dto';
import { AuthService } from './auth.service';

@Injectable()
export class AuthSerializer extends PassportSerializer {
  constructor(private authService: AuthService) {
    super();
  }
  serializeUser(user: Person, done: (err, email: string) => void) {
    done(null, user.email);
  }

  async deserializeUser(email: string, done: (err, user: User) => void) {
    const deserializeUser = await this.authService.deserializeUser(email);
    done(null, deserializeUser);
  }
}
