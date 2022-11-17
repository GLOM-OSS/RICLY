import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, User, UserRole } from '@ricly/dto';
import { Request } from 'express';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const { roles: userRoles } = request.user as User;
    const roles = this.reflector.get<Role[]>('roles', context.getClass());
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler()
    );
    return (
      isPublic ||
      (request.isAuthenticated() && this.userHasRightRoles(userRoles, roles))
    );
  }

  private userHasRightRoles(userRoles: UserRole[], roles: Role[]) {
    let userHasRightAcess = true;
    if (roles) {
      let hasRole = false;
      userRoles.forEach(({ role }) => {
        if (roles.includes(role)) hasRole = true;
      });
      userHasRightAcess = hasRole;
    }
    return userHasRightAcess;
  }
}
