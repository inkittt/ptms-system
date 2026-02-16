import { ApplicationsService } from './applications.service';
export declare class SupervisorController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    verifySupervisorToken(token: string): Promise<{
        application: {
            session: {
                id: string;
                name: string;
                year: number;
                semester: number;
            };
            user: {
                id: string;
                name: string;
                email: string;
                matricNo: string;
                program: string;
            };
            formResponses: {
                id: string;
                studentSignature: string | null;
                studentSignatureType: string | null;
                studentSignedAt: Date | null;
                supervisorSignature: string | null;
                supervisorSignatureType: string | null;
                supervisorSignedAt: Date | null;
                coordinatorSignature: string | null;
                coordinatorSignatureType: string | null;
                coordinatorSignedAt: Date | null;
                applicationId: string;
                formTypeEnum: string;
                payloadJSON: import("@prisma/client/runtime/library").JsonValue;
                submittedAt: Date;
                verifiedBy: string | null;
                supervisorName: string | null;
            }[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.ApplicationStatus;
            startDate: Date | null;
            endDate: Date | null;
            agreedBeyond14Weeks: boolean;
            createdAt: Date;
            updatedAt: Date;
            contactPersonName: string | null;
            contactPersonPhone: string | null;
            emergencyContactEmail: string | null;
            emergencyContactName: string | null;
            emergencyContactPhone: string | null;
            organizationAddress: string | null;
            organizationDeclarationAccepted: boolean;
            organizationEmail: string | null;
            organizationFax: string | null;
            organizationName: string | null;
            organizationPhone: string | null;
            reportingPeriod: string | null;
            roleTasksSummary: string | null;
            studentEmail: string | null;
            studentPhone: string | null;
            studentSignature: string | null;
            studentSignatureType: string | null;
            studentSignedAt: Date | null;
            supervisorSignature: string | null;
            supervisorSignatureType: string | null;
            supervisorSignedAt: Date | null;
            coordinatorSignature: string | null;
            coordinatorSignatureType: string | null;
            coordinatorSignedAt: Date | null;
            userId: string;
            sessionId: string;
            companyId: string | null;
        };
        bli04Data: import("@prisma/client/runtime/library").JsonValue;
        supervisorName: string;
        supervisorEmail: string;
        tokenId: string;
        success: boolean;
    }>;
    submitSupervisorSignature(token: string, signatureData: {
        signature?: string;
        signatureType: 'typed' | 'drawn' | 'image';
        reportingDate: string;
        remarks?: string;
    }): Promise<{
        success: boolean;
        formResponse: {
            id: string;
            studentSignature: string | null;
            studentSignatureType: string | null;
            studentSignedAt: Date | null;
            supervisorSignature: string | null;
            supervisorSignatureType: string | null;
            supervisorSignedAt: Date | null;
            coordinatorSignature: string | null;
            coordinatorSignatureType: string | null;
            coordinatorSignedAt: Date | null;
            applicationId: string;
            formTypeEnum: string;
            payloadJSON: import("@prisma/client/runtime/library").JsonValue;
            submittedAt: Date;
            verifiedBy: string | null;
            supervisorName: string | null;
        };
        message: string;
    }>;
}
