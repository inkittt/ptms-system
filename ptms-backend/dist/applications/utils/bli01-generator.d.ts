interface BLI01Data {
    student: {
        fullName: string;
        icNumber: string;
        matricNumber: string;
        program: string;
        faculty: string;
        cgpa: string;
        phone?: string;
        email?: string;
    };
    session: {
        id: string;
        name: string;
        year: number;
        semester: number;
        startDate?: Date;
        endDate?: Date;
        applicationDeadline?: Date;
        referenceNumber?: string;
        minWeeks: number;
        maxWeeks: number;
    };
    application: {
        id: string;
        createdAt: Date;
    };
    coordinator: {
        name: string;
        email: string;
        phone?: string;
        program?: string;
        signature?: string;
        signatureType?: string;
    };
    campus: {
        faculty: string;
        universityBranch: string;
        campusName: string;
        address: string;
        city: string;
        phone: string;
    };
}
export declare function generateBLI01(applicationData: BLI01Data): Promise<Buffer>;
export declare function validateBLI01Data(data: BLI01Data): boolean;
export {};
