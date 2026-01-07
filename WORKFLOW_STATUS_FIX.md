# Workflow Status Fix - Dynamic Step Calculation

## Issue Fixed
**Problem**: Workflow steps showed as "Completed" even when no application was created yet. The page was using hardcoded mock data instead of real backend data.

## Solution Implemented

### Dynamic Step Status Calculation

The workflow now dynamically determines each step's status based on actual data from the backend:

#### Step Status Logic:

**Step 1: Fill BLI-01**
- **Not Started** (`in_progress`): No BLI-01 application exists
- **Completed** (`completed`): BLI-01 application exists in database

**Step 2: Upload BLI-02**
- **Locked** (`locked`): Step 1 not completed
- **In Progress** (`in_progress`): Step 1 completed, but no BLI-02 uploaded
- **Completed** (`completed`): BLI-02 document uploaded

**Step 3: Coordinator Review**
- **Locked** (`locked`): Step 2 not completed
- **In Progress** (`in_progress`): BLI-02 uploaded, waiting for review or under review
- **Completed** (`completed`): Document status is `SIGNED` (approved)

**Steps 4-10: Future Steps**
- **Locked** (`locked`): Step 3 not completed
- **In Progress** (`in_progress`): Step 3 completed (only Step 4)
- **Locked** (`locked`): All other steps remain locked

### Code Changes

#### State Variables Added:
```typescript
const [hasBli01, setHasBli01] = useState(false);
const [hasBli02, setHasBli02] = useState(false);
```

#### Dynamic Step Calculation Function:
```typescript
const getWorkflowSteps = () => {
  const steps = [...workflowSteps];
  
  // Step 1: BLI-01 status
  if (hasBli01) {
    steps[0].status = "completed";
  } else {
    steps[0].status = "in_progress";
  }
  
  // Step 2: BLI-02 status
  if (!hasBli01) {
    steps[1].status = "locked";
  } else if (hasBli02) {
    steps[1].status = "completed";
  } else {
    steps[1].status = "in_progress";
  }
  
  // Step 3: Coordinator Review status
  if (!hasBli02) {
    steps[2].status = "locked";
  } else if (documentStatus?.status === 'SIGNED') {
    steps[2].status = "completed";
  } else {
    steps[2].status = "in_progress";
  }
  
  // Steps 4-10: Lock until step 3 is completed
  for (let i = 3; i < steps.length; i++) {
    if (documentStatus?.status === 'SIGNED') {
      if (i === 3) {
        steps[i].status = "in_progress";
      } else {
        steps[i].status = "locked";
      }
    } else {
      steps[i].status = "locked";
    }
  }
  
  return steps;
};
```

#### Data Loading:
```typescript
useEffect(() => {
  async function loadApplications() {
    const response = await applicationsApi.getMyApplications();
    const applications = response.applications;
    
    if (applications && applications.length > 0) {
      const existingApp = applications.find(app => 
        app.formResponses?.some((form: any) => form.formTypeEnum === 'BLI_01')
      );
      
      if (existingApp) {
        setBli01ApplicationId(existingApp.id);
        setHasBli01(true);  // Mark BLI-01 as completed
        
        const bli02Document = existingApp.documents?.find(
          (doc: any) => doc.type === 'BLI_02'
        );
        
        if (bli02Document) {
          setDocumentStatus(bli02Document);
          setHasBli02(true);  // Mark BLI-02 as completed
        }
      }
    }
  }
  
  loadApplications();
}, []);
```

### Progress Calculation

**Before:**
```typescript
const progressPercentage = (mockApplication.currentStep / mockApplication.totalSteps) * 100;
const completedSteps = workflowSteps.filter(s => s.status === "completed").length;
```

**After:**
```typescript
const dynamicWorkflowSteps = getWorkflowSteps();
const completedSteps = dynamicWorkflowSteps.filter(s => s.status === "completed").length;
const currentStep = completedSteps + 1;
const progressPercentage = (currentStep / dynamicWorkflowSteps.length) * 100;
```

### Status Badge

