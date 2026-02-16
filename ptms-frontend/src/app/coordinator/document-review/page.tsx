"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical,
  FileText,
  Upload,
  Calendar,
  Check,
  X,
  MessageSquare,
} from "lucide-react";
import { DocumentPreviewModal } from "@/components/DocumentPreviewModal";
import { documentsApi, PendingDocument } from "@/lib/api/documents";

// Mock data - will be replaced with API calls
const mockDocuments = [
  {
    id: "doc-001",
    student: {
      name: "Ahmad Bin Abdullah",
      matricNo: "2021234567",
      program: "CS251",
    },
    sessionId: "1",
    sessionYear: "2024",
    sessionSemester: "1",
    company: "Tech Solutions Sdn Bhd",
    documentType: "Training Application Form",
    status: "PENDING_REVIEW",
    submittedAt: "2024-11-20T10:00:00Z",
    daysWaiting: 5,
    fileSize: "2.3 MB",
    pages: 3,
  },
  {
    id: "doc-002",
    student: {
      name: "Siti Nurhaliza",
      matricNo: "2021234568",
      program: "CS251",
    },
    sessionId: "1",
    sessionYear: "2024",
    sessionSemester: "1",
    company: "Digital Innovations",
    documentType: "Company Acceptance Letter",
    status: "CHANGES_REQUESTED",
    submittedAt: "2024-11-18T14:30:00Z",
    daysWaiting: 7,
    fileSize: "1.8 MB",
    pages: 2,
  },
  {
    id: "doc-003",
    student: {
      name: "Muhammad Ali",
      matricNo: "2021234569",
      program: "CS251",
    },
    sessionId: "2",
    sessionYear: "2024",
    sessionSemester: "2",
    company: "Software House Malaysia",
    documentType: "Student Resume",
    status: "APPROVED",
    submittedAt: "2024-11-15T09:00:00Z",
    daysWaiting: 10,
    fileSize: "1.2 MB",
    pages: 1,
  },
  {
    id: "doc-004",
    student: {
      name: "Fatimah Zahra",
      matricNo: "2021234570",
      program: "CS252",
    },
    sessionId: "1",
    sessionYear: "2024",
    sessionSemester: "1",
    company: "Global Tech Corp",
    documentType: "Training Log Book",
    status: "OVERDUE",
    submittedAt: "2024-11-10T11:00:00Z",
    daysWaiting: 15,
    fileSize: "4.5 MB",
    pages: 25,
  },
];

