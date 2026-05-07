import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<any[]>;
    findValidationUsers(status?: string): Promise<any[]>;
    findPendingUsers(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    create(body: CreateUserDto, req: any): Promise<import("../../models/User").User>;
    update(id: number, body: UpdateUserDto, req: any): Promise<{
        message: string;
    }>;
    validate(id: number, req: any): Promise<{
        message: string;
        user: any;
    }>;
    approve(id: number, req: any): Promise<{
        message: string;
        user: any;
    }>;
    rejectValidation(id: number, req: any): Promise<{
        message: string;
        user: any;
    }>;
    reject(id: number, req: any): Promise<{
        message: string;
        user: any;
    }>;
    delete(id: number, req: any): Promise<{
        message: string;
    }>;
}
export declare class AdminManagementController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAdmins(): Promise<any[]>;
    createAdmin(body: any, req: any): Promise<import("../../models/User").User>;
    updateAdmin(id: number, body: any, req: any): Promise<{
        message: string;
    }>;
    deleteAdmin(id: number, req: any): Promise<{
        message: string;
    }>;
}
export declare class RolesController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findRoles(): Promise<any>;
}
export declare class RoleDistributionController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getRoleDistribution(): Promise<{
        users: any[];
        roles: any;
        pages: {
            key: string;
            label: string;
        }[];
    }>;
    updateRoleDistribution(id: number, body: any, req: any): Promise<{
        message: string;
        user: any;
    }>;
}
