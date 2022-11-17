import { ApiProperty } from '@nestjs/swagger';
import { Person } from '@prisma/client';
import { IsString } from 'class-validator';

export class SchoolPostDto {
  @IsString()
  @ApiProperty()
  school_name: string;

  @IsString()
  @ApiProperty()
  school_acronym: string;
}

export class SignInDto {
  @IsString()
  @ApiProperty()
  school_code: string;
}

export enum Role {
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
}
export type UserRole = {
  user_id: string;
  role: Role;
};

export type User = Person & {
  roles: UserRole[];
};