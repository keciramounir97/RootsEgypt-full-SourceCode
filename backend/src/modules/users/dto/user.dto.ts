
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsIn } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    full_name?: string;

    @IsString()
    @IsOptional()
    phone_number?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    @MinLength(6)
    password?: string;

    @IsString()
    @IsOptional()
    @IsIn(['active', 'pending', 'unvalidated', 'validated', 'approved', 'rejected', 'banned'])
    status?: string;

    @IsOptional()
    role_id?: number | string;

    @IsOptional()
    roleId?: number | string;

    @IsString()
    @IsOptional()
    fullName?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @IsArray()
    @IsOptional()
    privileges?: string[];
}

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    full_name: string;

    @IsString()
    @IsOptional()
    fullName?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @IsString()
    @IsOptional()
    phone_number?: string;

    @IsOptional()
    role_id?: number;

    @IsOptional()
    roleId?: number;

    @IsArray()
    @IsOptional()
    privileges?: string[];
}
