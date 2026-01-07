# Student Progress Tracking Update

## Changes Made

### Backend Changes

#### 1. Added Student Progress Endpoint
**File:** `ptms-backend/src/reports/reports.controller.ts`
- Added new `GET /reports/student-progress` endpoint
- Returns detailed student progress information for a session

#### 2. Implemented Student Progress Service
**File:** `ptms-backend/src/reports/reports.service.ts`
- Added `getStudentProgress()` method
- Fetches all students enrolled in a session via `StudentSession` table
- Calculates progress percentage based on completed documents (BLI-01 to BLI-07)
- Categorizes students into 4 status groups:
  - **Not Started**: No application or draft status
  - **Application Submitted**: Application under review
  - **Approved & Ongoing**: Approved but BLI-04 not completed
  - **Completed**: BLI-04 signed (considered completed)

**Progress Calculation:**
- Total steps: 7 (BLI-01 through BLI-07)
- Progress % = (Completed Documents / 7) × 100
- Documents counted based on status (SIGNED for completed students)

### Frontend Changes

#### 1. Added API Method
**File:** `ptms-frontend/src/lib/api/reports.ts`
- Added `getStudentProgress()` method to fetch student progress data

#### 2. Updated Reports Page
**File:** `ptms-frontend/src/app/coordinator/reports/page.tsx`

**Changes:**
1. Added `studentProgressData` state
2. Fetch student progress data in `fetchAllData()`
3. Updated **Student Progress Overview** with real counts:
   - Not Started
   - Application Submitted
   - Approved & Ongoing
   - Completed

4. Added **Student Progress Details** table showing:
   - Student name and matric number
   - Program
   - Status badge (color-coded)
   - Progress bar with percentage
   - Document completion count (e.g., 3/7)

**Visual Features:**
- Color-coded progress bars:
  - Purple (100%): Completed
  - Green (≥50%): Good progress
  - Yellow (>0%): In progress
  - Gray (0%): Not started
- Status badges with appropriate colors
- Responsive table layout

## Test Results

### Session: afiq session 2026 (1)
**Total Students:** 7

### Individual Student Progress:

1. **Karen Liew Shu Ting** (2021567801)
   - Status: Completed
   - Progress: 43% (3/7 documents)
   - Documents: BLI-02, BLI-03, BLI-04 (all SIGNED)

2. **Quinn Tan Hui Ying** (2021567807)
   - Status: Completed
   - Progress: 43% (3/7 documents)
   - Documents: BLI-02, BLI-03, BLI-04 (all SIGNED)

3. **Liam Ong Wei Lun** (2021567802)
   - Status: Application Submitted
   - Progress: 14% (1/7 documents)
   - Documents: BLI-02 (DRAFT)

4. **Michelle Teo Hui Xin** (2021567803)
   - Status: Application Submitted
   - Progress: 14% (1/7 documents)
   - Documents: BLI-02 (DRAFT)

5. **Olivia Sim Yi Ling** (2021567805)
   - Status: Not Started
   - Progress: 0% (0/7 documents)

6. **Sophia Ng Jia Wen** (2021567809)
   - Status: Not Started
   - Progress: 0% (0/7 documents)

7. **Thomas Chua Jun Ming** (2021567810)
   - Status: Not Started
   - Progress: 0% (0/7 documents)

### Summary Statistics:
- **Not Started:** 3 students
- **Application Submitted:** 2 students
- **Approved & Ongoing:** 0 students
- **Completed:** 2 students

## UI Preview

The Students tab now displays:

1. **Students by Program** (left panel)
   - Shows program distribution with progress bars

2. **Student Progress Overview** (right panel)
   - Real-time counts for each status category
   - Color-coded status boxes

3. **Student Progress Details** (full-width table)
   - Complete list of all 7 students
   - Individual progress tracking
   - Visual progress bars
   - Document completion counts

## Benefits

1. **Real-time Tracking**: Coordinators can see exact progress for each student
2. **Visual Feedback**: Progress bars and color coding make it easy to identify students who need attention
3. **Accurate Metrics**: All counts are based on actual session enrollment
4. **Detailed View**: Individual student progress helps coordinators provide targeted support
5. **Session-Filtered**: Only shows students enrolled in the selected session
