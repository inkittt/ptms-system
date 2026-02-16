export interface UploadResult {
    url: string;
    path: string;
    provider: string;
    metadata?: Record<string, any>;
}
export interface IStorageAdapter {
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
}
