interface DLI01Data {
    student: {
        fullName: string;
        icNumber: string;
        matricNumber: string;
        program: string;
        faculty: string;
        phone?: string;
        email?: string;
        address?: string;
    };
    company: {
        name: string;
        address: string;
        city: string;
        state: string;
        postcode: string;
    };
    training: {
        startDate: Date;
        endDate: Date;
        duration: number;
    };
    coordinator: {
        name: string;
        email: string;
        phone: string;
    };
    session: {
        name: string;
        year: number;
        semester: number;
    };
    application: {
        id: string;
    };
}
export declare function generateDLI01(data: DLI01Data): Promise<Buffer>;
export declare function validateDLI01Data(data: any): boolean;
export {};