export default function DocumentReviewPage() {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isBli03ModalOpen, setIsBli03ModalOpen] = useState(false);
  const [bli03FormData, setBli03FormData] = useState<any>(null);
  const [isBli04ModalOpen, setIsBli04ModalOpen] = useState(false);
  const [bli04FormData, setBli04FormData] = useState<any>(null);
  const [isBli02ModalOpen, setIsBli02ModalOpen] = useState(false);
  const [bli02Document, setBli02Document] = useState<PendingDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("all");
  const [documents, setDocuments] = useState<PendingDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isBulkApproving, setIsBulkApproving] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [sessionFilter, statusFilter, programFilter, documentTypeFilter]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (sessionFilter !== "all") filters.sessionId = sessionFilter;
      if (statusFilter !== "all") filters.status = statusFilter;
      if (programFilter !== "all") filters.program = programFilter;

      const response = await documentsApi.getPendingDocuments(filters);
      setDocuments(response.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string; icon: any }> = {
      PENDING_SIGNATURE: { variant: "warning", label: "Pending Review", icon: Clock },
      DRAFT: { variant: "destructive", label: "Changes Requested", icon: AlertTriangle },
      SIGNED: { variant: "success", label: "Approved", icon: CheckCircle },
      REJECTED: { variant: "destructive", label: "Rejected", icon: XCircle },
      CANCELLED: { variant: "outline", label: "Cancelled", icon: XCircle },
    };

    const config = statusConfig[status] || { variant: "outline", label: status, icon: Clock };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.application.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.application.user.matricNo.includes(searchTerm) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.application.company?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDocumentType = documentTypeFilter === "all" || doc.type === documentTypeFilter;

    return matchesSearch && matchesDocumentType;
  });

  const getTabCount = (status: string) => {
    if (status === "all") return documents.length;
    return documents.filter(doc => doc.status === status).length;
  };

  const handlePreview = (document: any) => {
    setSelectedDocument(document);
    setIsPreviewOpen(true);
  };

  const handleDownload = async (document: PendingDocument) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // BLI-02 is an uploaded document, others are generated PDFs
      const isUploadedDocument = document.type === 'BLI_02';
      
      let response;
      if (isUploadedDocument) {
        // Use the document download endpoint for uploaded files
        response = await fetch(
          `http://localhost:3000/api/applications/documents/${document.id}/download`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
      } else {
        // Use the PDF generation endpoint for generated documents
        const documentType = document.type.replace(/_/g, '-').toLowerCase();
        response = await fetch(
          `http://localhost:3000/api/applications/${document.application.id}/${documentType}/pdf`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
      }

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.type}-${document.application.user.name}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const handleViewBli03Form = async (applicationId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/applications/bli03/submissions/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch BLI-03 form data');
      }

      const data = await response.json();
      const submission = data.submission;
      const bli03Response = submission.formResponses?.find((fr: any) => fr.formTypeEnum === 'BLI_03');
      
      if (bli03Response) {
        setBli03FormData({
          ...submission,
          formData: bli03Response.payloadJSON,
          submittedAt: bli03Response.submittedAt,
          studentSignature: submission.studentSignature,
          studentSignatureType: submission.studentSignatureType,
          studentSignedAt: submission.studentSignedAt,
        });
        setIsBli03ModalOpen(true);
      } else {
        alert('BLI-03 form data not found');
      }
    } catch (error) {
      console.error('Error fetching BLI-03 form:', error);
      alert('Failed to load BLI-03 form data. Please try again.');
    }
  };

  const handleGenerateBli03PDF = async (applicationId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/applications/${applicationId}/bli-03/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate BLI-03 PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `BLI-03-${applicationId}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert('✅ BLI-03 PDF generated and downloaded successfully!');
    } catch (error) {
      console.error('Error generating BLI-03 PDF:', error);
      alert('❌ Failed to generate BLI-03 PDF. Please try again.');
    }
  };

  const handleViewBli04Form = async (applicationId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      // Use the BLI-03 submissions endpoint which coordinators have access to
      const response = await fetch(`http://localhost:3000/api/applications/bli03/submissions/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch application data');
      }

      const data = await response.json();
      const submission = data.submission;
      const bli04Response = submission.formResponses?.find((fr: any) => fr.formTypeEnum === 'BLI_04');
      
      console.log('BLI-04 Response:', bli04Response);
      console.log('BLI-04 PayloadJSON:', bli04Response?.payloadJSON);
      
      if (bli04Response) {
        const formDataToSet = {
          ...submission,
          formData: bli04Response.payloadJSON,
          submittedAt: bli04Response.submittedAt,
          supervisorSignature: bli04Response.supervisorSignature,
          supervisorSignatureType: bli04Response.supervisorSignatureType,
          supervisorSignedAt: bli04Response.supervisorSignedAt,
          supervisorName: bli04Response.supervisorName,
        };
        console.log('Setting BLI-04 Form Data:', formDataToSet);
        setBli04FormData(formDataToSet);
        setIsBli04ModalOpen(true);
      } else {
        alert('BLI-04 form data not found');
      }
    } catch (error) {
      console.error('Error fetching BLI-04 form:', error);
      alert('Failed to load BLI-04 form data. Please try again.');
    }
  };

  const handleViewBli02Form = (document: PendingDocument) => {
    setBli02Document(document);
    setIsBli02ModalOpen(true);
  };

  const handleApprove = async (documentId: string) => {
    try {
      await documentsApi.reviewDocument(documentId, {
        decision: 'APPROVE',
      });
      alert('Document approved successfully!');
      fetchDocuments();
    } catch (error) {
      console.error("Error approving document:", error);
      alert(`Error approving document: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  const handleRequestChanges = async (documentId: string) => {
    const comments = prompt('Please provide comments for the requested changes:');
    if (!comments) return;

    try {
      await documentsApi.reviewDocument(documentId, {
        decision: 'REQUEST_CHANGES',
        comments,
      });
      alert('Changes requested successfully!');
      fetchDocuments();
    } catch (error) {
      console.error("Error requesting changes:", error);
      alert(`Error requesting changes: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  const handleReject = async (documentId: string) => {
    const comments = prompt('Please provide a reason for rejection:');
    if (!comments) return;

    const confirmed = confirm('Are you sure you want to reject this document?');
    if (!confirmed) return;

    try {
      await documentsApi.reviewDocument(documentId, {
        decision: 'REJECT',
        comments,
      });
      alert('Document rejected successfully!');
      fetchDocuments();
    } catch (error) {
      console.error("Error rejecting document:", error);
      alert(`Error rejecting document: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  const toggleDocumentSelection = (documentId: string) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId);
    } else {
      newSelected.add(documentId);
    }
    setSelectedDocuments(newSelected);
  };

  const toggleSelectAll = () => {
    const approvableDocuments = filteredDocuments.filter(
      doc => doc.status === 'PENDING_SIGNATURE' || doc.status === 'DRAFT'
    );
    
    if (selectedDocuments.size === approvableDocuments.length && approvableDocuments.length > 0) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(approvableDocuments.map(doc => doc.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedDocuments.size === 0) {
      alert('Please select at least one document to approve.');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to approve ${selectedDocuments.size} document(s)?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    setIsBulkApproving(true);
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    try {
      for (const docId of Array.from(selectedDocuments)) {
        try {
          await documentsApi.reviewDocument(docId, {
            decision: 'APPROVE',
          });
          successCount++;
        } catch (error) {
          failCount++;
          errors.push(`Document ${docId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (successCount > 0) {
        alert(`✅ Successfully approved ${successCount} document(s).${failCount > 0 ? `\n❌ Failed to approve ${failCount} document(s).` : ''}`);
      } else {
        alert(`❌ Failed to approve all documents.\n\n${errors.join('\n')}`);
      }

      setSelectedDocuments(new Set());
      fetchDocuments();
    } catch (error) {
      console.error('Error in bulk approval:', error);
      alert('An unexpected error occurred during bulk approval.');
    } finally {
      setIsBulkApproving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Document Review</h1>
          <p className="text-sm text-gray-600">Review and manage student training documents</p>
        </div>
      </header>

      <main className="p-6">
        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by student name, matric number, document type, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={sessionFilter} onValueChange={setSessionFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="1">2024 Semester 1</SelectItem>
                <SelectItem value="2">2024 Semester 2</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                <SelectItem value="CHANGES_REQUESTED">Changes Requested</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                <SelectItem value="CS251">CS251</SelectItem>
                <SelectItem value="CS252">CS252</SelectItem>
              </SelectContent>
            </Select>
            <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="BLI_01">BLI-01</SelectItem>
                <SelectItem value="BLI_02">BLI-02</SelectItem>
                <SelectItem value="BLI_03">BLI-03</SelectItem>
                <SelectItem value="BLI_04">BLI-04</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {filteredDocuments.filter(doc => doc.status === 'PENDING_SIGNATURE' || doc.status === 'DRAFT').length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedDocuments.size > 0 &&
                      selectedDocuments.size === filteredDocuments.filter(doc => doc.status === 'PENDING_SIGNATURE' || doc.status === 'DRAFT').length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                    Select All ({filteredDocuments.filter(doc => doc.status === 'PENDING_SIGNATURE' || doc.status === 'DRAFT').length} approvable)
                  </Label>
                </div>
                {selectedDocuments.size > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedDocuments.size} selected
                  </Badge>
                )}
              </div>
              {selectedDocuments.size > 0 && (
                <Button
                  onClick={handleBulkApprove}
                  disabled={isBulkApproving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isBulkApproving ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Bulk Approve ({selectedDocuments.size})
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Document Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({getTabCount("all")})</TabsTrigger>
            <TabsTrigger value="PENDING_SIGNATURE">Pending ({getTabCount("PENDING_SIGNATURE")})</TabsTrigger>
            <TabsTrigger value="DRAFT">Changes ({getTabCount("DRAFT")})</TabsTrigger>
            <TabsTrigger value="SIGNED">Approved ({getTabCount("SIGNED")})</TabsTrigger>
            <TabsTrigger value="REJECTED">Rejected ({getTabCount("REJECTED")})</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No documents found</p>
            </div>
          ) : (
            <>
              <TabsContent value="all" className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    getStatusBadge={getStatusBadge}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                    onViewBli02Form={handleViewBli02Form}
                    onViewBli03Form={handleViewBli03Form}
                    onGenerateBli03PDF={handleGenerateBli03PDF}
                    onViewBli04Form={handleViewBli04Form}
                    onApprove={handleApprove}
                    onRequestChanges={handleRequestChanges}
                    onReject={handleReject}
                    isSelected={selectedDocuments.has(doc.id)}
                    onToggleSelect={toggleDocumentSelection}
                  />
                ))}
              </TabsContent>

              <TabsContent value="PENDING_SIGNATURE" className="space-y-4">
                {filteredDocuments.filter(doc => doc.status === "PENDING_SIGNATURE").map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    getStatusBadge={getStatusBadge}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                    onViewBli02Form={handleViewBli02Form}
                    onViewBli03Form={handleViewBli03Form}
                    onGenerateBli03PDF={handleGenerateBli03PDF}
                    onViewBli04Form={handleViewBli04Form}
                    onApprove={handleApprove}
                    onRequestChanges={handleRequestChanges}
                    onReject={handleReject}
                    isSelected={selectedDocuments.has(doc.id)}
                    onToggleSelect={toggleDocumentSelection}
                  />
                ))}
              </TabsContent>

              <TabsContent value="SIGNED" className="space-y-4">
                {filteredDocuments.filter(doc => doc.status === "SIGNED").map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    getStatusBadge={getStatusBadge}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                    onViewBli02Form={handleViewBli02Form}
                    onViewBli03Form={handleViewBli03Form}
                    onGenerateBli03PDF={handleGenerateBli03PDF}
                    onViewBli04Form={handleViewBli04Form}
                    onApprove={handleApprove}
                    onRequestChanges={handleRequestChanges}
                    onReject={handleReject}
                    isSelected={selectedDocuments.has(doc.id)}
                    onToggleSelect={toggleDocumentSelection}
                  />
                ))}
              </TabsContent>

              <TabsContent value="REJECTED" className="space-y-4">
                {filteredDocuments.filter(doc => doc.status === "REJECTED").map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    getStatusBadge={getStatusBadge}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                    onViewBli02Form={handleViewBli02Form}
                    onViewBli03Form={handleViewBli03Form}
                    onGenerateBli03PDF={handleGenerateBli03PDF}
                    onViewBli04Form={handleViewBli04Form}
                    onApprove={handleApprove}
                    onRequestChanges={handleRequestChanges}
                    onReject={handleReject}
                    isSelected={selectedDocuments.has(doc.id)}
                    onToggleSelect={toggleDocumentSelection}
                  />
                ))}
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={selectedDocument}
      />

      {/* BLI-03 Form Modal */}
      {isBli03ModalOpen && bli03FormData && (
        <BLI03FormModal
          isOpen={isBli03ModalOpen}
          onClose={() => setIsBli03ModalOpen(false)}
          formData={bli03FormData}
        />
      )}

      {/* BLI-04 Form Modal */}
      {isBli04ModalOpen && bli04FormData && (
        <BLI04FormModal
          isOpen={isBli04ModalOpen}
          onClose={() => setIsBli04ModalOpen(false)}
          formData={bli04FormData}
        />
      )}

      {/* BLI-02 Form Modal */}
      {isBli02ModalOpen && bli02Document && (
        <BLI02FormModal
          isOpen={isBli02ModalOpen}
          onClose={() => {
            setIsBli02ModalOpen(false);
            setBli02Document(null);
          }}
          document={bli02Document}
          onApprove={handleApprove}
          onRequestChanges={handleRequestChanges}
          onReject={handleReject}
          onDownload={handleDownload}
          fetchDocuments={fetchDocuments}
        />
      )}
    </div>
  );
}

