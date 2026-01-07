interface SLI04Data {
    student: {
        fullName: string;
        matricNumber: string;
        program: string;
        phone?: string;
        email?: string;
    };
    company: {
        name: string;
        position: string;
        address?: string;
    };
    rejection: {
        referenceNumber: string;
        letterDate: Date;
        offerDate?: Date;
    };
    application: {
        id: string;
    };
}
export declare function generateSLI04(data: SLI04Data): Promise<Buffer>;
export declare function validateSLI04Data(data: any): boolean;
export {};
