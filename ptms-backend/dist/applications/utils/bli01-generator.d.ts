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
    };
    application: {
        id: string;
        createdAt: Date;
    };
}
export declare function generateBLI01(applicationData: BLI01Data): Promise<Buffer>;
export declare function validateBLI01Data(data: BLI01Data): boolean;
export {};
