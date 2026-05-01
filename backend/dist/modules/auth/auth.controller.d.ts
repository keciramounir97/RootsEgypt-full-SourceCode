import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { RequestResetDto } from './dto/request-reset.dto';
import { VerifyResetDto } from './dto/verify-reset.dto';
import { UsersService } from '../users/users.service';
import { Request as ExpressRequest } from "express";
export declare class AuthController {
    private authService;
    private usersService;
    private readonly logger;
    constructor(authService: AuthService, usersService: UsersService);
    private isDatabaseUnavailable;
    private serviceUnavailable;
    login(loginDto: LoginDto): Promise<{
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
    signup(signupDto: SignupDto): Promise<{
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
    refresh(body: {
        refreshToken?: string;
    }): Promise<{
        token: string;
        refreshToken: string;
    }>;
    verifyReset(dto: VerifyResetDto): Promise<{
        message: string;
    }>;
    verifyResetByToken(dto: {
        email: string;
        token: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    requestReset(dto: RequestResetDto): Promise<{
        message: string;
        code?: undefined;
    } | {
        message: string;
        code: string;
    }>;
    logout(req: ExpressRequest): Promise<{
        message: string;
    }>;
    me(req: ExpressRequest): Promise<Express.User>;
    updateMe(body: any, req: ExpressRequest): Promise<any>;
}
