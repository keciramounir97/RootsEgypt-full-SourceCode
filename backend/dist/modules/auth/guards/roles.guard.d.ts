import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare class RolesGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    private parsePermissions;
    private permissionFromRequestPath;
    canActivate(context: ExecutionContext): boolean;
}
