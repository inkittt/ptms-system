# BLI01 PDF Generation Guide

## Overview
The BLI01 PDF generation feature allows students to download their submitted BLI-01 form as a professionally formatted PDF document. This implementation follows the same pattern as the SLI01 example provided.

## Implementation Summary

### Backend Changes

#### 1. Dependencies Added
- **pdfkit**: `^0.15.0` - PDF generation library
- **@types/pdfkit**: `^0.13.5` - TypeScript type definitions

Location: `ptms-backend/package.json`

#### 2. PDF Generator Utility
Created: `ptms-backend/src/applications/utils/bli01-generator.ts`

**Key Features:**
- Generates professional BLI-01 form PDF with UiTM branding
- Includes two main sections:
  - Section A: Personal Information (name, NRIC, matric number, program, faculty, CGPA, phone, email)
  - Section B: Training Session Information (session name, academic year, semester)
- Declaration section with signature and date fields
- Automated footer with generation timestamp and reference ID
- Data validation before PDF generation

**Main Functions:**
- `generateBLI01(applicationData)` - Main PDF generation function
- `validateBLI01Data(data)` - Validates required fields before generation
- `addHeader()` - Adds UiTM header and form title
- `addFormContent()` - Adds form sections with table-like structure
- `addFooter()` - Adds automated footer with metadata

#### 3. Applications Service
Updated: `ptms-backend/src/applications/applications.service.ts`

**New Method:**
```typescript
async generateBLI01PDF(applicationId: string, userId: string): Promise<Buffer>
```

**Functionality:**
- Retrieves application with user, session, and form response data
- Validates that BLI-01 form data exists
- Prepares data structure for PDF generation
- Calls the PDF generator utility
- Returns PDF as Buffer

#### 4. Applications Controller
Updated: `ptms-backend/src/applications/applications.controller.ts`

**New Endpoint:**
```
GET /api/applications/:id/bli01/pdf
```

**Features:**
- Protected by JWT authentication
- Requires STUDENT role
- Returns PDF as downloadable file
- Sets appropriate headers (Content-Type, Content-Disposition, Content-Length)
- Uses StreamableFile for efficient file streaming

### Frontend Changes

#### 1. API Client Enhancement
Updated: `ptms-frontend/src/lib/api.ts`

**New Method:**
```typescript
async getBlob(endpoint: string): Promise<Blob>
```

Handles binary file downloads (PDFs, images, etc.) with proper authentication.

#### 2. Applications API
Updated: `ptms-frontend/src/lib/api/applications.ts`

**New Method:**
```typescript
downloadBLI01PDF: async (applicationId: string) => Promise<Blob>
```

Calls the backend endpoint and returns the PDF as a Blob.

#### 3. BLI01 Form Page
Updated: `ptms-frontend/src/app/student/bli01/page.tsx`

**New Features:**
- Added state management for:
  - `isDownloading` - Tracks PDF download status
  - `submittedApplicationId` - Stores application ID after submission
- Added `handleDownloadPDF()` function that:
  - Downloads PDF blob from API
  - Creates temporary download link
  - Triggers browser download
  - Cleans up resources
- Updated UI with:
  - Download PDF button (appears after form submission)
  - Loading state during download
  - Disabled submit button after successful submission
  - Dynamic "Cancel" / "Back to Applications" button text

## Usage Flow

1. **Student fills out BLI-01 form** with personal and training session information
2. **Student submits the form** - Data is saved to the database
3. **Download button appears** after successful submission
4. **Student clicks "Download PDF"** button
5. **PDF is generated** on the backend with all form data
6. **Browser downloads** the PDF file automatically
7. **Student can view** the professionally formatted BLI-01 form

## PDF Format

The generated PDF includes:

### Header
- UiTM branding
- Faculty name (Fakulti Sains Komputer dan Matematik)
- Campus name (Kampus Jasin)
- Form title: "BLI-01 - STUDENT INFORMATION AND INTERNSHIP APPLICATION FORM"

### Section A: Personal Information
Table format with the following fields:
- Name of Student
- NRIC
- UiTM Student Number
- Program
- Faculty
- CGPA
- Phone Number
- Email

### Section B: Training Session Information
Table format with:
- Training Session
- Academic Year
- Semester

### Declaration
Standard declaration text with signature and date fields

### Footer
- Auto-generated timestamp
- Document reference ID
- System identification

## File Locations

### Backend
- PDF Generator: `ptms-backend/src/applications/utils/bli01-generator.ts`
- Service: `ptms-backend/src/applications/applications.service.ts`
- Controller: `ptms-backend/src/applications/applications.controller.ts`
- Package Config: `ptms-backend/package.json`

### Frontend
- API Client: `ptms-frontend/src/lib/api.ts`
- Applications API: `ptms-frontend/src/lib/api/applications.ts`
- BLI01 Page: `ptms-frontend/src/app/student/bli01/page.tsx`

## Testing

To test the feature:

1. Start the backend server:
   ```bash
   cd ptms-backend
   npm run start:dev
   ```

2. Start the frontend:
   ```bash
   cd ptms-frontend
   npm run dev
   ```

3. Login as a student
4. Navigate to BLI-01 form
5. Fill out and submit the form
6. Click "Download PDF" button
7. Verify the PDF downloads and contains correct information

## Notes

- The PDF generator follows the same pattern as the SLI01 example
- All data is validated before PDF generation
- PDFs are generated on-demand (not stored in the database)
- The feature requires the student to have submitted a BLI-01 form
- PDF filename format: `BLI-01-{applicationId}.pdf`

## Future Enhancements

Possible improvements:
- Add UiTM logo to PDF header
- Support for multiple language versions (English/Malay)
- Email PDF to student automatically after submission
- Store generated PDFs in cloud storage for archival
- Add digital signature support
- Batch PDF generation for coordinators
