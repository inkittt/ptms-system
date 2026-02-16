export declare class CreateSessionDto {
    name: string;
    year: number;
    semester: number;
    trainingStartDate?: string;
    trainingEndDate?: string;
    deadlinesJSON?: {
        applicationDeadline?: string;
        bli03Deadline?: string;
        reportingDeadline?: string;
    };
    minCredits?: number;
    minWeeks: number;
    maxWeeks: number;
    isActive?: boolean;
    coordinatorSignature?: string;
    coordinatorSignatureType?: string;
}
