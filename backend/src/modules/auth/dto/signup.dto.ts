
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class SignupDto {
    @IsEmail()
    @IsNotEmpty()
    @Transform(({ value }) => String(value ?? '').trim().toLowerCase())
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    fullName?: string;

    @ValidateIf((o) => !o.fullName)
    @IsNotEmpty({ message: 'Full name is required' })
    @IsString()
    @Transform(({ value, obj }) => String(obj?.fullName ?? obj?.full_name ?? value ?? '').trim(), { toClassOnly: true })
    full_name?: string;

    @IsString()
    @IsOptional()
    @Transform(({ value, obj }) => obj?.phone ?? obj?.phoneNumber ?? obj?.phone_number ?? value)
    phone_number?: string;
}
