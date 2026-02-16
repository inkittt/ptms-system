-- Check if PDFs are stored in the Document table
-- Run this in your database client (Supabase Studio, pgAdmin, etc.)

-- 1. View all documents with their storage info
SELECT 
  id,
  "applicationId",
  type,
  "fileUrl",
  "storageType",
  status,
  version,
  "createdAt",
  "updatedAt"
FROM "Document"
WHERE type IN ('BLI_01', 'BLI_03', 'SLI_03', 'DLI_01', 'BLI_04')
ORDER BY "createdAt" DESC;

-- 2. Check specific document types
SELECT 
  d.type,
  d."fileUrl",
  d.status,
  u.name as student_name,
  u."matricNo"
FROM "Document" d
JOIN "Application" a ON d."applicationId" = a.id
JOIN "User" u ON a."userId" = u.id
WHERE d.type = 'BLI_01'
ORDER BY d."createdAt" DESC;

-- 3. Verify file URLs are not 'ONLINE_SUBMISSION'
-- (those are for form submissions, not generated PDFs)
SELECT 
  type,
  "fileUrl",
  CASE 
    WHEN "fileUrl" = 'ONLINE_SUBMISSION' THEN 'Form Submission (No PDF)'
    ELSE 'Stored PDF'
  END as pdf_status
FROM "Document"
WHERE type IN ('BLI_01', 'BLI_03', 'SLI_03', 'DLI_01', 'BLI_04')
ORDER BY "createdAt" DESC;
