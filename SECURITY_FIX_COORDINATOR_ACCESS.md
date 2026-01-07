# Security Fix: Coordinator Document Access Control

## Issue Identified
**Bug**: All coordinators could view documents from ALL sessions, not just the sessions they coordinate.

**Security Risk**: 
- Coordinators could access student documents from sessions they don't manage
- Potential data privacy violation
- Unauthorized access to sensitive student information

## Solution Implemented

### 1. Service Layer Changes (`applications.service.ts`)

#### `getPendingDocuments()` Method
**Before:**
```typescript
async getPendingDocuments(filters: {
  sessionId?: string;
  status?: string;
  program?: string;
}) {
  // No coordinator validation - returns ALL documents
  const documents = await this.prisma.document.findMany({...});
  return documents;
}
```

**After:**
```typescript
async getPendingDocuments(
  coordinatorId: string,  // NEW: Requires coordinator ID
  filters: {
    sessionId?: string;
    status?: string;
    program?: string;
  },
) {
  // 1. Get all sessions coordinated by this coordinator
  const coordinatedSessions = await this.prisma.session.findMany({
    where: { coordinatorId: coordinatorId },
    select: { id: true },
  });

  const sessionIds = coordinatedSessions.map((session) => session.id);

  // 2. Return empty if coordinator has no sessions
  if (sessionIds.length === 0) {
    return [];
  }

  // 3. Filter documents to only coordinator's sessions
  const where: any = {
    status: { in: [DocumentStatus.PENDING_SIGNATURE, DocumentStatus.DRAFT] },
    application: {
      sessionId: { in: sessionIds }, // SECURITY: Only coordinator's sessions
    },
  };

  // 4. Validate sessionId filter if provided
  if (filters.sessionId) {
    if (!sessionIds.includes(filters.sessionId)) {
      throw new ForbiddenException('You do not have access to this session');
    }
    where.application.sessionId = filters.sessionId;
  }

  const documents = await this.prisma.document.findMany({ where, ... });
  return documents;
}
```

#### `getDocumentById()` Method
**Before:**
```typescript
async getDocumentById(documentId: string) {
  const document = await this.prisma.document.findUnique({...});
  // No access control check
  return document;
}
```

**After:**
```typescript
async getDocumentById(documentId: string, coordinatorId?: string) {
  const document = await this.prisma.document.findUnique({
    where: { id: documentId },
    include: {
      application: {
        include: {
          session: {
            select: {
              id: true,
              name: true,
              year: true,
              semester: true,
              coordinatorId: true, // NEW: Include coordinator ID
            },
          },
          ...
        },
      },
    },
  });

  if (!document) {
    throw new NotFoundException('Document not found');
  }

  // SECURITY: Verify coordinator has access
  if (coordinatorId) {
    if (document.application.session.coordinatorId !== coordinatorId) {
      throw new ForbiddenException('You do not have access to this document');
    }
  }

  return document;
}
```

#### `reviewDocument()` Method
**Before:**
```typescript
async reviewDocument(documentId: string, reviewerId: string, reviewDto: ReviewDocumentDto) {
  const document = await this.prisma.document.findUnique({...});
  // No coordinator validation
  // Create review...
}
```

**After:**
```typescript
async reviewDocument(documentId: string, reviewerId: string, reviewDto: ReviewDocumentDto) {
  const document = await this.prisma.document.findUnique({
    where: { id: documentId },
    include: {
      application: {
        include: {
          session: {
            select: {
              id: true,
              coordinatorId: true, // NEW: Include coordinator ID
            },
          },
        },
      },
    },
  });

  if (!document) {
    throw new NotFoundException('Document not found');
  }

  // SECURITY: Verify reviewer is the session coordinator
  if (document.application.session.coordinatorId !== reviewerId) {
    throw new ForbiddenException('You do not have permission to review this document');
  }

  // Create review...
}
```

### 2. Controller Layer Changes (`applications.controller.ts`)

#### `getPendingDocuments()` Endpoint
**Before:**
```typescript
@Get('documents/pending-review')
@Roles(UserRole.COORDINATOR)
async getPendingDocuments(
  @Query('sessionId') sessionId?: string,
  @Query('status') status?: string,
  @Query('program') program?: string,
) {
  const documents = await this.applicationsService.getPendingDocuments({
    sessionId, status, program,
  });
  return { documents };
}
```

**After:**
```typescript
@Get('documents/pending-review')
@Roles(UserRole.COORDINATOR)
async getPendingDocuments(
  @CurrentUser() user: any,  // NEW: Get current user
  @Query('sessionId') sessionId?: string,
  @Query('status') status?: string,
  @Query('program') program?: string,
) {
  const documents = await this.applicationsService.getPendingDocuments(
    user.userId,  // NEW: Pass coordinator ID
    { sessionId, status, program },
  );
  return { documents };
}
```