// BLI-02 Form Modal Component
function BLI02FormModal({ 
  isOpen, 
  onClose, 
  document,
  onApprove,
  onRequestChanges,
  onReject,
  onDownload,
  fetchDocuments
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  document: PendingDocument;
  onApprove: (id: string) => void;
  onRequestChanges: (id: string) => void;
  onReject: (id: string) => void;
  onDownload: (doc: PendingDocument) => void;
  fetchDocuments: () => void;
}) {
  const [previewUrl, setPreviewUrl] = React.useState<string>("");
  const [isLoadingPreview, setIsLoadingPreview] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && document) {
      loadPreview();
    }
  }, [isOpen, document]);

  const loadPreview = async () => {
    setIsLoadingPreview(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:3000/api/applications/documents/${document.id}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load document preview');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Error loading preview:', error);
      alert('Failed to load document preview.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleApproveClick = async () => {
    await onApprove(document.id);
    onClose();
    fetchDocuments();
  };

  const handleRequestChangesClick = async () => {
    await onRequestChanges(document.id);
    onClose();
    fetchDocuments();
  };

  const handleRejectClick = async () => {
    await onReject(document.id);
    onClose();
    fetchDocuments();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">BLI-02: Company Acceptance Letter</h2>
            <p className="text-sm text-gray-600 mt-1">
              Student: {document.application.user.name} ({document.application.user.matricNo})
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Document Information */}
          <Card>
            <CardHeader>
              <CardTitle>Document Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Company</p>
                <p className="text-base">{document.application.company?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Program</p>
                <p className="text-base">{document.application.user.program}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Session</p>
                <p className="text-base">
                  {document.application.session.year} / Semester {document.application.session.semester}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Submitted Date</p>
                <p className="text-base">
                  {new Date(document.createdAt).toLocaleDateString('en-MY', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Document Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPreview ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading preview...</p>
                  </div>
                </div>
              ) : previewUrl ? (
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    src={previewUrl}
                    className="w-full h-[600px]"
                    title="Document Preview"
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Unable to load preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-between gap-3">
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
            <Button onClick={() => onDownload(document)} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          {document.status === "PENDING_SIGNATURE" && (
            <div className="flex gap-2">
              <Button 
                onClick={handleApproveClick} 
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button 
                onClick={handleRequestChangesClick} 
                variant="outline"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Changes
              </Button>
              <Button 
                onClick={handleRejectClick} 
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
          {document.status === "DRAFT" && (
            <Button 
              onClick={handleApproveClick} 
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve Changes
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// BLI-03 Form Modal Component
function BLI03FormModal({ isOpen, onClose, formData }: { isOpen: boolean; onClose: () => void; formData: any }) {
  const [signatureType, setSignatureType] = React.useState<"typed" | "drawn">("typed");
  const [typedSignature, setTypedSignature] = React.useState("");
  const [drawnSignature, setDrawnSignature] = React.useState("");
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [isApproving, setIsApproving] = React.useState(false);
  const [decision, setDecision] = React.useState<"APPROVE" | "REQUEST_CHANGES">("APPROVE");
  const [comments, setComments] = React.useState("");
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    // Pre-fill coordinator signature with their name
    async function loadProfile() {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:3000/api/applications/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setTypedSignature(data.profile.name || "");
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      if (canvas) {
        setDrawnSignature(canvas.toDataURL());
      }
      setIsDrawing(false);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawnSignature("");
  };

  const handleApprove = async () => {
    if (decision === 'REQUEST_CHANGES' && !comments.trim()) {
      alert('❌ Please provide comments when requesting changes.');
      return;
    }

    const confirmMessage = decision === 'APPROVE'
      ? '⚠️ Confirmation Required\n\nAre you ready to approve this BLI-03 form?\n\nThis will unlock BLI-03, SLI-03, and DLI-01 documents for the student.\n\nClick OK to approve, or Cancel to review.'
      : '⚠️ Confirmation Required\n\nAre you ready to request changes for this BLI-03 form?\n\nClick OK to send back for changes, or Cancel to review.';

    if (!window.confirm(confirmMessage)) return;

    setIsApproving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/applications/bli03/submissions/${formData.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          decision,
          comments: decision === 'REQUEST_CHANGES' ? comments : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process approval');
      }

      alert(`✅ BLI-03 submission ${decision === 'APPROVE' ? 'approved' : 'sent back for changes'} successfully!`);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error processing approval:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to process approval'}`);
    } finally {
      setIsApproving(false);
    }
  };

  if (!isOpen) return null;

  const data = formData.formData || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">BLI-03: Organization Selection Form</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle>A. Student Information (BUTIRAN PELAJAR)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-base">{formData.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Matric Number</p>
                <p className="text-base">{formData.user?.matricNo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Program</p>
                <p className="text-base">{formData.user?.program || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base">{data.studentEmail || formData.user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-base">{data.studentPhone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Internship Period</p>
                <p className="text-base">
                  {data.startDate ? new Date(data.startDate).toLocaleDateString('en-MY') : 'N/A'} - {data.endDate ? new Date(data.endDate).toLocaleDateString('en-MY') : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Organization Information */}
          <Card>
            <CardHeader>
              <CardTitle>B. Organization Selection (PEMILIHAN TEMPAT ORGANISASI)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Organization Name</p>
                <p className="text-base font-semibold">{data.organizationName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-base">{data.organizationAddress || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-base">{data.organizationPhone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fax</p>
                  <p className="text-base">{data.organizationFax || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base">{data.organizationEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact Person</p>
                  <p className="text-base">{data.contactPersonName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact Person Phone</p>
                  <p className="text-base">{data.contactPersonPhone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Reporting Period</p>
                  <Badge variant="secondary">{data.reportingPeriod || 'N/A'}</Badge>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Organization Declaration</p>
                <div className="flex items-center gap-2">
                  {data.organizationDeclaration ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-medium">Student Agreed</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-600 font-medium">Not Agreed</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Signature */}
          {formData.studentSignature && (
            <Card>
              <CardHeader>
                <CardTitle>Student Signature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Signature Type</p>
                  <Badge>
                    {formData.studentSignatureType === 'typed' 
                      ? 'Typed Signature' 
                      : formData.studentSignatureType === 'image'
                      ? 'Uploaded Image'
                      : 'Drawn Signature'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Signature</p>
                  {formData.studentSignatureType === 'typed' ? (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="font-serif text-3xl">{formData.studentSignature}</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 bg-white">
                      <img 
                        src={formData.studentSignature.startsWith('data:') 
                          ? formData.studentSignature 
                          : `data:image/png;base64,${formData.studentSignature}`
                        } 
                        alt="Student Signature" 
                        className="max-w-md" 
                      />
                    </div>
                  )}
                </div>
                {formData.studentSignedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Signed At</p>
                    <p className="text-base">
                      {new Date(formData.studentSignedAt).toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(formData.studentSignedAt).toLocaleTimeString('en-MY')}
                    </p>
                  </div>
                )}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-900 font-medium">Student Signed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coordinator Signature */}
          {formData.coordinatorSignature && (
            <Card>
              <CardHeader>
                <CardTitle>Coordinator Signature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Signature Type</p>
                  <Badge>{formData.coordinatorSignatureType === 'typed' ? 'Typed Signature' : 'Drawn Signature'}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Signature</p>
                  {formData.coordinatorSignatureType === 'typed' ? (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="font-serif text-3xl">{formData.coordinatorSignature}</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 bg-white">
                      <img src={formData.coordinatorSignature} alt="Coordinator Signature" className="max-w-md" />
                    </div>
                  )}
                </div>
                {formData.coordinatorSignedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Signed At</p>
                    <p className="text-base">
                      {new Date(formData.coordinatorSignedAt).toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(formData.coordinatorSignedAt).toLocaleTimeString('en-MY')}
                    </p>
                  </div>
                )}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-900 font-medium">Coordinator Approved & Signed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Info */}
          <div className="text-sm text-gray-500">
            <p><span className="font-medium">Submitted:</span> {formData.submittedAt ? new Date(formData.submittedAt).toLocaleString('en-MY') : 'N/A'}</p>
          </div>

          {/* Coordinator Approval Section */}
          {formData.studentSignature && !formData.coordinatorSignature && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle>Coordinator Approval</CardTitle>
                <CardDescription>
                  Review and approve the BLI-03 organization selection form
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Decision Selector */}
                <div>
                  <Label htmlFor="decision">Decision</Label>
                  <Tabs value={decision} onValueChange={(val) => setDecision(val as "APPROVE" | "REQUEST_CHANGES")} className="mt-2">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="APPROVE" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </TabsTrigger>
                      <TabsTrigger value="REQUEST_CHANGES" className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-900">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Request Changes
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Comments Field */}
                <div>
                  <Label htmlFor="comments">Comments {decision === 'REQUEST_CHANGES' && <span className="text-red-600">*</span>}</Label>
                  <Textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder={decision === 'APPROVE' ? "Add any comments or feedback (optional)..." : "Please provide comments for the requested changes..."}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> {decision === 'APPROVE' 
                      ? 'Approving this submission will unlock BLI-03, SLI-03, and DLI-01 documents for the student.'
                      : 'Requesting changes will require the student to resubmit the form.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
          <Button onClick={onClose} variant="outline">Close</Button>
          {formData.studentSignature && !formData.coordinatorSignature && (
            <Button 
              onClick={handleApprove} 
              disabled={isApproving}
              className={decision === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}
            >
              {isApproving ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {decision === 'APPROVE' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Request Changes
                    </>
                  )}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// BLI-04 Form Modal Component
function BLI04FormModal({ isOpen, onClose, formData }: { isOpen: boolean; onClose: () => void; formData: any }) {
  const [isApproving, setIsApproving] = React.useState(false);
  const [decision, setDecision] = React.useState<"APPROVE" | "REQUEST_CHANGES">("APPROVE");
  const [comments, setComments] = React.useState("");

  const handleApprove = async () => {
    if (decision === 'REQUEST_CHANGES' && !comments.trim()) {
      alert('❌ Please provide comments when requesting changes.');
      return;
    }

    const confirmMessage = decision === 'APPROVE'
      ? '⚠️ Confirmation Required\n\nAre you ready to approve this BLI-04 form?\n\nClick OK to approve, or Cancel to review.'
      : '⚠️ Confirmation Required\n\nAre you ready to request changes for this BLI-04 form?\n\nClick OK to send back for changes, or Cancel to review.';

    if (!window.confirm(confirmMessage)) return;

    setIsApproving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/applications/bli04/submissions/${formData.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          decision,
          comments: decision === 'REQUEST_CHANGES' ? comments : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify submission');
      }

      alert(`✅ BLI-04 submission ${decision === 'APPROVE' ? 'approved' : 'sent back for changes'} successfully!`);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error verifying submission:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to verify submission'}`);
    } finally {
      setIsApproving(false);
    }
  };

  if (!isOpen) return null;

  const data = formData.formData || {};
  const supervisorSignature = formData.supervisorSignature;
  const supervisorSignatureType = formData.supervisorSignatureType;
  const supervisorSignedAt = formData.supervisorSignedAt;
  const supervisorNameFromForm = formData.supervisorName;
  const isVerified = formData.verifiedBy || formData.isVerified;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">BLI-04: Report for Duty Form</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle>Student's Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-base">{data.studentName || formData.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Student ID</p>
                <p className="text-base">{data.studentId || formData.user?.matricNo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Program</p>
                <p className="text-base">{data.program || formData.user?.program || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Organisation Information */}
          <Card>
            <CardHeader>
              <CardTitle>Organisation Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Organisation Name</p>
                  <p className="text-base font-semibold">{data.organisationName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-base">{data.organisationAddress || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <p className="text-base">{data.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Supervisor Name</p>
                  <p className="text-base">{supervisorNameFromForm || data.supervisorName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Telephone</p>
                  <p className="text-base">{data.telephoneNo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fax</p>
                  <p className="text-base">{data.faxNo || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base">{data.email || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organisation Sector */}
          {data.organisationSector && data.organisationSector.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Organisation Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.organisationSector.map((sector: string, index: number) => (
                    <Badge key={index} variant="secondary">{sector}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Industry Code */}
          {data.industryCode && data.industryCode.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Industry Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.industryCode.map((code: string, index: number) => (
                    <Badge key={index} variant="secondary">{code}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reporting Details */}
          <Card>
            <CardHeader>
              <CardTitle>Reporting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Reporting Date</p>
                <p className="text-base font-semibold">
                  {data.reportingDate ? new Date(data.reportingDate).toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </p>
              </div>
              {supervisorSignedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Supervisor Signed At</p>
                  <p className="text-base">
                    {new Date(supervisorSignedAt).toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(supervisorSignedAt).toLocaleTimeString('en-MY')}
                  </p>
                </div>
              )}
              {supervisorSignedAt && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-900 font-medium">Supervisor Confirmed</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supervisor Signature */}
          {supervisorSignature && (
            <Card>
              <CardHeader>
                <CardTitle>Supervisor Signature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Signature Type</p>
                  <Badge>{supervisorSignatureType === 'typed' ? 'Typed Signature' : 'Drawn Signature'}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Signature</p>
                  {supervisorSignatureType === 'typed' ? (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="font-serif text-3xl text-center">{supervisorSignature}</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 bg-white">
                      <img src={supervisorSignature} alt="Supervisor Signature" className="max-w-md mx-auto" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Signed By</p>
                  <p className="text-base font-medium">{supervisorNameFromForm || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Info */}
          <div className="text-sm text-gray-500">
            <p><span className="font-medium">Submitted:</span> {formData.submittedAt ? new Date(formData.submittedAt).toLocaleString('en-MY') : 'N/A'}</p>
          </div>

          {/* Coordinator Approval Section */}
          {supervisorSignedAt && !isVerified && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle>Coordinator Verification</CardTitle>
                <CardDescription>
                  Review and verify the BLI-04 submission after supervisor confirmation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Decision Selector */}
                <div>
                  <Label htmlFor="decision">Decision</Label>
                  <Tabs value={decision} onValueChange={(val) => setDecision(val as "APPROVE" | "REQUEST_CHANGES")} className="mt-2">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="APPROVE" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </TabsTrigger>
                      <TabsTrigger value="REQUEST_CHANGES" className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-900">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Request Changes
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Comments Field */}
                <div>
                  <Label htmlFor="comments">Comments {decision === 'REQUEST_CHANGES' && <span className="text-red-600">*</span>}</Label>
                  <Textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder={decision === 'APPROVE' ? "Add any comments or feedback (optional)..." : "Please provide comments for the requested changes..."}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* Signature Section - Not needed for BLI04, just approval */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> {decision === 'APPROVE' 
                      ? 'Approving this submission will mark the student as having officially reported for duty. The student and supervisor will be notified.'
                      : 'Requesting changes will clear the supervisor signature and require the student to resubmit the form.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {isVerified && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">Verified by Coordinator</p>
                    <p className="text-sm text-green-700">
                      This submission has been verified and approved.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
          <Button onClick={onClose} variant="outline">Close</Button>
          {supervisorSignedAt && !isVerified && (
            <Button 
              onClick={handleApprove} 
              disabled={isApproving}
              className={decision === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}
            >
              {isApproving ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {decision === 'APPROVE' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Request Changes
                    </>
                  )}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Document Card Component
function DocumentCard({
  document,
  getStatusBadge,
  onPreview,
  onDownload,
  onViewBli02Form,
  onViewBli03Form,
  onGenerateBli03PDF,
  onViewBli04Form,
  onApprove,
  onRequestChanges,
  onReject,
  isSelected,
  onToggleSelect
}: {
  document: PendingDocument;
  getStatusBadge: (status: string) => JSX.Element;
  onPreview: (doc: PendingDocument) => void;
  onDownload: (doc: PendingDocument) => void;
  onViewBli02Form: (doc: PendingDocument) => void;
  onViewBli03Form: (applicationId: string) => void;
  onGenerateBli03PDF: (applicationId: string) => void;
  onViewBli04Form: (applicationId: string) => void;
  onApprove: (id: string) => void;
  onRequestChanges: (id: string) => void;
  onReject: (id: string) => void;
  isSelected: boolean;
  onToggleSelect: (documentId: string) => void;
}) {
  const daysWaiting = Math.floor(
    (new Date().getTime() - new Date(document.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const isApprovable = document.status === 'PENDING_SIGNATURE' || document.status === 'DRAFT';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4 items-start mb-4">
          {isApprovable && (
            <div className="flex items-center pt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(document.id)}
              />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">{document.type.replace(/_/g, '-')}</h3>
              {getStatusBadge(document.status)}
            </div>
            <div className="flex items-center gap-2 mb-3 text-sm">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <span className="font-medium text-indigo-700">
                Session: {document.application.session.year} / Semester {document.application.session.semester}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
              <div>
                <span className="font-medium">Student:</span> {document.application.user.name}
              </div>
              <div>
                <span className="font-medium">Matric No:</span> {document.application.user.matricNo}
              </div>
              <div>
                <span className="font-medium">Program:</span> {document.application.user.program}
              </div>
              <div>
                <span className="font-medium">Company:</span> {document.application.company?.name || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Submitted:</span>{" "}
                {new Date(document.createdAt).toLocaleDateString("en-MY")}
              </div>
              <div>
                <span className="font-medium">Waiting:</span>{" "}
                <span className={daysWaiting > 7 ? "text-red-600 font-semibold" : ""}>
                  {daysWaiting} days
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {document.type === 'BLI_04' ? (
            <>
              <Button size="sm" onClick={() => onViewBli04Form(document.application.id)}>
                <FileText className="h-4 w-4 mr-2" />
                View BLI-04 Form
              </Button>
              <Badge variant="outline" className="ml-2">
                Report for Duty
              </Badge>
            </>
          ) : document.type === 'BLI_03' ? (
            <>
              <Button size="sm" onClick={() => onViewBli03Form(document.application.id)}>
                <FileText className="h-4 w-4 mr-2" />
                View Form
              </Button>
              <Button size="sm" variant="outline" onClick={() => onGenerateBli03PDF(document.application.id)}>
                <Download className="h-4 w-4 mr-2" />
                Generate PDF
              </Button>
            </>
          ) : document.type === 'BLI_02' ? (
            <>
              <Button size="sm" onClick={() => onViewBli02Form(document)}>
                <FileText className="h-4 w-4 mr-2" />
                View BLI-02 Form
              </Button>
              <Badge variant="outline" className="ml-2">
                Acceptance Letter
              </Badge>
            </>
          ) : (
            <>
              <Button size="sm" onClick={() => onPreview(document)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDownload(document)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {document.status === "PENDING_SIGNATURE" && (
                <>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onApprove(document.id)}>
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onRequestChanges(document.id)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Request Changes
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onReject(document.id)}>
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
              {document.status === "DRAFT" && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onApprove(document.id)}>
                  <Check className="h-4 w-4 mr-2" />
                  Approve Changes
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
