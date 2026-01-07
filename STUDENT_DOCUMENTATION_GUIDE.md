# 📚 Student Documentation Guide - Complete Process

## 🎯 Overview: BLI-01 to Completion

This guide explains the **complete step-by-step process** for students to complete their practical training documentation from start to finish.

**Total Duration:** 4-5 months  
**Total Forms:** 4 forms (BLI-01, BLI-02, BLI-03, BLI-04)  
**Total Documents Generated:** 3 documents (SLI-01, SLI-03, DLI-01)

---

## 📋 Quick Navigation

- [Phase 1: Pre-Application](#phase-1-pre-application)
- [Phase 2: Application Submission](#phase-2-application-submission)
- [Phase 3: Coordinator Review](#phase-3-coordinator-review)
- [Phase 4: During Internship](#phase-4-during-internship)
- [Phase 5: Completion](#phase-5-completion)
- [Status Flow Chart](#status-flow-chart)
- [Timeline Overview](#timeline-overview)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Phase 1: Pre-Application

### Step 0: Check Eligibility ✓

**What to do:**
1. Log in to PTMS at `http://localhost:3000`
2. Navigate to Student Dashboard
3. Check your eligibility status

**Requirements:**
- ✅ Credits earned: **≥ 113 credits**
- ✅ CGPA: Check with coordinator for minimum requirement
- ✅ No outstanding fees or disciplinary issues

**If Eligible:**
- Green checkmark ✓ appears on dashboard
- "Start New Application" button is enabled
- Proceed to Step 1

**If Not Eligible:**
- Red cross ✗ appears on dashboard
- Complete more courses to reach 113 credits
- Contact coordinator for special cases

**Page:** `/student/dashboard`

---

## 📝 Phase 2: Application Submission

### Step 1: Fill BLI-01 Form (Application Form)

**Location:** `/student/bli01`  
**Estimated Time:** 15-20 minutes  
**Status Change:** `DRAFT` → `SUBMITTED`

#### What You Need:
- [ ] Personal information (name, matric number, IC, phone, email)
- [ ] Program details (CS251/CS252/CS253/CS254)
- [ ] Current CGPA
- [ ] Company name and address
- [ ] Internship position/job title
- [ ] Proposed start date and end date
- [ ] Supervisor name and contact information

#### Step-by-Step:
1. Click **"Start New Application"** on dashboard
2. Fill **Section A: Student Information**
   - Full name (as per IC)
   - Matric number
   - IC number
   - Phone number (format: 012-3456789)
   - Email address
   - Program code

3. Fill **Section B: Company Information**
   - Company name
   - Company address (full address with postcode)
   - Company phone number
   - Company email

4. Fill **Section C: Internship Details**
   - Position/Job title
   - Start date (format: DD/MM/YYYY)
   - End date (format: DD/MM/YYYY)
   - Duration (auto-calculated in weeks)
   - If duration > 14 weeks, check acknowledgment box

5. Fill **Section D: Supervisor Information**
   - Supervisor full name
   - Supervisor phone number
   - Supervisor email
   - Supervisor position/title

6. Review all information carefully
7. Click **"Submit BLI-01"**

#### What Happens Next:
- ✅ Form is validated
- ✅ **SLI-01 is auto-generated** (Student Application Letter)
- ✅ Application status changes to `SUBMITTED`
- ✅ You receive confirmation notification
- ✅ SLI-01 PDF is available for download

#### Important Notes:
- ⚠️ Double-check all dates - they cannot be changed after SLI-03 is issued
- ⚠️ Ensure supervisor email is correct - they will receive forms via this email
- ⚠️ Save a copy of SLI-01 for your records

**Output Documents:**
- 📄 **SLI-01** (Student Application Letter) - Download from dashboard

---

### Step 2: Upload BLI-02 (Offer Letter/Acceptance Letter)

**Location:** `/student/bli02`  
**Estimated Time:** 10 minutes  
**Status Change:** `SUBMITTED` → `UNDER_REVIEW`

#### What You Need:
- [ ] Offer letter OR acceptance letter from company
- [ ] File format: PDF, JPG, or PNG
- [ ] File size: Maximum 10MB
- [ ] Proper file naming

#### File Naming Convention:
**Required format (choose one):**
- `[BLI-02] YourFullName.pdf`
- `[OfferLetter] YourFullName.pdf`

**Examples:**
- ✅ `[BLI-02] Ahmad Bin Abdullah.pdf`
- ✅ `[OfferLetter] Ahmad Bin Abdullah.pdf`
- ❌ `offer.pdf` (missing prefix)
- ❌ `BLI-02.pdf` (missing name)

#### Document Requirements:
Your offer letter MUST contain:
- ✅ Company name and address
- ✅ Internship start date
- ✅ Internship end date OR duration/scope
- ✅ Position/job title
- ⚠️ Supervisor contact (recommended)
- ⚠️ Job responsibilities (recommended)

#### Step-by-Step:
1. Navigate to `/student/bli02`
2. Prepare your offer letter file
3. Rename file according to naming convention
4. **Upload Methods:**
   - **Drag & Drop:** Drag file into upload area
   - **Browse:** Click "browse to choose a file"

5. **Preview uploaded file:**
   - Check file name is correct
   - Verify file size
   - Preview image (if JPG/PNG)

6. Review document requirements checklist
7. Click **"Upload Document"**

#### What Happens Next:
- ✅ File is uploaded to cloud storage
- ✅ Document is linked to your application
- ✅ Status changes to `UNDER_REVIEW`
- ✅ Coordinator receives notification
- ✅ You can view upload status on dashboard

#### Troubleshooting:
- **Error: "File size too large"** → Compress PDF or reduce image quality
- **Error: "Invalid file name"** → Rename file with [BLI-02] or [OfferLetter] prefix
- **Error: "Invalid file type"** → Convert to PDF, JPG, or PNG

**Output:**
- 📄 **BLI-02** uploaded and stored

---

### Step 3: Wait for Coordinator Review ⏳

**Estimated Time:** 3-7 business days  
**Your Action:** Monitor dashboard for updates

#### What Coordinator Reviews:
- ✓ BLI-01 form completeness
- ✓ BLI-02 document validity
- ✓ Company information accuracy
- ✓ Date consistency
- ✓ Supervisor contact information

#### Possible Outcomes:

#### A. ✅ APPROVED
**Status:** `UNDER_REVIEW` → `APPROVED`

**What happens:**
- You receive email notification: "Application Approved"
- Dashboard shows green "Approved" badge
- You can proceed to Step 4 (BLI-03)

**Next action:** Fill BLI-03 form

---

#### B. ⚠️ CHANGES REQUESTED
**Status:** `UNDER_REVIEW` → `CHANGES_REQUESTED`

**What happens:**
- You receive email with coordinator's comments
- Dashboard shows orange "Changes Requested" badge
- Comments appear on application details page

**Example comments:**
- "Missing supervisor phone number in BLI-01"
- "Offer letter does not show clear end date"
- "Company address incomplete"

**Next action:**
1. Read coordinator's comments carefully
2. Fix the issues mentioned
3. Resubmit BLI-01 or upload new BLI-02
4. Wait for re-review (1-3 days)

---

#### C. ❌ REJECTED
**Status:** `UNDER_REVIEW` → `REJECTED`

**What happens:**
- You receive email with rejection reason
- Dashboard shows red "Rejected" badge

**Common rejection reasons:**
- Company not suitable for program
- Dates conflict with academic calendar
- Incomplete documentation
- Eligibility issues

**Next action:**
1. Contact coordinator for clarification
2. Fix major issues
3. Start new application OR appeal decision

---

### Step 4: Fill BLI-03 (Company Details & Progress Report)

**Location:** `/student/bli03`  
**Estimated Time:** 30-40 minutes  
**Status Change:** `APPROVED` → `UNDER_REVIEW` (for BLI-03)

#### What You Need:
- [ ] Detailed company information
- [ ] Supervisor full details
- [ ] Internship scope and objectives
- [ ] Progress report (if mid-internship)
- [ ] Printer and scanner (for hardcopy)

#### BLI-03 has TWO parts:

---

#### Part 1: Online Form (Tab 1)

**Step-by-Step:**

1. Navigate to `/student/bli03`
2. Select **"Online Form"** tab

3. **Section A: Company Information (Detailed)**
   - Company full name
   - Company registration number
   - Company address (with postcode and state)
   - Company phone and fax
   - Company email and website
   - Industry type
   - Company size (number of employees)

4. **Section B: Supervisor Details (Complete)**
   - Supervisor full name
   - Supervisor position/title
   - Supervisor department
   - Supervisor phone (office and mobile)
   - Supervisor email
   - Supervisor qualifications

5. **Section C: Internship Scope**
   - Job title/position
   - Department/division
   - Main responsibilities (list 5-10 items)
   - Learning objectives (what you hope to learn)
   - Expected outcomes
   - Tools/technologies to be used

6. **Section D: Progress Report** (if mid-internship)
   - Tasks completed so far
   - Skills acquired
   - Challenges faced
   - Current progress percentage
   - Supervisor feedback

7. Review all information
8. Click **"Generate PDF"**
9. Download the generated PDF

---

#### Part 2: Hardcopy Upload (Tab 2)

**Step-by-Step:**

1. **Print the generated PDF** from Part 1
2. **Sign the printed form** (student signature)
3. **Get supervisor to sign** (if already at company)
4. **Scan the signed document**
   - Use scanner or mobile scanning app
   - Save as PDF (preferred) or high-quality JPG
   - File size: Maximum 10MB
   - File name: `[BLI-03] YourName_Signed.pdf`

5. Switch to **"Hardcopy Upload"** tab
6. Upload the scanned signed document
7. Preview uploaded file
8. Click **"Submit Progress Report"**

#### What Happens Next:
- ✅ BLI-03 online form saved
- ✅ BLI-03 hardcopy uploaded
- ✅ Status changes to `UNDER_REVIEW`
- ✅ Coordinator reviews BLI-03
- ✅ If approved → SLI-03 generation begins

#### Important Notes:
- ⚠️ BLI-03 information must match BLI-01 and BLI-02
- ⚠️ Supervisor details must be accurate - they will be contacted
- ⚠️ Keep original signed hardcopy for your records

**Output:**
- 📄 **BLI-03 Online Form** (PDF generated)
- 📄 **BLI-03 Hardcopy** (Signed and uploaded)

---

## 🎉 Phase 3: SLI-03 Issuance

### Step 5: Coordinator Approves & Issues SLI-03

**Estimated Time:** 1-3 days after BLI-03 submission  
**Status Change:** `APPROVED` → `SLI_03_ISSUED`

#### What Coordinator Does:
- ✓ Reviews BLI-03 completeness
- ✓ Verifies all information consistency
- ✓ Approves final application
- ✓ Triggers SLI-03 generation

#### What System Does Automatically:
- ✅ Generates **SLI-03** (Official Internship Letter)
- ✅ Sets official start date and end date
- ✅ Generates **DLI-01** (Learning Agreement)
- ✅ Creates document package (ZIP file)
- ✅ Sends notification to student

---

### Step 6: Download SLI-03 & DLI-01

**Location:** `/student/dashboard` or `/student/applications`

#### What You Receive:
1. **SLI-03** - Official Internship Letter
   - Addressed to company
   - Contains official dates
   - Signed by coordinator/program head
   - University letterhead

2. **DLI-01** - Learning Agreement
   - Internship objectives
   - Learning outcomes
   - Assessment criteria
   - Supervisor responsibilities

#### Step-by-Step:
1. Check email for notification: "SLI-03 is Ready!"
2. Log in to dashboard
3. Navigate to "My Documents" section
4. Download **SLI-03** (PDF)
5. Download **DLI-01** (PDF)
6. Download **Document Package** (ZIP - contains both)

#### What to Do with Documents:
- [ ] **Print SLI-03** (2 copies)
   - 1 copy for company
   - 1 copy for your records

- [ ] **Print DLI-01** (2 copies)
   - 1 copy for company
   - 1 copy for your records

- [ ] **Bring to company on first day**
- [ ] **Give to HR/Supervisor**
- [ ] **Keep copies safe**

#### Important Notes:
- ⚠️ **Official dates are ONLY from SLI-03** - not from offer letter
- ⚠️ You can only start internship on or after SLI-03 start date
- ⚠️ Do NOT start before SLI-03 is issued
- ⚠️ If dates need to change, contact coordinator immediately

**Output Documents:**
- 📄 **SLI-03** (Official Letter to Company)
- 📄 **DLI-01** (Learning Agreement)

---

## 🏢 Phase 4: During Internship

### Step 7: Start Internship & Report for Duty

**Timing:** On official start date from SLI-03  
**Status Change:** `SLI_03_ISSUED` → `REPORTED`

#### Student Actions:

**First Day:**
1. Report to company on official start date
2. Bring printed documents:
   - SLI-03 (Official Letter)
   - DLI-01 (Learning Agreement)
   - Your resume/CV
   - IC copy

3. Meet with HR/Supervisor
4. Hand over SLI-03 and DLI-01
5. Complete company onboarding
6. Get company ID/access card

**First Week:**
1. Confirm supervisor contact details
2. Understand your responsibilities
3. Set up workspace and tools
4. Attend orientation/training

#### Supervisor Actions:
1. Receives secure link via email from PTMS
2. Confirms student reported for duty
3. Fills **BLI-04 Part 1** (Confirmation)
4. Provides initial feedback

#### System Actions:
- ✅ Records actual start date
- ✅ Status changes to `REPORTED`
- ✅ Starts tracking internship duration
- ✅ Schedules reminder notifications

---

### Step 8: During Internship (Weeks 1-14)

**Your Responsibilities:**

#### Weekly:
- [ ] Complete assigned tasks
- [ ] Log activities in logbook (if required)
- [ ] Communicate with supervisor
- [ ] Update progress

#### Mid-Internship (Week 7-8):
- [ ] Submit progress update (if required)
- [ ] Meet with supervisor for mid-term review
- [ ] Address any issues or concerns

#### Regular:
- [ ] Check PTMS for notifications
- [ ] Respond to coordinator emails
- [ ] Keep all documents organized
- [ ] Take photos of work (for portfolio)

#### If Issues Arise:
1. Talk to supervisor first
2. Contact coordinator if unresolved
3. Document all communications
4. Fill incident report if necessary

---

## ✅ Phase 5: Completion

### Step 9: Fill BLI-04 (Final Report & Evaluation)

**Location:** `/student/bli04`  
**Timing:** Week 14-16 (near end of internship)  
**Estimated Time:** 45-60 minutes  
**Status Change:** `REPORTED` → `COMPLETED`

#### What You Need:
- [ ] Completed internship (minimum 14 weeks)
- [ ] Supervisor availability for evaluation
- [ ] Summary of your work and achievements
- [ ] List of skills gained
- [ ] Reflection on challenges

---

#### Part 1: Student Section

**Step-by-Step:**

1. Navigate to `/student/bli04`
2. Fill **Section A: Student Information** (auto-filled)
   - Verify name, matric, program
   - Verify company and supervisor details

3. Fill **Section B: Internship Period**
   - Actual start date
   - Actual end date
   - Total weeks completed

4. Fill **Section C: Self-Assessment**
   
   **Overall Performance Rating:**
   - Excellent
   - Good
   - Satisfactory
   - Needs Improvement

5. Fill **Section D: Skills Assessment**
   
   **Technical Skills Gained:**
   - Programming languages learned
   - Tools and technologies used
   - Technical competencies developed
   - Projects completed
   
   Example:
   ```
   - Developed web applications using React and Node.js
   - Learned database design with PostgreSQL
   - Implemented REST APIs
   - Used Git for version control
   - Deployed applications on AWS
   ```

   **Soft Skills Developed:**
   - Communication skills
   - Teamwork and collaboration
   - Problem-solving abilities
   - Time management
   - Professional ethics
   
   Example:
   ```
   - Improved communication through daily stand-ups
   - Collaborated with 5-person development team
   - Learned to manage multiple tasks with deadlines
   - Developed professional email writing skills
   ```

6. Fill **Section E: Achievements**
   
   **Key Achievements:**
   - Major projects completed
   - Problems solved
   - Contributions to company
   - Recognition received
   
   Example:
   ```
   - Developed customer portal used by 500+ users
   - Reduced page load time by 40%
   - Fixed 25+ bugs in existing system
   - Received "Outstanding Intern" award
   ```

7. Fill **Section F: Challenges**
   
   **Challenges Faced:**
   - Technical difficulties
   - Learning curve
   - Workplace challenges
   - How you overcame them
   
   Example:
   ```
   - Initially struggled with React hooks concept
   - Overcame by studying documentation and asking senior developers
   - Learned to debug complex issues systematically
   ```

8. Fill **Section G: Recommendations**
   
   **Recommendations for Future Interns:**
   - Advice for students
   - What to prepare
   - Skills to learn beforehand
   
   Example:
   ```
   - Learn Git basics before starting
   - Practice coding daily
   - Don't be afraid to ask questions
   - Take initiative on projects
   ```

9. **Section H: Student Declaration**
   - [ ] Check: "I certify that the information provided is true and accurate"
   - [ ] Check: "I have completed the required internship duration"
   - [ ] Enter your full name as e-signature
   - [ ] Enter date signed

10. Click **"Save & Send to Supervisor"**

---

#### Part 2: Supervisor Section

**What Happens:**
1. Supervisor receives email with secure link
2. Supervisor reviews your self-assessment
3. Supervisor fills evaluation section

**Supervisor Evaluates:**

**Section I: Supervisor Evaluation**
- Work quality and accuracy
- Technical competency
- Initiative and creativity
- Reliability and punctuality
- Teamwork and communication
- Professional attitude

**Section J: Supervisor Comments**
- Overall performance feedback
- Strengths observed
- Areas for improvement
- Additional remarks

**Section K: Recommendation**
- Would recommend this student? (Yes/No)
- Would hire this student? (Yes/No)
- Overall rating: ⭐⭐⭐⭐⭐ (1-5 stars)

**Section L: Supervisor Declaration**
- Supervisor full name (e-signature)
- Supervisor position
- Date signed

---

#### What Happens Next:
- ✅ BLI-04 student section saved
- ✅ Email sent to supervisor with secure link
- ✅ Supervisor completes evaluation
- ✅ Both sections merged into final BLI-04
- ✅ Status changes to `COMPLETED`
- ✅ Completion certificate generated

#### Important Notes:
- ⚠️ Coordinate with supervisor before submitting
- ⚠️ Ensure supervisor has time to complete evaluation
- ⚠️ Be honest in self-assessment
- ⚠️ Provide specific examples, not generic statements

**Output:**
- 📄 **BLI-04** (Final Report with Student + Supervisor sections)

---

### Step 10: Final Verification & Completion

**Estimated Time:** 3-5 days  
**Status:** `COMPLETED` ✅

#### Coordinator Actions:
- ✓ Reviews BLI-04 final report
- ✓ Verifies supervisor evaluation
- ✓ Confirms all requirements met
- ✓ Issues completion certificate

#### What You Receive:
1. **Completion Certificate**
   - Official certificate from university
   - States internship duration
   - Signed by program head

2. **Final Documents Package**
   - All forms (BLI-01, BLI-02, BLI-03, BLI-04)
   - All letters (SLI-01, SLI-03, DLI-01)
   - Completion certificate
   - Supervisor evaluation

#### Final Steps:
1. Download completion certificate
2. Download final documents package
3. Submit to academic office (if required)
4. Keep copies for your portfolio
5. Update your resume with internship experience

#### Academic Records:
- ✅ Internship credits recorded in transcript
- ✅ Grade assigned (if applicable)
- ✅ Completion status updated
- ✅ Documents archived

---

## 🔄 Alternative Path: Offer Rejected/Withdrawn

### If Your Offer is Rejected or You Need to Withdraw

**Location:** `/student/sli04`

#### When to Use SLI-04:
- Company cancelled the offer
- Position no longer available
- You declined the offer
- Personal reasons for withdrawal

#### Step-by-Step:

1. Navigate to `/student/sli04`
2. Select your application
3. Choose rejection reason:
   - Company cancelled
   - Position no longer available
   - Student declined
   - Other (specify)

4. Fill additional details:
   - Explanation of situation
   - Date of rejection/withdrawal

5. Indicate re-application intent:
   - [ ] Yes, I intend to reapply
   - [ ] No, I will not reapply this semester

6. If reapplying:
   - New company name (if different)
   - Timeline: Immediate / Next semester / Next year

7. Student declaration and e-signature
8. Submit SLI-04

#### What Happens Next:
- ✅ Application status changes to `OFFER_REJECTED`
- ✅ Coordinator is notified
- ✅ You can start a new application
- ✅ Previous application is archived

---

## 📊 Status Flow Chart

```
┌─────────────────────────────────────────────────────────────┐
│                     STUDENT DOCUMENTATION FLOW               │
└─────────────────────────────────────────────────────────────┘

START
  │
  ├─→ Check Eligibility (≥113 credits)
  │        │
  │        ├─→ NOT ELIGIBLE → Wait / Complete courses
  │        │
  │        └─→ ELIGIBLE ✓
  │                │
  ├─→ STEP 1: Fill BLI-01
  │        │
  │        └─→ Status: DRAFT → SUBMITTED
  │                │
  │                └─→ SLI-01 Generated ✓
  │                        │
  ├─→ STEP 2: Upload BLI-02
  │        │
  │        └─→ Status: SUBMITTED → UNDER_REVIEW
  │                │
  ├─→ STEP 3: Coordinator Review
  │        │
  │        ├─→ REJECTED → Appeal / New Application
  │        │
  │        ├─→ CHANGES_REQUESTED → Fix Issues → Back to Review
  │        │
  │        └─→ APPROVED ✓
  │                │
  ├─→ STEP 4: Fill BLI-03 (Online + Hardcopy)
  │        │
  │        └─→ Status: APPROVED → UNDER_REVIEW
  │                │
  ├─→ STEP 5: Coordinator Approves BLI-03
  │        │
  │        └─→ Status: UNDER_REVIEW → APPROVED
  │                │
  ├─→ STEP 6: SLI-03 Issued
  │        │
  │        └─→ Status: APPROVED → SLI_03_ISSUED
  │                │
  │                ├─→ SLI-03 Generated ✓
  │                └─→ DLI-01 Generated ✓
  │                        │
  ├─→ STEP 7: Start Internship
  │        │
  │        └─→ Status: SLI_03_ISSUED → REPORTED
  │                │
  ├─→ STEP 8: During Internship (14-16 weeks)
  │        │
  ├─→ STEP 9: Fill BLI-04 (Student + Supervisor)
  │        │
  │        └─→ Status: REPORTED → COMPLETED ✓
  │                │
  └─→ STEP 10: Completion Certificate Issued
           │
           └─→ END ✅

ALTERNATIVE PATH:
  │
  └─→ Offer Rejected/Withdrawn
           │
           └─→ Fill SLI-04 → Status: OFFER_REJECTED
                    │
                    └─→ Start New Application
```

---

## ⏱️ Timeline Overview

### Complete Timeline: Start to Finish

| Week | Phase | Action | Status | Duration |
|------|-------|--------|--------|----------|
| **Week 1** | Pre-Application | Check eligibility | - | 1 day |
| **Week 1** | Application | Fill BLI-01 | DRAFT → SUBMITTED | 1 day |
| **Week 1** | Application | Upload BLI-02 | SUBMITTED → UNDER_REVIEW | 1 day |
| **Week 1-2** | Review | Wait for coordinator | UNDER_REVIEW | 3-7 days |
| **Week 2** | Application | Fill BLI-03 | APPROVED → UNDER_REVIEW | 1 day |
| **Week 2-3** | Review | Coordinator approves | UNDER_REVIEW → APPROVED | 2-3 days |
| **Week 3** | Issuance | SLI-03 issued | APPROVED → SLI_03_ISSUED | 1-2 days |
| **Week 4** | Start | Begin internship | SLI_03_ISSUED → REPORTED | 1 day |
| **Week 4-17** | Internship | Work at company | REPORTED | 14-16 weeks |
| **Week 17-18** | Completion | Fill BLI-04 | REPORTED → COMPLETED | 1 week |
| **Week 18-19** | Verification | Final check | COMPLETED | 3-5 days |
| **Week 19** | Done | Certificate issued | ✅ COMPLETED | - |

**Total Duration:** Approximately **4-5 months** (18-20 weeks)

---

### Critical Deadlines

#### Before Semester Starts:
- ⏰ **T-60 days:** Start looking for internship
- ⏰ **T-45 days:** Submit BLI-01 and BLI-02
- ⏰ **T-30 days:** Receive SLI-03
- ⏰ **T-14 days:** Confirm with company

#### During Semester:
- ⏰ **Week 1:** Start internship
- ⏰ **Week 7-8:** Mid-term progress update
- ⏰ **Week 14-16:** Submit BLI-04
- ⏰ **Week 17-18:** Receive completion certificate

#### Coordinator Review Times:
- BLI-01 & BLI-02: **3-7 business days**
- BLI-03: **2-3 business days**
- BLI-04: **3-5 business days**

---

## ❓ Troubleshooting & FAQ

### Common Issues & Solutions

#### 1. "I'm not eligible yet (< 113 credits)"

**Solution:**
- Complete more courses to reach 113 credits
- Check with coordinator for special cases
- Plan to apply next semester

---

#### 2. "Coordinator requested changes to my BLI-01"

**Solution:**
1. Read coordinator's comments carefully
2. Fix the specific issues mentioned
3. Resubmit the form
4. Wait for re-review (usually faster, 1-3 days)

**Common change requests:**
- Missing or incorrect phone numbers
- Incomplete addresses
- Date format issues
- Supervisor information incomplete

---

#### 3. "My offer letter doesn't have all required information"

**Solution:**
- Contact company HR for updated letter
- Request letter with:
  - Company letterhead
  - Clear start and end dates
  - Position title
  - Supervisor information
- Upload new BLI-02 with complete information

---

#### 4. "I can't upload BLI-02 - file too large"

**Solution:**
- Compress PDF using online tools (e.g., ilovepdf.com)
- Reduce image quality if JPG/PNG
- Split multi-page PDF if necessary
- Maximum size: 10MB

---

#### 5. "I made a mistake in BLI-01 after submission"

**Solution:**
- **Before SLI-03 issued:** Contact coordinator to request edit
- **After SLI-03 issued:** Cannot change dates - must follow SLI-03
- Minor errors: Coordinator may fix directly
- Major errors: May need to resubmit

---

#### 6. "Company changed my start date after SLI-03 was issued"

**Solution:**
1. Contact coordinator immediately
2. Provide new dates from company
3. Coordinator will issue revised SLI-03
4. Do NOT start on new date until revised SLI-03 is issued

---

#### 7. "Supervisor hasn't completed BLI-04 evaluation"

**Solution:**
1. Remind supervisor via email
2. Provide the secure link again
3. Explain deadline importance
4. Contact coordinator if supervisor unresponsive
5. Coordinator can send official reminder

---

#### 8. "I need to withdraw from internship"

**Solution:**
1. Inform supervisor and company
2. Inform coordinator immediately
3. Fill SLI-04 (Withdrawal Form)
4. Explain reason for withdrawal
5. Indicate if you plan to reapply

---

#### 9. "System won't let me submit - validation errors"

**Solution:**
- Read error messages carefully
- Check all required fields are filled
- Verify date formats (DD/MM/YYYY)
- Verify phone formats (012-3456789)
- Verify email formats (name@example.com)
- Clear browser cache and try again

---

#### 10. "I can't find my documents after submission"

**Solution:**
1. Go to Student Dashboard
2. Check "My Documents" section
3. Check "Applications" page
4. Look for download buttons
5. Check email for document links
6. Contact coordinator if still missing

---

### Contact Information

#### For Technical Issues:
- **PTMS Support:** ptms-support@university.edu.my
- **IT Helpdesk:** ithelpdesk@university.edu.my

#### For Application Issues:
- **Coordinator:** coordinator@university.edu.my
- **Program Head:** programhead@university.edu.my

#### Office Hours:
- **Monday - Friday:** 9:00 AM - 5:00 PM
- **Response Time:** 1-2 business days

---

## ✅ Checklist: Complete Documentation

Use this checklist to track your progress:

### Pre-Application
- [ ] Check eligibility (≥113 credits)
- [ ] Secure internship offer
- [ ] Prepare all required information

### Application Phase
- [ ] Fill BLI-01 form
- [ ] Download SLI-01
- [ ] Upload BLI-02 (offer letter)
- [ ] Wait for coordinator approval
- [ ] Fill BLI-03 online form
- [ ] Print and sign BLI-03
- [ ] Upload BLI-03 hardcopy

### Issuance Phase
- [ ] Receive SLI-03 notification
- [ ] Download SLI-03
- [ ] Download DLI-01
- [ ] Print documents (2 copies each)

### Internship Phase
- [ ] Start internship on official date
- [ ] Give SLI-03 and DLI-01 to company
- [ ] Confirm supervisor received documents
- [ ] Complete assigned tasks
- [ ] Log activities regularly

### Completion Phase
- [ ] Fill BLI-04 student section
- [ ] Supervisor completes evaluation
- [ ] Download completion certificate
- [ ] Submit to academic office
- [ ] Update transcript

---

## 📚 Additional Resources

### Document Templates
- [BLI-01 Sample](link) - Example filled form
- [BLI-03 Sample](link) - Example progress report
- [BLI-04 Sample](link) - Example final report

### Video Tutorials
- [How to Fill BLI-01](link) - 10 minutes
- [How to Upload BLI-02](link) - 5 minutes
- [How to Complete BLI-03](link) - 15 minutes
- [How to Fill BLI-04](link) - 20 minutes

### Guides
- [File Naming Convention Guide](link)
- [Document Requirements Guide](link)
- [Supervisor Communication Guide](link)

---

## 🎓 Tips for Success

### Before Starting:
1. ✅ Read this guide completely
2. ✅ Prepare all information in advance
3. ✅ Double-check dates and contact information
4. ✅ Keep copies of all documents

### During Application:
1. ✅ Fill forms carefully and accurately
2. ✅ Use proper file naming conventions
3. ✅ Review before submitting
4. ✅ Respond quickly to coordinator feedback

### During Internship:
1. ✅ Be professional and punctual
2. ✅ Communicate regularly with supervisor
3. ✅ Document your work and achievements
4. ✅ Ask questions when unsure

### For Completion:
1. ✅ Start BLI-04 early (Week 14)
2. ✅ Coordinate with supervisor in advance
3. ✅ Be specific in self-assessment
4. ✅ Keep all documents organized

---

## 📞 Need Help?

If you have questions or issues not covered in this guide:

1. **Check FAQ section** above
2. **Email coordinator** with specific question
3. **Visit coordinator office** during office hours
4. **Check PTMS announcements** for updates

**Remember:** Start early, communicate clearly, and keep all documents organized!

---

**Document Version:** 1.0  
**Last Updated:** December 4, 2024  
**For:** PTMS Students - Practical Training Application

---

**Good luck with your internship! 🚀**
