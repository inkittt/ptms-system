import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageAdapter, UploadResult } from './interfaces/storage-adapter.interface';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';
import { SupabaseStorageAdapter } from './adapters/supabase-storage.adapter';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private adapter: IStorageAdapter;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const storageProvider = this.configService.get('STORAGE_PROVIDER') || 'local';
    
    // Factory pattern - select adapter based on config
    try {
      switch (storageProvider.toLowerCase()) {
        case 'supabase':
          this.adapter = new SupabaseStorageAdapter(this.configService);
          this.logger.log('✅ Storage Provider: Supabase Storage');
          break;
        case 'local':
        default:
          this.adapter = new LocalStorageAdapter(this.configService);
          this.logger.log('✅ Storage Provider: Local Disk Storage');
          break;
      }
    } catch (error) {
      this.logger.error(`Failed to initialize ${storageProvider} storage: ${error.message}`);
      this.logger.warn('Falling back to Local Disk Storage');
      this.adapter = new LocalStorageAdapter(this.configService);
    }
  }

  /**
   * Upload a file to storage
   */
  async upload(
    file: Buffer | Express.Multer.File,
    options: {
      filename: string;
      directory: string;
      contentType?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<UploadResult> {
    return this.adapter.upload(file, options);
  }

  /**
   * Download a file from storage
   */
  async download(path: string): Promise<Buffer> {
    return this.adapter.download(path);
  }

  /**
   * Delete a file from storage
   */
  async delete(path: string): Promise<void> {
    return this.adapter.delete(path);
  }

  /**
   * Check if a file exists
   */
  async exists(path: string): Promise<boolean> {
    return this.adapter.exists(path);
  }

  /**
   * Get a URL for accessing the file
   */
  async getUrl(path: string, expiresIn?: number): Promise<string> {
    return this.adapter.getUrl(path, expiresIn);
  }

  /**
   * Get current storage provider name
   */
  getProviderName(): string {
    return this.adapter.getProviderName();
  }

  // Legacy compatibility methods
  async saveFile(file: Express.Multer.File, directory: string): Promise<string> {
    const result = await this.upload(file, {
      filename: file.filename,
      directory,
      contentType: file.mimetype,
    });
    return result.path;
  }

  async deleteFile(filePath: string): Promise<void> {
    return this.delete(filePath);
  }

  async getFile(filePath: string): Promise<Buffer> {
    return this.download(filePath);
  }

  fileExists(filePath: string): boolean {
    // Note: This is synchronous, but the new API is async
    // For legacy compatibility, we use sync check
    return require('fs').existsSync(filePath);
  }
}
