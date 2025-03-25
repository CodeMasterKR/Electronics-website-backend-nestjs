import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { ROLES_KEY } from 'src/decorators/role.decorators';
  import { PrismaService } from 'src/prisma/prisma.service';
  
  @Injectable()
  export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector, private prisma: PrismaService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const roles: string[] = this.reflector.getAllAndOverride(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
      if (!roles || roles.length === 0) {
        return true;
      }
  
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      console.log('Request.user:', user);
  
      if (!user) {
        throw new UnauthorizedException();
      }
  
      const userId = typeof user === 'string' ? user : user.id;
  
      const newUser = await this.prisma.user.findFirst({
        where: { id: userId },
      });
  
      if (!newUser) {
        throw new UnauthorizedException('Not allowed to this user!');
      }
      const hasRole = roles.some((role) => role === newUser.role);

      if (!hasRole) {
        throw new ForbiddenException(`Sizga ushbu harakatni bajarishga ruxsat yo‘q`);
      }
      return true;
    }
  }