**Before:**
```typescript
<Badge className={`${getStatusColor(mockApplication.status)}`}>
  {mockApplication.status.replace(/_/g, " ")}
</Badge>
```

**After:**
```typescript
<Badge className={`text-lg px-4 py-2 ${
  !hasBli01 ? 'bg-gray-100 text-gray-800' :
  !hasBli02 ? 'bg-yellow-100 text-yellow-800' :
  documentStatus?.status === 'SIGNED' ? 'bg-blue-100 text-blue-800' :
  'bg-yellow-100 text-yellow-800'
}`}>
  {!hasBli01 ? 'NOT STARTED' :
   !hasBli02 ? 'IN PROGRESS' :
   documentStatus?.status === 'SIGNED' ? 'APPROVED' :
   'UNDER REVIEW'}
</Badge>
```

## Visual States

### 1. No Application Created (Initial State)
- **Status Badge**: "NOT STARTED" (Gray)
- **Progress**: 10% (Step 1 of 10)
- **Step 1**: In Progress (Blue, animated clock)
- **Step 2**: Locked
- **Step 3+**: All Locked

### 2. BLI-01 Completed
- **Status Badge**: "IN PROGRESS" (Yellow)
- **Progress**: 20% (Step 2 of 10)
- **Step 1**: Completed (Green checkmark)
- **Step 2**: In Progress (Blue, animated clock)
- **Step 3+**: All Locked

### 3. BLI-02 Uploaded, Under Review
- **Status Badge**: "UNDER REVIEW" (Yellow)
- **Progress**: 30% (Step 3 of 10)
- **Step 1**: Completed
- **Step 2**: Completed
- **Step 3**: In Progress (Blue, animated clock)
- **Step 4+**: All Locked

### 4. Document Approved
- **Status Badge**: "APPROVED" (Blue)
- **Progress**: 40% (Step 4 of 10)
- **Step 1**: Completed
- **Step 2**: Completed
- **Step 3**: Completed
- **Step 4**: In Progress
- **Step 5+**: All Locked

## Benefits

✅ **Accurate Status**: Shows real application state, not mock data
✅ **Dynamic Updates**: Status updates automatically when data changes
✅ **Clear Progression**: Students see exactly where they are
✅ **Proper Locking**: Steps unlock only when prerequisites are met
✅ **Real-time Feedback**: Status reflects backend data immediately

## Testing Scenarios

### Scenario 1: New Student (No Application)
1. Student logs in for first time
2. **Expected**: 
   - Status: "NOT STARTED"
   - Step 1: In Progress
   - Steps 2-10: Locked
   - Progress: 10%

### Scenario 2: BLI-01 Submitted
1. Student completes BLI-01 form
2. **Expected**:
   - Status: "IN PROGRESS"
   - Step 1: Completed (green checkmark)
   - Step 2: In Progress (can upload)
   - Steps 3-10: Locked
   - Progress: 20%

### Scenario 3: BLI-02 Uploaded
1. Student uploads BLI-02 document
2. **Expected**:
   - Status: "UNDER REVIEW"
   - Step 1: Completed
   - Step 2: Completed (green checkmark)
   - Step 3: In Progress (waiting for coordinator)
   - Steps 4-10: Locked
   - Progress: 30%

### Scenario 4: Document Approved
1. Coordinator approves BLI-02
2. **Expected**:
   - Status: "APPROVED"
   - Steps 1-3: Completed (all green)
   - Step 4: In Progress (unlocked)
   - Steps 5-10: Locked
   - Progress: 40%

## Files Modified

- `ptms-frontend/src/app/student/applications/page.tsx`
  - Added state variables for tracking completion
  - Implemented dynamic step calculation
  - Updated progress calculation
  - Updated status badge logic
  - Replaced mock data with real backend data

## Summary

The workflow now accurately reflects the student's actual progress based on backend data:
- No more fake "Completed" statuses
- Steps unlock progressively as prerequisites are met
- Status badge shows current state accurately
- Progress percentage calculated from real data
- Students see exactly what they need to do next
