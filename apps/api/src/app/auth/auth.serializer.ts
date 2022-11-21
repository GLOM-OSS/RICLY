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
  serializeUser(
    user: Person & { school_id?: string },
    done: (err, user: { school_id: string; email: string }) => void
  ) {
    console.log(user.email, user.school_id)
    done(null, { email: user.email, school_id: user.school_id });
  }

  async deserializeUser(
    user: { school_id: string; email: string },
    done: (err, user: User) => void
  ) {
    const deserializeUser = await this.authService.deserializeUser(user.email, user.school_id);
    done(null, deserializeUser);
  }
}
