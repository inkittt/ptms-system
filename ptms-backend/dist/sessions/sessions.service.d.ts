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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        year: number;
        semester: number;
        deadlinesJSON: import("@prisma/client/runtime/library").JsonValue | null;
        minCredits: number;
        minWeeks: number;
        maxWeeks: number;
        coordinatorId: string | null;
    }>;
    findAll(): Promise<{
        totalApplications: number;
        totalStudents: number;
        _count: {
            applications: number;
            studentSessions: number;
        };
        coordinator: {
            id: string;
            name: string;
            email: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        year: number;
        semester: number;
        deadlinesJSON: import("@prisma/client/runtime/library").JsonValue | null;
        minCredits: number;
        minWeeks: number;
        maxWeeks: number;
        coordinatorId: string | null;
    }[]>;
    findByCoordinator(coordinatorId: string): Promise<{
        totalApplications: number;
        totalStudents: number;
        _count: {
            applications: number;
            studentSessions: number;
        };
        coordinator: {
            id: string;
            name: string;
            email: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        year: number;
        semester: number;
        deadlinesJSON: import("@prisma/client/runtime/library").JsonValue | null;
        minCredits: number;
        minWeeks: number;
        maxWeeks: number;
        coordinatorId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        totalApplications: number;
        totalStudents: number;
        _count: {
            applications: number;
            studentSessions: number;
        };
        coordinator: {
            id: string;
            name: string;
            email: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        year: number;
        semester: number;
        deadlinesJSON: import("@prisma/client/runtime/library").JsonValue | null;
        minCredits: number;
        minWeeks: number;
        maxWeeks: number;
        coordinatorId: string | null;
    }>;
    update(id: string, updateSessionDto: UpdateSessionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        year: number;
        semester: number;
        deadlinesJSON: import("@prisma/client/runtime/library").JsonValue | null;
        minCredits: number;
        minWeeks: number;
        maxWeeks: number;
        coordinatorId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        year: number;
        semester: number;
        deadlinesJSON: import("@prisma/client/runtime/library").JsonValue | null;
        minCredits: number;
        minWeeks: number;
        maxWeeks: number;
        coordinatorId: string | null;
    }>;
    importStudentsFromCsv(sessionId: string, csvBuffer: Buffer): Promise<unknown>;
    getStudentSession(userId: string, sessionId?: string): Promise<{
        session: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            year: number;
            semester: number;
            deadlinesJSON: import("@prisma/client/runtime/library").JsonValue | null;
            minCredits: number;
            minWeeks: number;
            maxWeeks: number;
            coordinatorId: string | null;
        };
    } & {
        id: string;
        userId: string;
        sessionId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        creditsEarned: number;
        isEligible: boolean;
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
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            year: number;
            semester: number;
            deadlinesJSON: import("@prisma/client/runtime/library").JsonValue | null;
            minCredits: number;
            minWeeks: number;
            maxWeeks: number;
            coordinatorId: string | null;
        };
    } & {
        id: string;
        userId: string;
        sessionId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        creditsEarned: number;
        isEligible: boolean;
    })[]>;
    getSessionStudents(sessionId: string): Promise<({
        user: {
            id: string;
            name: string;
            program: string;
            email: string;
            matricNo: string;
        };
    } & {
        id: string;
        userId: string;
        sessionId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        creditsEarned: number;
        isEligible: boolean;
    })[]>;
    removeStudentFromSession(sessionId: string, userId: string): Promise<{
        id: string;
        userId: string;
        sessionId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        creditsEarned: number;
        isEligible: boolean;
    }>;
}
