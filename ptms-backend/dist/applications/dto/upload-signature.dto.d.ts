export declare enum SignatureRole {
    STUDENT = "student",
    SUPERVISOR = "supervisor",
    COORDINATOR = "coordinator"
}
export declare class UploadSignatureDto {
    role: SignatureRole;
    applicationId: string;
}
