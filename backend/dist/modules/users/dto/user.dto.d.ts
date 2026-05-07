export declare class UpdateUserDto {
    full_name?: string;
    phone_number?: string;
    email?: string;
    password?: string;
    status?: string;
    role_id?: number | string;
    roleId?: number | string;
    fullName?: string;
    phone?: string;
    phoneNumber?: string;
    privileges?: string[];
}
export declare class CreateUserDto {
    email: string;
    password: string;
    full_name: string;
    fullName?: string;
    phone?: string;
    phoneNumber?: string;
    phone_number?: string;
    role_id?: number;
    roleId?: number;
    privileges?: string[];
}
