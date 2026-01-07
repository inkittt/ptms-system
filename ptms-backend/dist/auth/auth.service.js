"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const speakeasy = __importStar(require("speakeasy"));
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: registerDto.email },
                    ...(registerDto.matricNo ? [{ matricNo: registerDto.matricNo }] : []),
                ],
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email or matric number already exists');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                name: registerDto.name,
                email: registerDto.email,
                password: hashedPassword,
                role: registerDto.role,
                matricNo: registerDto.matricNo,
                program: registerDto.program,
                phone: registerDto.phone,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                matricNo: true,
                program: true,
                phone: true,
                pdpaConsent: true,
                tosAccepted: true,
                createdAt: true,
            },
        });
        return {
            message: 'User registered successfully',
            user,
        };
    }
    async login(loginDto) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: loginDto.identifier },
                    { matricNo: loginDto.identifier },
                ],
                isActive: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.pdpaConsent || !user.tosAccepted) {
            return {
                requiresConsent: true,
                userId: user.id,
                message: 'Please accept PDPA and Terms of Service to continue',
            };
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        if (user.mfaEnabled) {
            return {
                requiresMfa: true,
                userId: user.id,
                message: 'Please provide MFA token',
            };
        }
        return this.generateTokens(user);
    }
    async submitConsent(userId, consentDto) {
        if (!consentDto.pdpaConsent || !consentDto.tosAccepted) {
            throw new common_1.BadRequestException('Both PDPA consent and ToS acceptance are required');
        }
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                pdpaConsent: true,
                pdpaConsentAt: new Date(),
                tosAccepted: true,
                tosAcceptedAt: new Date(),
            },
        });
        return this.generateTokens(user);
    }
    async verifyMfa(userId, token) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.mfaEnabled || !user.mfaSecret) {
            throw new common_1.UnauthorizedException('MFA not enabled');
        }
        const isValid = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token,
            window: 2,
        });
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid MFA token');
        }
        return this.generateTokens(user);
    }
    async enableMfa(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (user.mfaEnabled) {
            throw new common_1.BadRequestException('MFA already enabled');
        }
        const secret = speakeasy.generateSecret({
            name: `PTMS (${user.email})`,
            length: 32,
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: { mfaSecret: secret.base32 },
        });
        return {
            secret: secret.base32,
            qrCode: secret.otpauth_url,
        };
    }
    async confirmEnableMfa(userId, token) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.mfaSecret) {
            throw new common_1.BadRequestException('MFA setup not initiated');
        }
        const isValid = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token,
            window: 2,
        });
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid MFA token');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { mfaEnabled: true },
        });
        return { message: 'MFA enabled successfully' };
    }
    async disableMfa(userId, token) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.mfaEnabled) {
            throw new common_1.BadRequestException('MFA not enabled');
        }
        const isValid = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token,
            window: 2,
        });
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid MFA token');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                mfaEnabled: false,
                mfaSecret: null,
            },
        });
        return { message: 'MFA disabled successfully' };
    }
    async refreshToken(refreshToken) {
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        await this.prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { isRevoked: true },
        });
        return this.generateTokens(tokenRecord.user);
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            await this.prisma.refreshToken.updateMany({
                where: {
                    userId,
                    token: refreshToken,
                },
                data: { isRevoked: true },
            });
        }
        else {
            await this.prisma.refreshToken.updateMany({
                where: { userId },
                data: { isRevoked: true },
            });
        }
        return { message: 'Logged out successfully' };
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            matricNo: user.matricNo,
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d',
        });
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                matricNo: user.matricNo,
                program: user.program,
                phone: user.phone,
            },
        };
    }
    async validateUser(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId, isActive: true },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map