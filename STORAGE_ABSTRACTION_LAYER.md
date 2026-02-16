# 📦 Storage Abstraction Layer
**PTMS Backend - Flexible File Storage System**

## Overview

The Storage Abstraction Layer provides a **unified interface** for file storage operations, allowing you to switch between different storage providers (Local Disk, Supabase, AWS S3, Azure, etc.) **without changing your application code**.

### Why Use an Abstraction Layer?

**Problem without abstraction:**
```typescript
// Tightly coupled to Supabase
await supabase.storage.from('bucket').upload(path, file);

// If you switch to AWS S3, you need to change code everywhere:
await s3.putObject({ Bucket: 'bucket', Key: path, Body: file });
```

**Solution with abstraction:**
```typescript
// Works with ANY storage provider
await storageService.upload(file, { filename, directory });
```

Change provider in `.env` - no code changes needed!

---

## Architecture

```
┌─────────────────────────────────────────┐
│         Application Code                │
│  (Controllers, Services, etc.)          │
└───────────────┬─────────────────────────┘
                │
                │ Uses
                ▼
┌─────────────────────────────────────────┐
│       StorageService                    │
│    (Facade/Proxy Pattern)               │
└───────────────┬─────────────────────────┘
                │
                │ Delegates to
                ▼
┌─────────────────────────────────────────┐
│      IStorageAdapter Interface          │
│   (Contract for all adapters)           │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
┌──────────────┐  ┌──────────────┐
│   Local      │  │  Supabase    │
│   Adapter    │  │   Adapter    │
└──────────────┘  └──────────────┘
```

---

## File Structure

```
src/storage/
├── storage.module.ts              # NestJS module
├── storage.service.ts             # Main service (facade)
├── interfaces/
│   └── storage-adapter.interface.ts   # Interface contract
└── adapters/
    ├── local-storage.adapter.ts       # Local disk implementation
    └── supabase-storage.adapter.ts    # Supabase implementation
```

---

## Core Components

### 1. IStorageAdapter Interface

Defines the contract that all storage adapters must implement:

```typescript
interface IStorageAdapter {
  upload(file, options): Promise<UploadResult>
  download(path): Promise<Buffer>
  delete(path): Promise<void>
  exists(path): Promise<boolean>
  getUrl(path, expiresIn?): Promise<string>
  getProviderName(): string
}
```

**Upload Result:**
```typescript
interface UploadResult {
  url: string;           // Public URL to access file
  path: string;          // Storage path/key
  provider: string;      // Provider name (local, supabase)
  metadata?: object;     // Additional info
}
```

### 2. StorageService

Main service that acts as a **facade**. It:
- Selects the appropriate adapter based on `STORAGE_PROVIDER` env variable
- Delegates all operations to the selected adapter
- Provides fallback to Local Storage if provider fails
- Maintains backward compatibility with legacy methods

### 3. Adapters

#### Local Storage Adapter
- Stores files on server's local disk
- Uses Node.js `fs` module
- Best for: Development, small deployments

#### Supabase Storage Adapter
- Stores files in Supabase Cloud Storage
- Uses Supabase SDK
- Best for: Production, scalable deployments

---

## Configuration

### Environment Variables

```env
# Choose storage provider (local or supabase)
STORAGE_PROVIDER=supabase

# Local Storage Settings
UPLOAD_DIR=./uploads
BASE_URL=http://localhost:3000

# Supabase Storage Settings
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET=documents
```

### Provider Selection

The service automatically selects the adapter on module initialization:

```typescript
onModuleInit() {
  const provider = this.configService.get('STORAGE_PROVIDER') || 'local';
  
  switch (provider.toLowerCase()) {
    case 'supabase':
      this.adapter = new SupabaseStorageAdapter(config);
      break;
    case 'local':
    default:
      this.adapter = new LocalStorageAdapter(config);
  }
}
```

---

## Usage Examples

### Basic Upload

```typescript
import { StorageService } from './storage/storage.service';

@Injectable()
export class DocumentsService {
  constructor(private storageService: StorageService) {}

  async uploadDocument(file: Express.Multer.File) {
    const result = await this.storageService.upload(file, {
      filename: `doc-${Date.now()}.pdf`,
      directory: 'documents',
      contentType: 'application/pdf',
      metadata: { uploadedBy: 'user123' }
    });

    console.log('File uploaded:', result.url);
    return result;
  }
}
```

### Download File

```typescript
async downloadDocument(path: string) {
  const buffer = await this.storageService.download(path);
  return buffer;
}
```

### Delete File

```typescript
async deleteDocument(path: string) {
  await this.storageService.delete(path);
}
```

### Check if File Exists

```typescript
async checkDocument(path: string) {
  const exists = await this.storageService.exists(path);
  if (!exists) {
    throw new NotFoundException('File not found');
  }
}
```

### Get Public URL

```typescript
// Get public URL (permanent)
const url = await this.storageService.getUrl(path);

// Get signed URL (expires in 1 hour = 3600 seconds)
const signedUrl = await this.storageService.getUrl(path, 3600);
```

### Check Current Provider

