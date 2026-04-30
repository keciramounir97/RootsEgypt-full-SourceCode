import { Request as ExpressRequest } from "express";
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    create(body: CreateUserDto, req: ExpressRequest): Promise<import("../../models/User").User>;
    update(id: number, body: UpdateUserDto, req: ExpressRequest): Promise<{
        message: string;
    }>;
    delete(id: number, req: ExpressRequest): Promise<{
        message: string;
    }>;
}
export declare class AdminManagementController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAdmins(): Promise<any[]>;
    createAdmin(body: any, req: ExpressRequest): Promise<import("../../models/User").User>;
    updateAdmin(id: number, body: any, req: ExpressRequest): Promise<{
        message: string;
    }>;
    deleteAdmin(id: number, req: ExpressRequest): Promise<{
        message: string;
    }>;
}
