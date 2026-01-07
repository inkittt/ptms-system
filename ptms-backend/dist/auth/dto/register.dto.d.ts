import { UserRole } from '@prisma/client';
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    matricNo?: string;
    program?: string;
    phone?: string;
}