```typescript
const provider = this.storageService.getProviderName();
console.log(`Using ${provider} storage`);
```

---

## Implementation Details

### Local Storage Adapter

**How it works:**
1. Creates directory structure in `./uploads/` (or configured dir)
2. Writes files using Node.js `fs.writeFileSync()`
3. Returns local file path
4. Serves files via HTTP from `/uploads/` endpoint

**Upload Process:**
```typescript
async upload(file, options) {
  const dir = path.join(uploadDir, options.directory);
  fs.mkdirSync(dir, { recursive: true });
  
  const filePath = path.join(dir, options.filename);
  fs.writeFileSync(filePath, fileBuffer);
  
  return {
    url: `${baseUrl}/uploads/${directory}/${filename}`,
    path: filePath,
    provider: 'local'
  };
}
```

**File Structure:**
```
uploads/
├── documents/
│   ├── doc1.pdf
│   └── doc2.pdf
├── signatures/
│   └── sign1.png
└── reports/
    └── report1.pdf
```

---

### Supabase Storage Adapter

**How it works:**
1. Uses Supabase SDK to connect to cloud storage
2. Uploads files to specified bucket
3. Returns public URL
4. Supports signed URLs with expiration

**Upload Process:**
```typescript
async upload(file, options) {
  const filePath = `${options.directory}/${options.filename}`;
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileBuffer, {
      contentType: options.contentType,
      upsert: true
    });
  
  if (error) throw new Error(`Upload failed: ${error.message}`);
  
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return {
    url: urlData.publicUrl,
    path: filePath,
    provider: 'supabase'
  };
}
```

**Bucket Structure:**
```
documents/
├── applications/
│   ├── app-123.pdf
│   └── app-456.pdf
├── forms/
│   └── form-789.pdf
└── signatures/
    └── sign-001.png
```

---

## Adding New Storage Providers

Want to add AWS S3, Azure Blob, or Google Cloud Storage? Follow these steps:

### Step 1: Create Adapter

Create `src/storage/adapters/s3-storage.adapter.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageAdapter, UploadResult } from '../interfaces/storage-adapter.interface';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3StorageAdapter implements IStorageAdapter {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = configService.get('AWS_BUCKET_NAME');
  }

  async upload(file, options): Promise<UploadResult> {
    const key = `${options.directory}/${options.filename}`;
    
    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: options.contentType,
    }));

    return {
      url: `https://${this.bucketName}.s3.amazonaws.com/${key}`,
      path: key,
      provider: 's3',
    };
  }

  async download(path: string): Promise<Buffer> {
    // Implement S3 download
  }

  async delete(path: string): Promise<void> {
    // Implement S3 delete
  }

  async exists(path: string): Promise<boolean> {
    // Implement S3 exists check
  }

  async getUrl(path: string, expiresIn?: number): Promise<string> {
    // Implement S3 signed URL
  }

  getProviderName(): string {
    return 's3';
  }
}
```

### Step 2: Register in Module

Edit `src/storage/storage.module.ts`:

```typescript
import { S3StorageAdapter } from './adapters/s3-storage.adapter';

@Module({
  providers: [
    StorageService,
    LocalStorageAdapter,
    SupabaseStorageAdapter,
    S3StorageAdapter,  // Add here
  ],
  exports: [StorageService],
})
export class StorageModule {}
```

### Step 3: Update Service

Edit `src/storage/storage.service.ts`:

```typescript
import { S3StorageAdapter } from './adapters/s3-storage.adapter';

onModuleInit() {
  const provider = this.configService.get('STORAGE_PROVIDER') || 'local';
  
  switch (provider.toLowerCase()) {
    case 's3':  // Add case
      this.adapter = new S3StorageAdapter(this.configService);
      this.logger.log('✅ Storage Provider: AWS S3');
      break;
    case 'supabase':
      // ... existing code
  }
}
```

### Step 4: Configure Environment

Add to `.env`:

```env
STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BUCKET_NAME=your-bucket
```

**Done!** Your app now supports S3 storage.

---

## Best Practices

### 1. Use Descriptive Filenames

```typescript
// Bad
await storageService.upload(file, { filename: 'file.pdf', directory: 'docs' });

// Good
const filename = `application-${applicationId}-${Date.now()}.pdf`;
await storageService.upload(file, { filename, directory: 'applications' });
```

### 2. Organize by Directory

```typescript
// Organize logically
await storageService.upload(file, { 
  filename: 'doc.pdf',
  directory: `applications/${userId}/${year}`
});
```

### 3. Store Path in Database

```typescript
const result = await storageService.upload(file, options);

