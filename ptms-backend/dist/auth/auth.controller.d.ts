import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConsentDto } from './dto/consent.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { EnableMfaDto, VerifyMfaDto } from './dto/enable-mfa.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            id: string;
            createdAt: Date;
            name: string;
            program: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            matricNo: string;
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
    verifyMfa(userId: string, verifyMfaDto: VerifyMfaDto): Promise<{
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
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
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
    logout(user: any, refreshToken?: string): Promise<{
        message: string;
    }>;
    getProfile(user: any): Promise<any>;
    enableMfa(user: any): Promise<{
        secret: string;
        qrCode: string;
    }>;
    confirmEnableMfa(user: any, enableMfaDto: EnableMfaDto): Promise<{
        message: string;
    }>;
    disableMfa(user: any, enableMfaDto: EnableMfaDto): Promise<{
        message: string;
    }>;
}
