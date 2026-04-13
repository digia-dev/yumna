import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        image: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        needsPasswordChange: boolean;
        twoFactorEnabled: boolean;
        allowanceLimit: import("@prisma/client-runtime-utils").Decimal | null;
        resetToken: string | null;
        resetTokenExpires: Date | null;
        status: string | null;
        statusIcon: string | null;
        isFirstLogin: boolean;
        lastLoginAt: Date | null;
        lastIp: string | null;
        familyId: string | null;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.UserRole;
            familyId: string | null;
        };
    }>;
    deleteAccount(userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        image: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        needsPasswordChange: boolean;
        twoFactorEnabled: boolean;
        allowanceLimit: import("@prisma/client-runtime-utils").Decimal | null;
        resetToken: string | null;
        resetTokenExpires: Date | null;
        status: string | null;
        statusIcon: string | null;
        isFirstLogin: boolean;
        lastLoginAt: Date | null;
        lastIp: string | null;
        familyId: string | null;
    }>;
}
