
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsIn } from 'class-validator';

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
    @IsIn(['active', 'pending', 'banned'])
    status?: string;

    @IsOptional()
    role_id?: number | string;
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

    @IsOptional()
    role_id?: number;
}
