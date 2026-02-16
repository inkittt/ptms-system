import { Response } from 'express';
import { StudentsService } from './students.service';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    getPrograms(): Promise<{
        programs: string[];
    }>;
    getDashboard(user: any): Promise<{
        student: {
            name: string;
            matricNo: string;
            program: string;
            creditsEarned: number;
            isEligible: boolean;
        };
        session: {
            id: string;
            name: string;
            year: number;
            semester: number;
            minCredits: number;
            isActive: boolean;
            creditsEarned: number;
            isEligible: boolean;
            status: string;
        };
        application: {
            id: any;
            status: any;
            companyName: any;
            createdAt: any;
            updatedAt: any;
            documents: any;
        };
    }>;
    exportCsv(program: string, res: Response): Promise<void>;
    getCoordinatorStudents(user: any, sessionId?: string, program?: string, eligibility?: string): Promise<{
        students: {
            id: string;
            name: string;
            matricNo: string;
            program: string;
            creditsEarned: number;
            cgpa: number;
            isEligible: boolean;
            email: string;
            phone: string;
            sessionId: string;
            sessionYear: string;
            sessionSemester: string;
            currentApplication: {
                status: import(".prisma/client").$Enums.ApplicationStatus;
                company: string;
            };
            totalApplications: number;
            completedInternships: number;
        }[];
    }>;
    getStudentDetails(user: any, studentId: string): Promise<{
        student: {
            id: string;
            name: string;
            email: string;
            matricNo: string;
            program: string;
            phone: string;
            creditsEarned: number;
            cgpa: number;
            isEligible: boolean;
            sessionInfo: {
                id: string;
                name: string;
                year: number;
                semester: number;
                minCredits: number;
                isActive: boolean;
                creditsEarned: number;
                status: string;
            };
        };
        applications: {
            id: string;
            status: import(".prisma/client").$Enums.ApplicationStatus;
            organizationName: string;
            organizationAddress: string;
            organizationEmail: string;
            organizationPhone: string;
            contactPersonName: string;
            contactPersonPhone: string;
            startDate: Date;
            endDate: Date;
            roleTasksSummary: string;
            company: {
                id: string;
                name: string;
                address: string;
                industry: string;
                contactName: string;
                contactEmail: string;
                contactPhone: string;
            };
            session: {
                id: string;
                name: string;
                year: number;
                semester: number;
            };
            documents: {
                id: string;
                type: import(".prisma/client").$Enums.DocumentType;
                status: import(".prisma/client").$Enums.DocumentStatus;
                fileUrl: string;
                createdAt: Date;
                updatedAt: Date;
            }[];
            formResponses: {
                id: string;
                formTypeEnum: string;
                payloadJSON: import("@prisma/client/runtime/library").JsonValue;
                submittedAt: Date;
                verifiedBy: string;
            }[];
            reviews: {
                id: string;
                decision: import(".prisma/client").$Enums.Decision;
                comments: string;
                decidedAt: Date;
                reviewer: {
                    name: string;
                    email: string;
                };
            }[];
            createdAt: Date;
            updatedAt: Date;
        }[];
        totalApplications: number;
        completedInternships: number;
    }>;
}
