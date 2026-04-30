import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/** Role IDs: 1=admin, 2=user, 3=super_admin */
const ROLE_NAME_BY_ID: Record<number, string> = {
    1: 'admin',
    2: 'user',
    3: 'super_admin',
};

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) return true;

        const { user } = context.switchToHttp().getRequest();
        if (!user) return false;

        const roleId = Number(user.role_id ?? user.roleId ?? user.role ?? 0);
        const roleName = String(user.roleName ?? user.role_name ?? '').toLowerCase().trim();

        const normalizedRequired = requiredRoles.map((r) => String(r).toLowerCase());
        const normalizedRoleName = roleName || ROLE_NAME_BY_ID[roleId] || '';

        // super_admin can access admin-only endpoints as well
        if (normalizedRoleName === 'super_admin') return true;
        if (normalizedRequired.includes(normalizedRoleName)) return true;
        return false;
    }
}
