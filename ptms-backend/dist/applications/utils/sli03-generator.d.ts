interface SLI03Data {
    student: {
        fullName: string;
        matricNumber: string;
        icNumber: string;
        program: string;
        faculty: string;
        email?: string;
    };
    company: {
        name: string;
        address: string;
        city: string;
        state: string;
        postcode: string;
        attentionTo?: string;
    };
    training: {
        startDate: Date;
        endDate: Date;
        duration: number;
    };
    session: {
        name: string;
        year: number;
        semester: number;
    };
    application: {
        id: string;
        approvedAt: Date;
    };
    coordinator: {
        name: string;
        position: string;
        email: string;
        phone: string;
    };
}
export declare function generateSLI03(data: SLI03Data): Promise<Buffer>;
export declare function validateSLI03Data(data: any): boolean;
export {};
