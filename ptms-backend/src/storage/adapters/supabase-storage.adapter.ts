import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageAdapter, UploadResult } from '../interfaces/storage-adapter.interface';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStorageAdapter implements IStorageAdapter {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get('SUPABASE_URL');
    const supabaseKey =
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY') ||
      this.configService.get('SUPABASE_KEY');
    this.bucketName = this.configService.get('SUPABASE_BUCKET') || 'documents';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (recommended) or SUPABASE_KEY in .env',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
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
    let fileBuffer: Buffer;

    // Handle both Buffer and Multer file
    if (Buffer.isBuffer(file)) {
      fileBuffer = file;
    } else if ('buffer' in file && file.buffer) {
      fileBuffer = Buffer.from(file.buffer);
    } else if ('path' in file && file.path) {
      const fs = require('fs');
      fileBuffer = fs.readFileSync(file.path);
    } else {
      throw new Error('Invalid file format');
    }

    const filePath = `${options.directory}/${options.filename}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, fileBuffer, {
        contentType: options.contentType || 'application/pdf',
        upsert: true,
        metadata: options.metadata,
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const { data: urlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
      provider: 'supabase',
      metadata: {
        bucketId: data.id,
        fullPath: data.path,
        size: fileBuffer.length,
        ...options.metadata,
      },
    };
  }

  async download(filePath: string): Promise<Buffer> {
    console.log(`[SupabaseStorage] Attempting to download: ${filePath} from bucket: ${this.bucketName}`);
    
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .download(filePath);

    if (error) {
      console.error('[SupabaseStorage] Download error details:', {
        filePath,
        bucket: this.bucketName,
        error: error,
        errorMessage: error.message,
        errorName: error.name,
        fullError: JSON.stringify(error, null, 2)
      });
      throw new Error(`Supabase download failed for "${filePath}": ${error.message || error.name || JSON.stringify(error)}`);
    }

    if (!data) {
      console.error('[SupabaseStorage] No data returned for:', filePath);
      throw new Error(`Supabase download returned no data for "${filePath}"`);
    }

    console.log(`[SupabaseStorage] Successfully downloaded: ${filePath}`);
    return Buffer.from(await data.arrayBuffer());
  }

  async delete(filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(`Supabase delete failed: ${error.message}`);
    }
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      const pathParts = filePath.split('/');
      const filename = pathParts.pop();
      const directory = pathParts.join('/');

      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(directory || '');

      if (error) return false;

      return data.some((file) => file.name === filename);
    } catch {
      return false;
    }
  }

  async getUrl(filePath: string, expiresIn?: number): Promise<string> {
    if (expiresIn) {
      // Generate signed URL with expiration
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw new Error(`Failed to generate signed URL: ${error.message}`);
      }

      return data.signedUrl;
    }

    // Return public URL
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  getProviderName(): string {
    return 'supabase';
  }
}
