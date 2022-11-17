import { SetMetadata } from '@nestjs/common';
import { Role } from '@ricly/dto';

export const IsPublic = () => SetMetadata('isPublic', true);

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

