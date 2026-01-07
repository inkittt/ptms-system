# BLI-02 Upload & Document Review Implementation Summary

## Overview
Successfully connected the student BLI-02 upload functionality and coordinator document review page to the backend/database.

## Backend Implementation

### 1. New DTOs Created
- **`upload-document.dto.ts`**: Validates document upload requests
- **`review-document.dto.ts`**: Validates document review decisions (APPROVE, REQUEST_CHANGES, REJECT)

### 2. Controller Endpoints (`applications.controller.ts`)

#### Student Endpoints
- **POST `/applications/:id/documents/upload`**
  - Uploads BLI-02 documents (PDF, JPG, PNG)
  - Max file size: 10MB
  - Files stored in `./uploads/documents/`
  - Validates file type and size
  - Creates document record in database

#### Coordinator Endpoints
- **GET `/applications/documents/pending-review`**
  - Fetches documents pending review
  - Supports filters: sessionId, status, program
  
- **GET `/applications/documents/:documentId`**
  - Retrieves specific document details
  
- **PATCH `/applications/documents/:documentId/review`**
  - Reviews documents with decisions: APPROVE, REQUEST_CHANGES, REJECT
  - Updates document and application status accordingly

### 3. Service Methods (`applications.service.ts`)

- **`uploadDocument()`**: Handles file upload and database record creation
- **`getPendingDocuments()`**: Retrieves documents for coordinator review
- **`getDocumentById()`**: Fetches single document with full details
- **`reviewDocument()`**: Processes coordinator review decisions and updates statuses

### 4. Document Status Flow
- **DRAFT** → Initial state or after changes requested
- **PENDING_SIGNATURE** → Submitted for review
- **SIGNED** → Approved by coordinator
- **REJECTED** → Rejected by coordinator

## Frontend Implementation

### 1. API Client Updates (`lib/api.ts`)
- Added `patch()` method for PATCH requests
- Added `uploadFile()` method for multipart/form-data uploads

### 2. New API Module (`lib/api/documents.ts`)
- `uploadDocument()`: Uploads documents to backend
- `getPendingDocuments()`: Fetches documents for review
- `getDocument()`: Gets single document details
- `reviewDocument()`: Submits review decisions

### 3. Student BLI-02 Upload Page (`student/bli02/page.tsx`)

**Changes:**
- Fetches user's application on page load
- Uploads file to backend using `documentsApi.uploadDocument()`
- Shows real-time upload progress
- Redirects to applications page after successful upload
- Displays error messages from backend

**Flow:**
1. Student selects/drags BLI-02 file
2. File validated (size, type, naming convention)
3. File uploaded to backend with application ID
4. Document record created in database
5. Success message shown and redirects

### 4. Coordinator Document Review Page (`coordinator/document-review/page.tsx`)

**Changes:**
- Fetches documents from backend on load
- Filters documents by session, status, program
- Real-time search functionality
- Integrated review actions (Approve, Request Changes, Reject)
- Updates UI after review actions
- Shows loading states

**Features:**
- **Tabs**: All, Pending, Changes, Approved, Rejected
- **Actions**: Preview, Download, Approve, Request Changes, Reject
- **Filters**: Session, Status, Program
- **Search**: Student name, matric number, document type, company

## Database Schema Usage

### Document Table
```prisma
model Document {
  id            String          @id @default(uuid())
  applicationId String
  type          DocumentType    // BLI_02, etc.
  fileUrl       String          // Path to uploaded file
  status        DocumentStatus  // DRAFT, PENDING_SIGNATURE, SIGNED, REJECTED
  version       Int
  signedBy      String?
  signedAt      DateTime?
  createdAt     DateTime
  updatedAt     DateTime
}
```

### Review Table
```prisma
model Review {
  id            String
  applicationId String
  reviewerId    String
  decision      Decision        // APPROVE, REQUEST_CHANGES, REJECT
  comments      String?
  decidedAt     DateTime
}
```

## File Upload Configuration

- **Storage**: Local disk storage in `./uploads/documents/`
- **Naming**: `file-{timestamp}-{random}.{ext}`
- **Allowed Types**: PDF, JPG, JPEG, PNG
- **Max Size**: 10MB
- **Validation**: Server-side file type and size checks

## Testing Checklist

### Student Side
- [ ] Upload BLI-02 document (PDF)
- [ ] Upload BLI-02 document (JPG/PNG)
- [ ] Verify file size validation (>10MB should fail)
- [ ] Verify file type validation (only PDF/JPG/PNG)
- [ ] Check naming convention validation
- [ ] Verify redirect after successful upload

### Coordinator Side
- [ ] View all pending documents
- [ ] Filter by session
- [ ] Filter by program
- [ ] Search by student name/matric
- [ ] Approve a document
- [ ] Request changes with comments
- [ ] Reject a document with reason
- [ ] Verify status updates after review

## Next Steps

1. **Create uploads directory**: Ensure `./uploads/documents/` exists in backend
2. **Test file upload**: Upload a BLI-02 document as a student
3. **Test review**: Review the uploaded document as a coordinator
4. **Add file download**: Implement document download functionality
5. **Add file preview**: Implement PDF/image preview in modal
6. **Add notifications**: Notify students when documents are reviewed

## API Endpoints Summary

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/applications/:id/documents/upload` | Student | Upload BLI-02 document |
| GET | `/applications/documents/pending-review` | Coordinator | Get documents for review |
| GET | `/applications/documents/:documentId` | Both | Get document details |
| PATCH | `/applications/documents/:documentId/review` | Coordinator | Review document |

## Notes

- The uploads directory has been created with a `.gitkeep` file
- All endpoints are protected with JWT authentication
- Role-based access control is enforced (Student/Coordinator)
- File validation happens both client-side and server-side
- Document status changes trigger application status updates
