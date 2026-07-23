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

    private parsePermissions(user: any): string[] {
        const raw = user?.permissions ?? user?.adminPrivileges ?? user?.admin_privileges;
        if (!raw) return [];
        if (Array.isArray(raw)) return raw.map((value) => String(value));
        try {
            const parsed = JSON.parse(String(raw));
            return Array.isArray(parsed) ? parsed.map((value) => String(value)) : [];
        } catch {
            return String(raw)
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean);
        }
    }

    private permissionFromRequestPath(path: string): string | null {
        const normalized = String(path || '').toLowerCase();
        if (normalized.includes('/admin/users/validation')) return 'validation-approvals';
        if (/\/admin\/users\/\d+\/(validate|approve|reject|reject-validation)/.test(normalized)) {
            return 'validation-approvals';
        }
        if (normalized.includes('/admin/role-distribution')) return 'role-distribution';
        if (normalized.includes('/admin/trees')) return 'trees';
        if (normalized.includes('/admin/gallery')) return 'gallery';
        if (normalized.includes('/admin/audios')) return 'audios';
        if (normalized.includes('/admin/documents')) return 'documents';
        if (normalized.includes('/admin/books')) return 'books';
        if (normalized.includes('/admin/articles')) return 'articles';
        if (normalized.includes('/admin/users') || normalized.includes('/admin/roles')) return 'users';
        if (normalized.includes('/admin/suggestions')) return 'suggestions';
        if (normalized.includes('/admin/contact')) return 'contact-messages';
        if (normalized.includes('/admin/newsletter')) return 'newsletter';
        if (normalized.includes('/admin/activity')) return 'activity';
        if (normalized.includes('/admin/settings')) return 'settings';
        if (normalized.includes('/admin/site-images/hero')) return 'hero-images';
        if (normalized.includes('/admin/site-images/background')) return 'background-images';
        if (normalized.includes('/admin/site-images')) return 'settings';
        if (normalized.includes('/admin/legal')) return 'legal-content';
        if (normalized.includes('/admin/download-requests')) return 'download-requests';
        if (normalized.includes('/admin/subscription-tier-features')) return 'subscriptions';
        if (normalized.includes('/admin/subscription-tiers')) return 'subscriptions';
        if (normalized.includes('/admin/subscription-payments')) return 'subscriptions';
        if (normalized.includes('/admin/subscriptions')) return 'subscriptions';
        if (normalized.includes('/admin/footer')) return 'footer-settings';
        if (normalized.includes('/admin/stats')) return 'dashboard';
        return null;
    }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) return true;

        const request = context.switchToHttp().getRequest();
        const { user } = request;
        if (!user) return false;

        const roleId = Number(user.role_id ?? user.roleId ?? user.role ?? 0);
        const roleName = String(user.roleName ?? user.role_name ?? '').toLowerCase().trim();

        const normalizedRequired = requiredRoles.map((r) => String(r).toLowerCase());
        const normalizedRoleName = roleName || ROLE_NAME_BY_ID[roleId] || '';

        // super_admin can access admin-only endpoints as well
        if (normalizedRoleName === 'super_admin') return true;
        if (normalizedRequired.includes(normalizedRoleName)) {
            const permissions = this.parsePermissions(user);
            if (roleId === 1 && permissions.length > 0) {
                if (permissions.includes('all')) return true;
                const requiredPermission = this.permissionFromRequestPath(request.path || request.url);
                return !requiredPermission || permissions.includes(requiredPermission);
            }
            return true;
        }
        return false;
    }
}