// Save to database
await prisma.document.create({
  data: {
    fileUrl: result.url,
    filePath: result.path,
    storageProvider: result.provider,
  }
});
```

### 4. Handle Errors

```typescript
try {
  const result = await storageService.upload(file, options);
  return result;
} catch (error) {
  this.logger.error(`Upload failed: ${error.message}`);
  throw new BadRequestException('File upload failed');
}
```

### 5. Clean Up on Delete

```typescript
async deleteApplication(id: string) {
  const application = await prisma.application.findUnique({
    where: { id },
    include: { documents: true }
  });

  // Delete all files from storage
  for (const doc of application.documents) {
    await storageService.delete(doc.filePath);
  }

  // Delete from database
  await prisma.application.delete({ where: { id } });
}
```

---

## Testing

### Mock the Storage Service

```typescript
// test/mocks/storage.service.mock.ts
export const mockStorageService = {
  upload: jest.fn().mockResolvedValue({
    url: 'http://localhost/test.pdf',
    path: 'test/test.pdf',
    provider: 'mock',
  }),
  download: jest.fn().mockResolvedValue(Buffer.from('test')),
  delete: jest.fn().mockResolvedValue(undefined),
  exists: jest.fn().mockResolvedValue(true),
  getUrl: jest.fn().mockResolvedValue('http://localhost/test.pdf'),
  getProviderName: jest.fn().mockReturnValue('mock'),
};
```

### Use in Tests

```typescript
describe('DocumentsService', () => {
  let service: DocumentsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should upload document', async () => {
    const file = { /* mock file */ };
    const result = await service.uploadDocument(file);
    
    expect(mockStorageService.upload).toHaveBeenCalled();
    expect(result.url).toBe('http://localhost/test.pdf');
  });
});
```

---

## Migration Between Providers

### Switching from Local to Supabase

1. **Update environment:**
```env
# Change from
STORAGE_PROVIDER=local

# To
STORAGE_PROVIDER=supabase
```

2. **Migrate existing files:**

```typescript
// migration-script.ts
async function migrateFiles() {
  const localAdapter = new LocalStorageAdapter(config);
  const supabaseAdapter = new SupabaseStorageAdapter(config);

  const documents = await prisma.document.findMany({
    where: { storageProvider: 'local' }
  });

  for (const doc of documents) {
    // Download from local
    const buffer = await localAdapter.download(doc.filePath);

    // Upload to Supabase
    const result = await supabaseAdapter.upload(buffer, {
      filename: path.basename(doc.filePath),
      directory: path.dirname(doc.filePath),
      contentType: doc.contentType,
    });

    // Update database
    await prisma.document.update({
      where: { id: doc.id },
      data: {
        fileUrl: result.url,
        filePath: result.path,
        storageProvider: 'supabase',
      }
    });

    console.log(`Migrated: ${doc.filePath}`);
  }
}
```

3. **Restart application** - it will now use Supabase

---

## Troubleshooting

### Upload Fails

**Check:**
- Environment variables are set correctly
- Storage bucket exists and is accessible
- File size within limits
- Credentials have write permissions

**Debug:**
```typescript
console.log('Provider:', storageService.getProviderName());
console.log('File size:', file.size);
```

### Download Returns Error

**Supabase:**
- Verify file exists in bucket
- Check bucket is public or use signed URLs
- Verify path format (no leading slash)

**Local:**
- Check file exists on disk
- Verify permissions
- Check path is absolute or relative to upload dir

### URL Not Working

**Supabase:**
- Make sure bucket is set to public
- Check RLS policies don't block access
- Verify URL format is correct

**Local:**
- Make sure Express serves `/uploads` directory
- Check BASE_URL matches server address

---

## Performance Considerations

### 1. Use Streaming for Large Files

```typescript
// Instead of loading entire file in memory
const buffer = await storageService.download(path);

// Use streaming (if adapter supports)
const stream = await storageService.downloadStream(path);
stream.pipe(response);
```

### 2. Cache URLs

```typescript
// Cache public URLs (they don't change)
const cachedUrl = cache.get(`url:${path}`);
if (!cachedUrl) {
  const url = await storageService.getUrl(path);
  cache.set(`url:${path}`, url, 3600); // 1 hour
}
```

### 3. Batch Operations

```typescript
// Delete multiple files
await Promise.all(
  paths.map(path => storageService.delete(path))
);
```

---

## Security Considerations

### 1. Validate File Types

```typescript
const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
if (!allowedTypes.includes(file.mimetype)) {
  throw new BadRequestException('Invalid file type');
}
```

### 2. Sanitize Filenames

```typescript
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .toLowerCase();
}
```

### 3. Use Service Role Key for Supabase

```env
# Use service_role for server-side operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Don't use anon key for uploads
# SUPABASE_KEY=your-anon-key  ❌
```

### 4. Implement File Size Limits

```typescript
if (file.size > 10 * 1024 * 1024) { // 10 MB
  throw new BadRequestException('File too large');
}
```

---

## Summary

The Storage Abstraction Layer provides:

✅ **Flexibility** - Switch providers without code changes  
✅ **Consistency** - Same API for all storage providers  
✅ **Testability** - Easy to mock in unit tests  
✅ **Maintainability** - Changes isolated to adapters  
✅ **Scalability** - Easy to add new providers  

**Current Providers:**
- ✅ Local Disk Storage
- ✅ Supabase Storage
- 🔜 AWS S3 (easily added)
- 🔜 Azure Blob (easily added)
- 🔜 Google Cloud Storage (easily added)

---

**For questions or issues, refer to the adapter implementation files or contact the development team.**
