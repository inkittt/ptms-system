/**
 * Storage Adapter Interface
 * 
 * This interface defines the contract for all storage adapters.
 * Implement this interface to create adapters for different storage providers:
 * - Local Disk Storage
 * - Supabase Storage
 * - AWS S3
 * - Azure Blob Storage
 * - Google Cloud Storage
 */

export interface UploadResult {
  /** Full URL to access the file */
  url: string;
  /** File path/key in the storage system */
  path: string;
  /** Storage provider type (local, supabase, s3, etc.) */
  provider: string;
  /** Additional metadata from the storage provider */
  metadata?: Record<string, any>;
}

export interface IStorageAdapter {
  /**
   * Upload a file to storage
   * @param file - File buffer or Express.Multer.File
   * @param options - Upload options (filename, directory, etc.)
   * @returns Upload result with URL and path
   */
  upload(
    file: Buffer | Express.Multer.File,
    options: {
      filename: string;
      directory: string;
      contentType?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<UploadResult>;

  /**
   * Download/retrieve a file from storage
   * @param path - File path/key in storage
   * @returns File buffer
   */
  download(path: string): Promise<Buffer>;

  /**
   * Delete a file from storage
   * @param path - File path/key in storage
   */
  delete(path: string): Promise<void>;

  /**
   * Check if a file exists
   * @param path - File path/key in storage
   * @returns True if file exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Get a public/signed URL for a file
   * @param path - File path/key in storage
   * @param expiresIn - URL expiration time in seconds (optional)
   * @returns Public or signed URL
   */
  getUrl(path: string, expiresIn?: number): Promise<string>;

  /**
   * Get storage provider name
   */
  getProviderName(): string;
}
