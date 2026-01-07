import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private configService;
    constructor(configService: ConfigService);
    saveFile(file: Express.Multer.File, directory: string): Promise<string>;
    deleteFile(filePath: string): Promise<void>;
    getFile(filePath: string): Promise<Buffer>;
    fileExists(filePath: string): boolean;
}
