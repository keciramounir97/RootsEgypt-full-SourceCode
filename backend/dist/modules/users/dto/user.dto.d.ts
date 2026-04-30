export declare class UpdateUserDto {
    full_name?: string;
    phone_number?: string;
    email?: string;
    password?: string;
    status?: string;
    role_id?: number | string;
}
export declare class CreateUserDto {
    email: string;
    password: string;
    full_name: string;
    role_id?: number;
}
