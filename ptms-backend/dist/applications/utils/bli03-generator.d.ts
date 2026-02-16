interface BLI03Data {
    student: {
        name: string;
        matricNo: string;
        program: string;
        phone: string;
        email: string;
        startDate: string;
        endDate: string;
    };
    organization: {
        name: string;
        address: string;
        phone: string;
        fax?: string;
        email: string;
        contactPersonName: string;
        contactPersonPhone: string;
    };
    application: {
        id: string;
        createdAt: Date;
    };
    signatures?: {
        studentSignature?: string;
        studentSignatureType?: 'typed' | 'drawn' | 'image';
        studentSignedAt?: Date;
        coordinatorSignature?: string;
        coordinatorSignatureType?: 'typed' | 'drawn' | 'image';
        coordinatorSignedAt?: Date;
    };
}
export declare function generateBLI03(data: BLI03Data): Promise<Buffer>;
export declare function validateBLI03Data(data: BLI03Data): boolean;
export {};
