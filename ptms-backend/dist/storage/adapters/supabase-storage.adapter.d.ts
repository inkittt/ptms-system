import { ConfigService } from '@nestjs/config';
import { IStorageAdapter, UploadResult } from '../interfaces/storage-adapter.interface';
export declare class SupabaseStorageAdapter implements IStorageAdapter {
    private configService;
    private supabase;
    private bucketName;
    constructor(configService: ConfigService);
    upload(file: Buffer | Express.Multer.File, options: {
        filename: string;
        directory: string;
        contentType?: string;
        metadata?: Record<string, any>;
    }): Promise<UploadResult>;
    download(filePath: string): Promise<Buffer>;
    delete(filePath: string): Promise<void>;
    exists(filePath: string): Promise<boolean>;
    getUrl(filePath: string, expiresIn?: number): Promise<string>;
    getProviderName(): string;
}
