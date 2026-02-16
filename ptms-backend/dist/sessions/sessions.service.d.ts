import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
export declare class SessionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSessionDto: CreateSessionDto, coordinatorId?: string): Promise<{
        coordinator: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        name: string;
        year: number;
        semester: number;
        trainingStartDate: Date | null;
        trainingEndDate: Date | null;
        deadlinesJSON: import("@prisma/client/runtime/library").JsonValue | null;
        referenceNumberFormat: string | null;
        minCredits: number;
        minWeeks: number;
        maxWeeks: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        coordinatorSignature: string | null;
        coordinatorSignatureType: string | null;
        coordinatorSignedAt: Date | null;
        coordinatorId: string | null;
    }>;
    findAll(): Promise<{
        totalApplications: number;
        totalStudents: number;
        coordinator: {
            id: string;
            name: string;
            email: string;
        };
        _count: {
            applications: number;
            studentSessions: number;
        };
        id: string;
        name: string;
        year: number;
        semester: number;
        trainingStartDate: Date | null;
        trainingEndDate: Date | null;
        deadlinesJSON: import("@prisma/client/runtime/library").JsonValue | null;
        referenceNumberFormat: string | null;
        minCredits: number;
        minWeeks: number;
        maxWeeks: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        coordinatorSignature: string | null;
        coordinatorSignatureType: string | null;
        coordinatorSignedAt: Date | null;
        coordinatorId: string | null;
    }[]>;
    findByCoordinator(coordinatorId: string): Promise<{
        totalApplications: number;
        totalStudents: number;
        coordinator: {
            id: string;
            name: string;
            email: string;
        };
        _count: {
            applications: number;
            studentSessions: number;
        };
        id: string;
        name: string;
        year: number;
        semester: number;
        trainingStartDate: Date | null;
        trainingEndDate: Date | null;
        deadlinesJSON: import("@prisma/client/runtime/library").JsonValue | null;
        referenceNumberFormat: string | null;
        minCredits: number;
        minWeeks: number;
        maxWeeks: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        coordinatorSignature: string | null;
        coordinatorSignatureType: string | null;
        coordinatorSignedAt: Date | null;
        coordinatorId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        totalApplications: number;
        totalStudents: number;
        coordinator: {
            id: string;
            name: string;
            email: string;
        };
        _count: {
            applications: number;
            studentSessions: number;
        };
        id: string;
        name: string;
        year: number;
        semester: number;
        trainingStartDate: Date | null;
        trainingEndDate: Date | null;
        deadlinesJSON: import("@prisma/client/runtime/library").JsonValue | null;
        referenceNumberFormat: string | null;
        minCredits: number;
        minWeeks: number;
        maxWeeks: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        coordinatorSignature: string | null;
        coordinatorSignatureType: string | null;
        coordinatorSignedAt: Date | null;
        coordinatorId: string | null;
    }>;
    update(id: string, updateSessionDto: UpdateSessionDto): Promise<{
        id: string;
        name: string;
        year: number;
        semester: number;
        trainingStartDate: Date | null;
        trainingEndDate: Date | null;
        deadlinesJSON: import("@prisma/client/runtime/library").JsonValue | null;
        referenceNumberFormat: string | null;
        minCredits: number;
        minWeeks: number;
        maxWeeks: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        coordinatorSignature: string | null;
        coordinatorSignatureType: string | null;
        coordinatorSignedAt: Date | null;
        coordinatorId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        year: number;
        semester: number;
        trainingStartDate: Date | null;
        trainingEndDate: Date | null;
        deadlinesJSON: import("@prisma/client/runtime/library").JsonValue | null;
        referenceNumberFormat: string | null;
        minCredits: number;
        minWeeks: number;
        maxWeeks: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        coordinatorSignature: string | null;
        coordinatorSignatureType: string | null;
        coordinatorSignedAt: Date | null;
        coordinatorId: string | null;
    }>;
    importStudentsFromCsv(sessionId: string, csvBuffer: Buffer): Promise<unknown>;
    getStudentSession(userId: string, sessionId?: string): Promise<{
        session: {
            id: string;
            name: string;
            year: number;
            semester: number;
            trainingStartDate: Date | null;
            trainingEndDate: Date | null;
            deadlinesJSON: import("@prisma/client/runtime/library").JsonValue | null;
            referenceNumberFormat: string | null;
            minCredits: number;
            minWeeks: number;
            maxWeeks: number;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            coordinatorSignature: string | null;
            coordinatorSignatureType: string | null;
            coordinatorSignedAt: Date | null;
            coordinatorId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        creditsEarned: number;
        sessionId: string;
        userId: string;
        isEligible: boolean;
        status: string;
    }>;
    getStudentSessions(userId: string): Promise<({
        session: {
            coordinator: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            name: string;
            year: number;
            semester: number;
            trainingStartDate: Date | null;
            trainingEndDate: Date | null;
            deadlinesJSON: import("@prisma/client/runtime/library").JsonValue | null;
            referenceNumberFormat: string | null;
            minCredits: number;
            minWeeks: number;
            maxWeeks: number;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            coordinatorSignature: string | null;
            coordinatorSignatureType: string | null;
            coordinatorSignedAt: Date | null;
            coordinatorId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        creditsEarned: number;
        sessionId: string;
        userId: string;
        isEligible: boolean;
        status: string;
    })[]>;
    getSessionStudents(sessionId: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
            matricNo: string;
            program: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        creditsEarned: number;
        sessionId: string;
        userId: string;
        isEligible: boolean;
        status: string;
    })[]>;
    removeStudentFromSession(sessionId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        creditsEarned: number;
        sessionId: string;
        userId: string;
        isEligible: boolean;
        status: string;
    }>;
    uploadCoordinatorSignature(sessionId: string, coordinatorId: string, file: Express.Multer.File): Promise<{
        message: string;
        signatureUploaded: boolean;
        signedAt: Date;
    }>;
}
