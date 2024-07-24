import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor( private readonly reflector: Reflector ) {}

  canActivate( context: ExecutionContext ): boolean {
    const { user } = context.switchToHttp().getRequest();

    const role = this.reflector.getAllAndOverride<Role[]>('role', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!role) {
      return true;
    }

    if (!role.includes( user.role )) {
      throw new ForbiddenException('Forbidden');
    }

    return role === user.role;
  }
}