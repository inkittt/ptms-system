# Step 3: Coordinator Review - Activation Guide

## Overview
Step 3 (Coordinator Review) is now **fully activated** and connected to the backend database. Students can see real-time status updates of their document review, and coordinators can review and update document statuses.

## What Was Implemented

### 1. Student Side - Real-Time Status Display

**Location**: `ptms-frontend/src/app/student/applications/page.tsx`

#### Features Added:
- **Dynamic Status Fetching**: Automatically fetches BLI-02 document status from backend
- **Status Banner**: Prominent notification banner at the top showing current review status
- **Workflow Integration**: Step 3 in the workflow timeline shows detailed status
- **Review Comments**: Displays coordinator's comments when changes are requested or document is rejected

#### Status States Shown:
1. **No Document Uploaded** (Orange)
   - Message: "Please upload BLI-02 document first (Step 2)"
   - Action: Prompts student to complete Step 2

2. **Pending Review** (Blue)
   - Icon: Animated clock
   - Message: "Document submitted - Waiting for coordinator review..."
   - Status: `PENDING_SIGNATURE`

3. **Approved** (Green)
   - Icon: Check circle
   - Message: "Document approved! You can proceed to the next step."
   - Status: `SIGNED`

4. **Changes Requested** (Orange)
   - Icon: Message square
   - Message: "Coordinator requested changes"
   - Shows: Coordinator's comments
   - Action: "Re-upload Document" button
   - Status: `DRAFT`

5. **Rejected** (Red)
   - Icon: X circle
   - Message: "Document rejected by coordinator"
   - Shows: Rejection reason from coordinator
   - Status: `REJECTED`

### 2. Coordinator Side - Review Interface

**Location**: `ptms-frontend/src/app/coordinator/document-review/page.tsx`

#### Features:
- View all pending documents
- Filter by session, status, program
- Search by student name, matric number, company
- Review actions:
  - **Approve**: Changes status to `SIGNED`
  - **Request Changes**: Changes status to `DRAFT` + adds comments
  - **Reject**: Changes status to `REJECTED` + adds reason

### 3. Backend Integration

**Endpoints Used**:
- `GET /applications` - Fetch student's applications with documents
- `GET /applications/documents/pending-review` - Fetch documents for coordinator
- `PATCH /applications/documents/:documentId/review` - Submit review decision

**Database Updates**:
- Document status updated in `Document` table
- Review record created in `Review` table
- Application status updated in `Application` table

## How It Works - Complete Flow

### Student Workflow:
1. **Upload BLI-02** (Step 2)
   - Student uploads offer letter/acceptance letter
   - Document status: `PENDING_SIGNATURE`
   - Student sees: "Under Review" in Step 3

2. **Wait for Review** (Step 3)
   - Student can check status anytime
   - Status updates automatically when coordinator reviews
   - Estimated time: 3-7 days

3. **Review Complete** (Step 3)
   - **If Approved**: Green banner, can proceed to Step 4
   - **If Changes Requested**: Orange banner with comments, must re-upload
   - **If Rejected**: Red banner with reason, contact coordinator

### Coordinator Workflow:
1. **Access Review Page**
   - Navigate to `/coordinator/document-review`
   - See all pending documents

2. **Review Document**
   - Click "Preview" to view document
   - Click "Download" to download document
   - Read document content

3. **Make Decision**
   - **Approve**: Document meets requirements
   - **Request Changes**: Document needs modifications (add comments)
   - **Reject**: Document is invalid (add reason)

4. **Submit Review**
   - Status updates immediately
   - Student sees update in their workflow
   - Email notification sent (future feature)

## Visual Indicators

### Student View:

**Status Banner Colors**:
- 🟢 Green: Approved
- 🟡 Orange: Changes Requested / No Document
- 🔵 Blue: Under Review
- 🔴 Red: Rejected

**Workflow Step 3 Icons**:
- ✅ Check Circle: Approved
- ⏰ Clock (animated): Under Review
- 💬 Message Square: Changes Requested
- ❌ X Circle: Rejected
- ⚠️ Warning Triangle: No Document

### Coordinator View:

**Document Status Badges**:
- Pending Review (Yellow)
- Changes Requested (Orange)
- Approved (Green)
- Rejected (Red)

## Testing the Feature

### Test Scenario 1: Approve Document
1. Student uploads BLI-02
2. Coordinator goes to document review page
3. Coordinator clicks "Approve" on the document
4. Student refreshes their applications page
5. **Expected**: Green banner "Document Approved!" appears

### Test Scenario 2: Request Changes
1. Student uploads BLI-02
2. Coordinator clicks "Request Changes"
3. Coordinator enters: "Please provide a clearer copy of the offer letter"
4. Student refreshes their applications page
5. **Expected**: Orange banner with comments appears
6. Student clicks "Re-upload Document"
7. Student uploads new document
8. **Expected**: Status changes back to "Under Review"

### Test Scenario 3: Reject Document
1. Student uploads BLI-02
2. Coordinator clicks "Reject"
3. Coordinator enters: "This is not an official offer letter"
4. Student refreshes their applications page
5. **Expected**: Red banner with rejection reason appears

## Code Changes Summary

### Files Modified:
1. **`ptms-frontend/src/app/student/applications/page.tsx`**
   - Added document status fetching
   - Added status banner component
   - Updated Step 3 to show dynamic status
   - Added review comments display

2. **`ptms-frontend/src/app/coordinator/document-review/page.tsx`**
   - Connected to backend API
   - Implemented review actions
   - Added real-time status updates

3. **Backend** (already implemented)
   - Document upload endpoints
   - Review endpoints
   - Status update logic

## Database Schema

### Document Table
```sql
- id: UUID
- applicationId: UUID
- type: DocumentType (BLI_02, etc.)
- fileUrl: String
- status: DocumentStatus
  - DRAFT (changes requested)
  - PENDING_SIGNATURE (under review)
  - SIGNED (approved)
  - REJECTED (rejected)
- createdAt: DateTime
- updatedAt: DateTime
```

### Review Table
```sql
- id: UUID
- applicationId: UUID
- reviewerId: UUID
- decision: Decision
  - APPROVE
  - REQUEST_CHANGES
  - REJECT
- comments: String (optional)
- decidedAt: DateTime
```

## Future Enhancements

1. **Email Notifications**
   - Send email when document is reviewed
   - Send reminder if review takes too long

2. **Real-time Updates**
   - WebSocket integration for instant updates
   - No need to refresh page

3. **Document Preview**
   - In-app PDF viewer
   - Image preview for JPG/PNG

4. **Review History**
   - Show all review iterations
   - Track who reviewed and when

5. **Bulk Actions**
   - Approve multiple documents at once
   - Batch review for efficiency

## Troubleshooting

### Student doesn't see status update
- **Solution**: Refresh the page or check if document was actually uploaded

### Coordinator can't see documents
- **Solution**: Check if documents have status `PENDING_SIGNATURE` or `DRAFT`

### Review comments not showing
- **Solution**: Ensure comments were entered when requesting changes or rejecting

### Status not updating after review
- **Solution**: Check backend logs, ensure database connection is working

## Summary

Step 3 (Coordinator Review) is now **fully functional** with:
- ✅ Real-time status display for students
- ✅ Interactive review interface for coordinators
- ✅ Database integration for persistent status
- ✅ Comments and feedback system
- ✅ Visual indicators and notifications
- ✅ Complete workflow integration

Students can now track their document review status in real-time, and coordinators can efficiently review and provide feedback on submitted documents.
