# Document Re-upload Fix

## Issues Fixed

### Issue 1: Document Status Not Updating
When a student re-uploaded a document after changes were requested (`DRAFT` status), the document status remained as `DRAFT` instead of changing back to `PENDING_SIGNATURE`.

### Issue 2: Duplicate Documents
Each re-upload created a new document record in the database instead of updating the existing one, leading to multiple document records for the same application and document type.

### Issue 3: Old Files Not Deleted
Previous uploaded files remained on the filesystem, wasting storage space.

## Solution Implemented

Updated the `uploadDocument()` method in `applications.service.ts` to handle re-uploads properly:

### Before (Problematic Code):
```typescript
async uploadDocument(applicationId, userId, file, documentType) {
  // Always creates a new document record
  const document = await this.prisma.document.create({
    data: {
      applicationId: applicationId,
      type: documentType,
      fileUrl: file.path,
      status: DocumentStatus.PENDING_SIGNATURE,
      version: 1,
    },
  });
  return document;
}
```

**Problems:**
- Always creates new document (duplicates)
- Version always set to 1
- Old files not deleted
- No check for existing documents

### After (Fixed Code):
```typescript
async uploadDocument(applicationId, userId, file, documentType) {
  // Verify application exists and belongs to user
  const application = await this.prisma.application.findFirst({
    where: { id: applicationId, userId: userId },
  });

  if (!application) {
    throw new NotFoundException('Application not found');
  }

  // Check if document already exists for this application and type
  const existingDocument = await this.prisma.document.findFirst({
    where: {
      applicationId: applicationId,
      type: documentType,
    },
  });

  let document;

  if (existingDocument) {
    // RE-UPLOAD SCENARIO: Update existing document
    
    // 1. Delete old file from filesystem
    const fs = require('fs');
    if (existingDocument.fileUrl && fs.existsSync(existingDocument.fileUrl)) {
      try {
        fs.unlinkSync(existingDocument.fileUrl);
      } catch (error) {
        console.error('Error deleting old file:', error);
      }
    }

    // 2. Update document with new file and reset status
    document = await this.prisma.document.update({
      where: { id: existingDocument.id },
      data: {
        fileUrl: file.path,
        status: DocumentStatus.PENDING_SIGNATURE,  // Reset to pending
        version: existingDocument.version + 1,      // Increment version
        updatedAt: new Date(),
      },
      include: { /* ... */ },
    });
  } else {
    // FIRST UPLOAD: Create new document record
    document = await this.prisma.document.create({
      data: {
        applicationId: applicationId,
        type: documentType,
        fileUrl: file.path,
        status: DocumentStatus.PENDING_SIGNATURE,
        version: 1,
      },
      include: { /* ... */ },
    });
  }

  return document;
}
```

## How It Works Now

### First Upload (New Document):
1. Student uploads BLI-02 for the first time
2. System checks if document exists → **No**
3. Creates new document record with:
   - Status: `PENDING_SIGNATURE`
   - Version: `1`
   - File path stored

### Re-upload (After Changes Requested):
1. Coordinator requests changes → Document status: `DRAFT`
2. Student re-uploads BLI-02
3. System checks if document exists → **Yes**
4. System performs:
   - ✅ Deletes old file from filesystem
   - ✅ Updates existing document record (no duplicate)
   - ✅ Changes status back to `PENDING_SIGNATURE`
   - ✅ Increments version number (v1 → v2 → v3...)
   - ✅ Updates timestamp

### Benefits:

✅ **No Duplicates**: Only one document record per application + document type
✅ **Status Updates**: Status correctly changes to `PENDING_SIGNATURE` on re-upload
✅ **Version Tracking**: Version number increments with each upload
✅ **Storage Management**: Old files deleted to save space
✅ **Audit Trail**: `updatedAt` timestamp tracks when document was last modified
✅ **Clean Database**: No orphaned document records

## Workflow Example

### Scenario: Student Re-uploads After Changes Requested

**Step 1: Initial Upload**
```
Student uploads BLI-02
→ Document created:
  - ID: doc-123
  - Status: PENDING_SIGNATURE
  - Version: 1
  - File: uploads/documents/file-1234.pdf
```

**Step 2: Coordinator Requests Changes**
```
Coordinator reviews and requests changes
→ Document updated:
  - ID: doc-123
  - Status: DRAFT
  - Version: 1
  - File: uploads/documents/file-1234.pdf
```

**Step 3: Student Re-uploads (FIXED)**
```
Student uploads new BLI-02
→ Old file deleted: uploads/documents/file-1234.pdf
→ Document updated (NOT created):
  - ID: doc-123 (same ID)
  - Status: PENDING_SIGNATURE ✅ (reset)
  - Version: 2 ✅ (incremented)
  - File: uploads/documents/file-5678.pdf ✅ (new file)
  - updatedAt: 2026-01-04T22:38:00Z ✅ (updated)
```

**Step 4: Coordinator Reviews Again**
```
Coordinator sees:
- Same document (doc-123)
- Status: PENDING_SIGNATURE
- Version: 2 (knows it's a re-upload)
- New file available for review
```

## Database Impact

### Before Fix:
```sql
-- Multiple documents for same application + type
SELECT * FROM Document WHERE applicationId = 'app-123' AND type = 'BLI_02';

| id      | applicationId | type   | status             | version | fileUrl              |
|---------|---------------|--------|--------------------|---------|----------------------|
| doc-001 | app-123       | BLI_02 | DRAFT              | 1       | file-1234.pdf        |
| doc-002 | app-123       | BLI_02 | PENDING_SIGNATURE  | 1       | file-5678.pdf        |
| doc-003 | app-123       | BLI_02 | PENDING_SIGNATURE  | 1       | file-9012.pdf        |
```
❌ Multiple records, confusing, old files not deleted

### After Fix:
```sql
-- Single document, updated with each re-upload
SELECT * FROM Document WHERE applicationId = 'app-123' AND type = 'BLI_02';

| id      | applicationId | type   | status             | version | fileUrl              |
|---------|---------------|--------|--------------------|---------|----------------------|
| doc-001 | app-123       | BLI_02 | PENDING_SIGNATURE  | 3       | file-9012.pdf        |
```
✅ Single record, version tracked, old files deleted

## Testing

### Test 1: First Upload
1. Student uploads BLI-02
2. **Expected**: Document created with version 1, status PENDING_SIGNATURE

### Test 2: Re-upload After Changes
1. Coordinator requests changes (status → DRAFT)
2. Student re-uploads BLI-02
3. **Expected**:
   - Same document ID (no duplicate)
   - Status → PENDING_SIGNATURE
   - Version → 2
   - Old file deleted from filesystem
   - New file stored

### Test 3: Multiple Re-uploads
1. Student uploads → version 1
2. Coordinator requests changes
3. Student re-uploads → version 2
4. Coordinator requests changes again
5. Student re-uploads → version 3
6. **Expected**: Only 1 document record, version = 3

## Files Modified

- `ptms-backend/src/applications/applications.service.ts`
  - Updated `uploadDocument()` method
  - Added logic to check for existing documents
  - Added file deletion for old uploads
  - Added version increment logic
  - Status reset to PENDING_SIGNATURE on re-upload

## Summary

The document re-upload system now works correctly:
- ✅ Updates existing document instead of creating duplicates
- ✅ Resets status to `PENDING_SIGNATURE` for coordinator review
- ✅ Deletes old files to save storage
- ✅ Tracks version history
- ✅ Maintains clean database with one document per application + type
