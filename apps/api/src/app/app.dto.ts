import { ApiProperty } from '@nestjs/swagger';
import { Person } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID
} from 'class-validator';

export class SubscribeDto {
  @IsNumber()
  @ApiProperty()
  total_paid: number;

  @IsUUID()
  @ApiProperty()
  school_code: string;

  @IsString()
  @ApiProperty()
  transaction_id: string;
}

export class SubscribeQueryDto {
  @IsUUID()
  @ApiProperty()
  school_code: string;
}

export class SchoolPostDto {
  @IsString()
  @ApiProperty()
  school_name: string;

  @IsString()
  @ApiProperty()
  school_acronym: string;
  
  @IsEmail()
  @ApiProperty()
  secretary_email: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: true })
  school_domain?: string;
}

export class NewPasswordDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Password may not be provided for the first time only',
  })
  password?: string;

  @IsString()
  @ApiProperty()
  new_password: string;
}
export class SignInDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  password: string;
}

export class DeleteBuildingDto {
  @ApiProperty({
    description: `A list of all building's id you want to delete`,
  })
  @IsArray()
  @ArrayMinSize(1)
  buildings: string[];
}
export class DeleteHallDto {
  @ApiProperty({
    description: `A list of all hall's id you want to delete`,
  })
  @IsArray()
  @ArrayMinSize(1)
  halls: string[];
}

export class DeleteTeacherDto {
  @ApiProperty({
    description: `A list of all teacher's id you want to delete`,
  })
  @IsArray()
  @ArrayMinSize(1)
  teachers: string[];
}

export enum Role {
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',

  TEACHER = 'TEACHER',
  SECRETARY = 'SECRETARY',
  COORDINATOR = 'COORDINATOR',
}
export type UserRole = {
  user_id: string;
  role: Role;
};

export type User = Person & {
  roles: UserRole[];
};
