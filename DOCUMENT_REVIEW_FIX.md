# Document Review Display Fix

## Issue
Reviewed documents (approved/rejected) were not appearing in the coordinator's document review page because the backend query was only returning documents with `PENDING_SIGNATURE` and `DRAFT` statuses.

## Root Cause
In `applications.service.ts`, the `getPendingDocuments()` method had a hardcoded filter:

```typescript
const where: any = {
  status: {
    in: [DocumentStatus.PENDING_SIGNATURE, DocumentStatus.DRAFT],
  },
  // ...
};
```

This meant:
- ✅ Documents awaiting review (`PENDING_SIGNATURE`) - shown
- ✅ Documents with requested changes (`DRAFT`) - shown
- ❌ Approved documents (`SIGNED`) - **NOT shown**
- ❌ Rejected documents (`REJECTED`) - **NOT shown**

## Solution

Updated the query to include all relevant document statuses:

```typescript
const where: any = {
  application: {
    sessionId: {
      in: sessionIds,
    },
  },
};

// Apply status filter - if not specified, show all documents
if (filters.status) {
  where.status = filters.status;
}
// If no status filter, default to showing all relevant documents
else {
  where.status = {
    in: [
      DocumentStatus.PENDING_SIGNATURE,  // Awaiting review
      DocumentStatus.DRAFT,               // Changes requested
      DocumentStatus.SIGNED,              // Approved
      DocumentStatus.REJECTED,            // Rejected
    ],
  };
}
```

## How It Works Now

### Default Behavior (No Status Filter)
When coordinator visits the document review page without filtering by status, they see **all documents**:
- Pending review
- Changes requested
- Approved
- Rejected

### With Status Filter
When coordinator filters by specific status (e.g., clicks "Pending" tab), they see only documents with that status:
- `?status=PENDING_SIGNATURE` → Only pending documents
- `?status=DRAFT` → Only documents with requested changes
- `?status=SIGNED` → Only approved documents
- `?status=REJECTED` → Only rejected documents

## Tab Counts Now Work Correctly

The frontend tabs will now show accurate counts:

- **All (X)** - Total documents from coordinator's sessions
- **Pending (X)** - Documents awaiting review
- **Changes (X)** - Documents with requested changes
- **Approved (X)** - Approved documents
- **Rejected (X)** - Rejected documents

## Benefits

✅ **Complete History**: Coordinators can see all documents, not just pending ones
✅ **Track Progress**: See which documents have been reviewed
✅ **Audit Trail**: View approved and rejected documents
✅ **Better Filtering**: Tabs work correctly with accurate counts
✅ **Flexible Queries**: Status filter parameter works as expected

## Testing

### Test 1: View All Documents
1. Coordinator logs in
2. Goes to document review page
3. **Expected**: Sees all documents (pending, approved, rejected)

### Test 2: Filter by Status
1. Coordinator clicks "Approved" tab
2. **Expected**: Sees only approved documents
3. Coordinator clicks "Rejected" tab
4. **Expected**: Sees only rejected documents

### Test 3: Review History
1. Coordinator approves a document
2. Document moves to "Approved" tab
3. **Expected**: Document still visible in "All" tab and "Approved" tab

## Files Modified

- `ptms-backend/src/applications/applications.service.ts`
  - Updated `getPendingDocuments()` method
  - Changed default status filter to include all relevant statuses
  - Maintained session-based access control

## Summary

The document review page now shows all documents from the coordinator's sessions, including those that have been reviewed. This provides a complete view of document history and allows coordinators to track their review progress.
