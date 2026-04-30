import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class VerifyResetDto {
    @IsEmail()
    @IsNotEmpty({ message: 'Email is required' })
    @Transform(({ value }) => String(value ?? '').trim().toLowerCase())
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Verification code is required' })
    @Transform(({ value }) => String(value ?? '').trim())
    code: string;

    @IsString()
    @IsNotEmpty({ message: 'New password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    newPassword: string;
}
