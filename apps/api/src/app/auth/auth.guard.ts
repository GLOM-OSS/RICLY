import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role, User, UserRole } from '../app.dto';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler()
    );
    if (isPublic) return isPublic;
    const isAuthenticated = request.isAuthenticated();
    if (isAuthenticated) {
      const { roles: userRoles } = request.user as User;
      const roles = this.reflector.getAllAndOverride<Role[]>('roles', [
        context.getHandler(),
        context.getClass(),
      ]);
      return this.userHasRightRoles(userRoles, roles);
    }
    return isAuthenticated;
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
