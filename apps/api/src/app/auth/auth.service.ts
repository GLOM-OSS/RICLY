import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, User } from '@ricly/dto';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async validateUser(personCreateInput: Prisma.PersonCreateInput) {
    return this.prismaService.person.upsert({
      create: personCreateInput,
      update: personCreateInput,
      where: { email: personCreateInput.email },
    });
  }

  async deserializeUser(email: string): Promise<User> {
    const person = await this.prismaService.person.findUnique({
      where: { email },
    });
    if (person) {
      const developer = await this.prismaService.developer.findFirst({
        where: { Person: { email } },
      });
      if (developer) {
        return {
          ...person,
          roles: [
            {
              user_id: developer.developer_id,
              role: Role.DEVELOPER,
            },
          ],
        };
      }
    }
    return null;
  }
}
