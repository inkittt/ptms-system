export declare class SubmitBli03Dto {
    studentPhone: string;
    studentEmail: string;
    startDate: string;
    endDate: string;
    organizationName: string;
    organizationAddress: string;
    organizationPhone: string;
    organizationFax?: string;
    organizationEmail: string;
    contactPersonName: string;
    contactPersonPhone: string;
    organizationDeclaration: boolean;
    reportingPeriod: string;
    studentSignature?: string;
    studentSignatureType: 'typed' | 'drawn' | 'image';
}
