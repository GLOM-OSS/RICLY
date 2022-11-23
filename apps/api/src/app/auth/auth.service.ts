import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NewPasswordDto, Role, User, UserRole } from '../app.dto';

import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { AUTH10 } from '../../exception';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async validateUser(
    personCreateInput: Prisma.PersonCreateInput,
    options?: {
      client_urL: string;
      client_api_key: string;
    }
  ) {
    if (options) {
      const { client_urL, client_api_key } = options;
      const user = await this.validateRequest(
        personCreateInput,
        client_urL,
        client_api_key
      );
      return user;
    }
    return this.prismaService.person.upsert({
      create: {
        ...personCreateInput,
        Developers: {
          create: {
            developer_id: randomUUID(),
            //For development purpose
            password: bcrypt.hashSync(
              'ricly-password',
              Number(process.env.SALT)
            ),
          },
        },
      },
      update: personCreateInput,
      where: { email: personCreateInput.email },
    });
  }

  async deserializeUser(email: string, school_id: string): Promise<User> {
    const userRoles: UserRole[] = [];
    const person = await this.prismaService.person.findFirst({
      where: { email },
    });
    if (person) {
      const developer = await this.prismaService.developer.findFirst({
        where: { Person: { email } },
      });
      if (developer)
        userRoles.push({
          user_id: developer.developer_id,
          role: Role.DEVELOPER,
        });
      else {
        const secretary = await this.prismaService.secretary.findFirst({
          where: { Person: { email }, School: { school_id } },
        });
        if (secretary) {
          userRoles.push({
            user_id: secretary.secretary_id,
            role: Role.SECRETARY,
          });
        }

        const teacher = await this.prismaService.teacher.findFirst({
          where: { Person: { email }, School: { school_id } },
        });
        if (teacher) {
          userRoles.push({
            user_id: teacher.teacher_id,
            role: Role.TEACHER,
          });

          const coordinator = await this.prismaService.classroom.findFirst({
            where: { coordinator: teacher.teacher_id, School: { school_id } },
          });
          if (coordinator) {
            userRoles.push({
              user_id: teacher.teacher_id,
              role: Role.COORDINATOR,
            });
          }
        }
      }
      return { ...person, roles: userRoles };
    }
    return null;
  }

  async signIn(email: string, password: string) {
    const developer = await this.prismaService.developer.findFirst({
      select: { password: true, Person: true },
      where: {
        Person: { email },
      },
    });
    if (developer) {
      const { password: hash_password, Person } = developer;
      return bcrypt.compareSync(password, hash_password) ? Person : null;
    }
    return null;
  }

  async changePassword(
    developer_id: string,
    { new_password, password }: NewPasswordDto
  ) {
    const developer = await this.prismaService.developer.findFirst({
      where: { developer_id },
    });
    if (developer && bcrypt.compareSync(password, developer.password)) {
      this.prismaService.developer.update({
        data: {
          password: bcrypt.hashSync(new_password, Number(process.env.SALT)),
        },
        where: {
          developer_id,
        },
      });
    }
    throw new HttpException(JSON.stringify(AUTH10), HttpStatus.UNAUTHORIZED);
  }

  async validateRequest(
    data: Prisma.PersonCreateInput,
    clientUrl: string,
    clientApiKey: string
  ) {
    const some = {
      School: {
        OR: [
          { api_test_key: clientApiKey },
          {
            AND: { school_domain: clientUrl ?? null, api_key: clientApiKey },
          },
        ],
      },
    };
    const person = await this.prismaService.person.findFirst({
      select: {
        Secretaries: { select: { school_id: true } },
        Teachers: { select: { school_id: true } },
      },
      where: {
        email: data.email,
        OR: [{ Teachers: { some } }, { Secretaries: { some } }],
      },
    });
    if (person) {
      const user = await this.prismaService.person.update({
        data,
        where: { email: data.email },
      });
      const { Secretaries, Teachers } = person;
      let school_id: string;
      if (Secretaries.length > 0) {
        school_id = Secretaries[0].school_id;
      } else school_id = Teachers[0].school_id;
      return { school_id, ...user };
    }
    return null;
  }
}
