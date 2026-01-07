interface BLI04Data {
    student: {
        fullName: string;
        matricNumber: string;
        program: string;
    };
    company: {
        name: string;
        address: string;
        department?: string;
        supervisorName?: string;
        supervisorPhone?: string;
        supervisorFax?: string;
        supervisorEmail?: string;
    };
    training: {
        startDate: Date;
        organizationSector?: string[];
        industryCode?: string[];
    };
}
export declare function generateBLI04(data: BLI04Data): Promise<Buffer>;
export declare function validateBLI04Data(data: any): boolean;
export {};
