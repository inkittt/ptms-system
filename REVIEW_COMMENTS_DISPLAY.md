# Review Comments Display in Workflow Timeline

## Feature
Students can now see the coordinator's comments/reasons for changes requested or rejection directly in the workflow timeline at Step 3.

## What Was Fixed

### Backend Issue
The `getApplicationsByUser()` method wasn't including the `reviews` relation, so review comments weren't being sent to the frontend.

**Before:**
```typescript
async getApplicationsByUser(userId: string) {
  const applications = await this.prisma.application.findMany({
    where: { userId },
    include: {
      session: { /* ... */ },
      company: { /* ... */ },
      documents: { /* ... */ },
      formResponses: { /* ... */ },
      // ❌ reviews NOT included
    },
  });
}
```

**After:**
```typescript
async getApplicationsByUser(userId: string) {
  const applications = await this.prisma.application.findMany({
    where: { userId },
    include: {
      session: { /* ... */ },
      company: { /* ... */ },
      documents: { /* ... */ },
      formResponses: { /* ... */ },
      reviews: {  // ✅ NOW included
        select: {
          id: true,
          decision: true,
          comments: true,
          decidedAt: true,
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          decidedAt: 'desc',
        },
      },
    },
  });
}
```

## How It Works

### Frontend Display (Already Implemented)

The student applications page already had the UI code to display comments:

#### For Changes Requested (DRAFT status):
```typescript
{documentStatus.status === 'DRAFT' && (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-100 p-3 rounded-lg">
      <MessageSquare className="h-4 w-4" />
      <span>Coordinator requested changes</span>
    </div>
    {reviewComments && (
      <div className="text-sm text-gray-700 bg-white border border-orange-200 p-3 rounded-lg">
        <p className="font-semibold mb-1">Comments:</p>
        <p className="italic">{reviewComments}</p>
      </div>
    )}
    <Link href="/student/bli02">
      <Button variant="outline">
        <Upload className="h-4 w-4 mr-2" />
        Re-upload Document
      </Button>
    </Link>
  </div>
)}
```

#### For Rejected (REJECTED status):
```typescript
{documentStatus.status === 'REJECTED' && (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-sm text-red-700 bg-red-100 p-3 rounded-lg">
      <XCircle className="h-4 w-4" />
      <span>Document rejected by coordinator</span>
    </div>
    {reviewComments && (
      <div className="text-sm text-gray-700 bg-white border border-red-200 p-3 rounded-lg">
        <p className="font-semibold mb-1">Reason:</p>
        <p className="italic">{reviewComments}</p>
      </div>
    )}
    <p className="text-sm text-gray-600">
      Please contact your coordinator for further guidance.
    </p>
  </div>
)}
```

### Data Flow

1. **Coordinator reviews document**
   - Clicks "Request Changes" or "Reject"
   - Enters comments/reason
   - Review record created in database with comments

2. **Backend returns data**
   - Student's application includes `reviews` array
   - Latest review contains `comments` field
   - Frontend extracts: `latestReview.comments`

3. **Frontend displays comments**
   - Step 3 in workflow timeline shows status
   - If status is `DRAFT` or `REJECTED`, displays comments box
   - Comments shown with appropriate styling

## Visual Display

### Changes Requested (Orange):
```
┌─────────────────────────────────────────────┐
│ 💬 Coordinator requested changes            │
├─────────────────────────────────────────────┤
│ Comments:                                   │
│ "Please provide a clearer copy of the      │
│  offer letter. The current one is blurry." │
├─────────────────────────────────────────────┤
│ [📤 Re-upload Document]                     │
└─────────────────────────────────────────────┘
```

### Rejected (Red):
```
┌─────────────────────────────────────────────┐
│ ✗ Document rejected by coordinator          │
├─────────────────────────────────────────────┤
│ Reason:                                     │
│ "This is not an official offer letter.     │
│  Please submit the correct document."      │
├─────────────────────────────────────────────┤
│ Please contact your coordinator for         │
│ further guidance.                           │
└─────────────────────────────────────────────┘
```

## Benefits

✅ **Transparency**: Students know exactly why changes are needed
✅ **Clear Guidance**: Specific feedback helps students fix issues
✅ **Reduced Confusion**: No need to email coordinator for clarification
✅ **Better Communication**: Direct feedback loop between coordinator and student
✅ **Faster Resolution**: Students can address issues immediately

## Example Scenarios

### Scenario 1: Blurry Document
**Coordinator Action:**
- Reviews BLI-02
- Clicks "Request Changes"
- Enters: "Document is too blurry. Please scan at higher resolution."

**Student Sees:**
- Orange box in Step 3
- "Coordinator requested changes"
- Comments: "Document is too blurry. Please scan at higher resolution."
- Re-upload button

**Student Action:**
- Scans document at higher quality
- Clicks "Re-upload Document"
- Uploads new file

### Scenario 2: Wrong Document Type
**Coordinator Action:**
- Reviews BLI-02
- Clicks "Reject"
- Enters: "This is an internship confirmation, not an offer letter. Please submit the correct document."

**Student Sees:**
- Red box in Step 3
- "Document rejected by coordinator"
- Reason: "This is an internship confirmation, not an offer letter. Please submit the correct document."
- Guidance to contact coordinator

**Student Action:**
- Contacts coordinator for clarification
- Obtains correct document
- Submits new application if needed

## Files Modified

- `ptms-backend/src/applications/applications.service.ts`
  - Updated `getApplicationsByUser()` to include `reviews` relation
  - Reviews ordered by `decidedAt` DESC (most recent first)
  - Includes reviewer information for reference

## Frontend (Already Working)

- `ptms-frontend/src/app/student/applications/page.tsx`
  - Already extracts `reviewComments` from `existingApp.reviews[0].comments`
  - Already displays comments in Step 3 for DRAFT and REJECTED statuses
  - Styled with appropriate colors (orange for changes, red for rejection)

## Summary

Students can now see coordinator's comments directly in the workflow timeline:
- ✅ Changes requested → Shows comments with re-upload button
- ✅ Rejected → Shows rejection reason with guidance
- ✅ Clear, visible feedback in the workflow
- ✅ No need to check emails or contact coordinator for basic feedback
