import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadResult } from './interfaces/storage-adapter.interface';
export declare class StorageService implements OnModuleInit {
    private configService;
    private readonly logger;
    private adapter;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    upload(file: Buffer | Express.Multer.File, options: {
        filename: string;
        directory: string;
        contentType?: string;
        metadata?: Record<string, any>;
    }): Promise<UploadResult>;
    download(path: string): Promise<Buffer>;
    delete(path: string): Promise<void>;
    exists(path: string): Promise<boolean>;
    getUrl(path: string, expiresIn?: number): Promise<string>;
    getProviderName(): string;
    saveFile(file: Express.Multer.File, directory: string): Promise<string>;
    deleteFile(filePath: string): Promise<void>;
    getFile(filePath: string): Promise<Buffer>;
    fileExists(filePath: string): boolean;
}
