import { User } from '../../models/User';
import { ActivityService } from '../activity/activity.service';
export declare class UsersService {
    private readonly knex;
    private readonly activityService;
    constructor(knex: any, activityService: ActivityService);
    private parsePrivileges;
    private serializePrivileges;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findByEmail(email: string): Promise<User>;
    create(data: any, adminId: number | null): Promise<User>;
    update(id: number, data: any, adminId: number): Promise<{
        message: string;
    }>;
    delete(id: number, adminId: number): Promise<{
        message: string;
    }>;
    findAdmins(): Promise<any[]>;
    createAdmin(data: any, superAdminId: number): Promise<User>;
    updateAdmin(id: number, data: any, superAdminId: number): Promise<{
        message: string;
    }>;
}
