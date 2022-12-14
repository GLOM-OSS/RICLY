import { ApiProperty } from '@nestjs/swagger';
import { Person } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray, IsDateString,
  IsEmail, IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested
} from 'class-validator';
import {Type} from 'class-transformer'

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
  @IsString()
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
  @ApiProperty({ required: false })
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
    description: `A list of all building's ids you want to delete`,
  })
  @IsArray()
  @ArrayMinSize(1)
  buildings: string[];
}
export class DeleteHallDto {
  @ApiProperty({
    description: `A list of all hall's ids you want to delete`,
  })
  @IsArray()
  @ArrayMinSize(1)
  halls: string[];
}

export class DeleteTeacherDto {
  @ApiProperty({
    description: `A list of all teacher's ids you want to delete`,
  })
  @IsArray()
  @ArrayMinSize(1)
  teachers: string[];
}

export class DeleteClassroomDto {
  @ApiProperty({
    description: `A list of all classroom's ids you want to delete`,
  })
  @IsArray()
  @ArrayMinSize(1)
  classrooms: string[];
}

export class DeleteSubjectDto {
  @ApiProperty({
    description: `A list of all subject's ids you want to delete`,
  })
  @IsArray()
  @ArrayMinSize(1)
  subjects: string[];
}

export class DeleteStudentDto {
  @ApiProperty({
    description: `A list of all subject's ids you want to delete`,
  })
  @IsArray()
  @ArrayMinSize(1)
  students: string[];
}
export class DeleteAvailabilityDto {
  @ApiProperty({
    description: `A list of all availability's ids you want to delete`,
  })
  @IsArray()
  @ArrayMinSize(1)
  availabilities: string[];
}

export class CreateAvailabilityDto {
  @ApiProperty()
  @IsDateString()
  start_time: Date;

  @ApiProperty()
  @IsDateString()
  end_time: Date;

  @IsArray()
  @ApiProperty()
  @ArrayMinSize(1)
  availabilities: Date[];
}

export class Break {
  @ApiProperty()
  @IsDateString()
  start_time: Date

  @ApiProperty()
  @IsDateString()
  end_time: Date
}
export class CreateTimetableDto {
  @ApiProperty()
  @IsUUID()
  classroom_id: string;

  @ApiProperty()
  @IsDateString()
  start_at: Date;

  @ApiProperty()
  @IsDateString()
  end_at: Date;

  @ApiProperty()
  @ValidateNested()
  @Type(() => Break)
  break: Break;

  @ApiProperty()
  @IsNumber()
  course_duration_in_minutes: number;
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

export function getRoleId(roles: UserRole[], wantedRole: Role) {
  const { user_id } = roles.find(({ role }) => role === wantedRole);
  return user_id;
}
