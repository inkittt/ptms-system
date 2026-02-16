import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConsentDto } from './dto/consent.dto';
import { User } from '@prisma/client';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            id: string;
            createdAt: Date;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            matricNo: string;
            program: string;
            phone: string;
            pdpaConsent: boolean;
            tosAccepted: boolean;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            matricNo: string;
            program: string;
            phone: string;
        };
    } | {
        requiresConsent: boolean;
        userId: string;
        message: string;
        requiresMfa?: undefined;
    } | {
        requiresMfa: boolean;
        userId: string;
        message: string;
        requiresConsent?: undefined;
    }>;
    submitConsent(userId: string, consentDto: ConsentDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            matricNo: string;
            program: string;
            phone: string;
        };
    }>;
    verifyMfa(userId: string, token: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            matricNo: string;
            program: string;
            phone: string;
        };
    }>;
    enableMfa(userId: string): Promise<{
        secret: string;
        qrCode: string;
    }>;
    confirmEnableMfa(userId: string, token: string): Promise<{
        message: string;
    }>;
    disableMfa(userId: string, token: string): Promise<{
        message: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            matricNo: string;
            program: string;
            phone: string;
        };
    }>;
    logout(userId: string, refreshToken?: string): Promise<{
        message: string;
    }>;
    private generateTokens;
    validateUser(userId: string): Promise<User | null>;
}
