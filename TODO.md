# TODO: Improve Review Document Page User-Friendliness

## Step 1: Organize into Review Queues (Tabs/Sections)
- [x] Add tabs for "Pending Review", "Changes Requested", "Approved", "Overdue"
- [x] Add counters on tabs (e.g., "Pending Review (5)")
- [x] Sort by submission date, highlight overdue items

## Step 2: Inline Document Preview
- [ ] Create DocumentPreviewModal component
- [ ] Integrate PDF/image viewer (react-pdf)
- [ ] Add zoom, rotate, download options in preview

## Step 3: Streamlined Decision Workflow
- [x] Add "Approve", "Request Changes", "Reject" buttons
- [ ] Implement mandatory comment field for changes/rejections
- [ ] Add auto-notifications after decisions
- [ ] Add "Approve & Issue SLI-03" quick action

## Step 4: Enhanced Search and Filters
- [x] Expand filters: status, document type, student, program, date range
- [x] Add "Overdue" filter toggle
- [x] Make filters collapsible on mobile

## Step 5: Bulk Actions and Efficiency
- [ ] Add checkboxes for bulk selection
- [ ] Implement bulk approve, request changes, download ZIP
- [ ] Add keyboard shortcuts (Ctrl+A)

## Step 6: Mobile and Accessibility Improvements
- [ ] Ensure responsive design (vertical stack on mobile)
- [ ] Add ARIA labels and keyboard navigation
- [ ] High contrast mode and screen reader support

## Step 7: Additional Features
- [ ] Add progress indicators (e.g., "Step 3/5")
- [ ] Display comments history in timeline
- [ ] Implement auto-save for drafts
- [ ] Add in-page notifications panel

## Step 8: Performance and Feedback
- [ ] Lazy-load previews for performance
- [ ] Add loading states and success/error toasts
- [ ] Implement optimistic UI updates