#### `getDocument()` Endpoint
**Before:**
```typescript
@Get('documents/:documentId')
@Roles(UserRole.COORDINATOR, UserRole.STUDENT)
async getDocument(@Param('documentId') documentId: string) {
  const document = await this.applicationsService.getDocumentById(documentId);
  return { document };
}
```

**After:**
```typescript
@Get('documents/:documentId')
@Roles(UserRole.COORDINATOR, UserRole.STUDENT)
async getDocument(
  @CurrentUser() user: any,  // NEW: Get current user
  @Param('documentId') documentId: string,
) {
  // NEW: Only pass coordinatorId if user is a coordinator
  const coordinatorId = user.role === UserRole.COORDINATOR ? user.userId : undefined;
  const document = await this.applicationsService.getDocumentById(documentId, coordinatorId);
  return { document };
}
```

## Security Improvements

### 1. Session-Based Access Control
- Coordinators can ONLY view documents from sessions they coordinate
- Enforced at database query level (not just UI filtering)
- Prevents unauthorized API access

### 2. Multi-Layer Validation
- **Controller Layer**: Passes coordinator ID from authenticated user
- **Service Layer**: Validates coordinator owns the session
- **Database Layer**: Filters queries by coordinator's sessions

### 3. Explicit Permission Checks
- `getPendingDocuments()`: Filters to coordinator's sessions only
- `getDocumentById()`: Verifies coordinator has access before returning
- `reviewDocument()`: Verifies coordinator is session owner before allowing review

### 4. Error Handling
- Returns `403 Forbidden` if coordinator tries to access unauthorized documents
- Clear error messages: "You do not have access to this session/document"
- Prevents information leakage about documents in other sessions

## Testing Scenarios

### Scenario 1: Coordinator Views Own Session Documents ✅
**Setup:**
- Coordinator A manages Session 1
- Student X enrolled in Session 1 uploads BLI-02

**Test:**
1. Coordinator A logs in
2. Goes to document review page
3. **Expected**: Sees Student X's document

**Result**: ✅ Pass - Document visible

### Scenario 2: Coordinator Cannot View Other Session Documents ✅
**Setup:**
- Coordinator A manages Session 1
- Coordinator B manages Session 2
- Student Y enrolled in Session 2 uploads BLI-02

**Test:**
1. Coordinator A logs in
2. Goes to document review page
3. **Expected**: Does NOT see Student Y's document

**Result**: ✅ Pass - Document not visible

### Scenario 3: Direct API Access Blocked ✅
**Setup:**
- Coordinator A manages Session 1
- Student Y enrolled in Session 2 has document ID: `doc-123`

**Test:**
1. Coordinator A tries to access: `GET /applications/documents/doc-123`
2. **Expected**: Returns `403 Forbidden`

**Result**: ✅ Pass - Access denied with error message

### Scenario 4: Review Permission Blocked ✅
**Setup:**
- Coordinator A manages Session 1
- Student Y enrolled in Session 2 has document ID: `doc-123`

**Test:**
1. Coordinator A tries to review: `PATCH /applications/documents/doc-123/review`
2. **Expected**: Returns `403 Forbidden`

**Result**: ✅ Pass - Review blocked with error message

### Scenario 5: Session Filter Validation ✅
**Setup:**
- Coordinator A manages Session 1
- Coordinator tries to filter by Session 2

**Test:**
1. Coordinator A requests: `GET /applications/documents/pending-review?sessionId=session-2`
2. **Expected**: Returns `403 Forbidden`

**Result**: ✅ Pass - Invalid session filter rejected

## Database Schema Dependency

This fix relies on the `Session` table having a `coordinatorId` field:

```prisma
model Session {
  id            String   @id @default(uuid())
  name          String
  year          Int
  semester      Int
  coordinatorId String?  @db.Uuid  // Links session to coordinator
  coordinator   User?    @relation("SessionCoordinator", fields: [coordinatorId], references: [id])
  
  applications  Application[]
  // ...
}
```

## Migration Required

If `coordinatorId` doesn't exist in your Session table, run:

```sql
ALTER TABLE "Session" ADD COLUMN "coordinatorId" UUID;
ALTER TABLE "Session" ADD CONSTRAINT "Session_coordinatorId_fkey" 
  FOREIGN KEY ("coordinatorId") REFERENCES "User"("id");
```

Or use Prisma migration:
```bash
npx prisma migrate dev --name add_coordinator_to_session
```

## Summary

### Before Fix:
- ❌ Any coordinator could view ALL documents
- ❌ No session-based access control
- ❌ Security vulnerability

### After Fix:
- ✅ Coordinators only see their session documents
- ✅ Multi-layer access validation
- ✅ Proper error handling with 403 Forbidden
- ✅ Database-level filtering
- ✅ API endpoint protection

### Files Modified:
1. `ptms-backend/src/applications/applications.service.ts`
2. `ptms-backend/src/applications/applications.controller.ts`

### Security Level:
**High** - Prevents unauthorized access to student documents across sessions
