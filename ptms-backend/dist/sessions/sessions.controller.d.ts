import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    create(createSessionDto: CreateSessionDto, req: any): Promise<{
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
    findAll(req: any): Promise<{
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
    getMyCoordinatorSessions(req: any): Promise<{
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
    getMySession(req: any): Promise<{
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
    getMySessions(req: any): Promise<({
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
    importStudents(id: string, file: Express.Multer.File): Promise<unknown>;
    getSessionStudents(id: string): Promise<({
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
    uploadCoordinatorSignature(sessionId: string, file: Express.Multer.File, req: any): Promise<{
        message: string;
        signatureUploaded: boolean;
        signedAt: Date;
    }>;
}
