import { Knex } from "knex";
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ActivityService } from '../activity/activity.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private activityService;
    private readonly knex;
    constructor(usersService: UsersService, jwtService: JwtService, activityService: ActivityService, knex: Knex);
    private isDatabaseUnavailable;
    private getSeedAdmin;
    private toSeedAdminUser;
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        token: string;
        refreshToken: any;
        user: any;
        degraded: boolean;
        message: string;
    } | {
        token: string;
        refreshToken: string;
        user: any;
        degraded?: undefined;
        message?: undefined;
    }>;
    signup(data: any): Promise<{
        token: string;
        refreshToken: any;
        user: any;
        degraded: boolean;
        message: string;
    } | {
        token: string;
        refreshToken: string;
        user: any;
        degraded?: undefined;
        message?: undefined;
    }>;
    refreshToken(token: string): Promise<{
        token: string;
        refreshToken: string;
    }>;
    logout(userId: number): Promise<{
        message: string;
    }>;
    requestReset(email: string): Promise<{
        message: string;
        code?: undefined;
    } | {
        message: string;
        code: string;
    }>;
    verifyReset(email: string, code: string, newPassword: string): Promise<{
        message: string;
    }>;
    verifyResetByToken(email: string, token: string, newPassword: string): Promise<{
        message: string;
    }>;
}
