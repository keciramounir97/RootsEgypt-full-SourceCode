import { IsEmail, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class RequestResetDto {
    @IsEmail()
    @IsNotEmpty({ message: 'Email is required' })
    @Transform(({ value }) => String(value ?? '').trim().toLowerCase())
    email: string;
}
