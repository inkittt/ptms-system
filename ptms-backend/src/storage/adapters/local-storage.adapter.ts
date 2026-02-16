import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageAdapter, UploadResult } from '../interfaces/storage-adapter.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageAdapter implements IStorageAdapter {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';
    this.baseUrl = this.configService.get('BASE_URL') || 'http://localhost:3000';
  }

  async upload(
    file: Buffer | Express.Multer.File,
    options: {
      filename: string;
      directory: string;
      contentType?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<UploadResult> {
    const dir = path.join(this.uploadDir, options.directory);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, options.filename);
    let fileBuffer: Buffer;

    // Handle both Buffer and Multer file
    if (Buffer.isBuffer(file)) {
      fileBuffer = file;
    } else if ('path' in file && file.path) {
      fileBuffer = fs.readFileSync(file.path);
    } else if ('buffer' in file && file.buffer) {
      fileBuffer = Buffer.from(file.buffer);
    } else {
      throw new Error('Invalid file format');
    }
    
    // Write file to disk
    fs.writeFileSync(filePath, fileBuffer);

    return {
      url: `${this.baseUrl}/uploads/${options.directory}/${options.filename}`,
      path: filePath,
      provider: 'local',
      metadata: {
        size: fileBuffer.length,
        contentType: options.contentType,
        ...options.metadata,
      },
    };
  }

  async download(filePath: string): Promise<Buffer> {
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    return fs.readFileSync(filePath);
  }

  async delete(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async exists(filePath: string): Promise<boolean> {
    return fs.existsSync(filePath);
  }

  async getUrl(filePath: string, expiresIn?: number): Promise<string> {
    // For local storage, return the same URL (no expiration support)
    const relativePath = filePath.replace(this.uploadDir, '').replace(/\\/g, '/');
    return `${this.baseUrl}/uploads${relativePath}`;
  }

  getProviderName(): string {
    return 'local';
  }
}
