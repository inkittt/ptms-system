"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  X,
  ArrowLeft,
  PackageOpen,
} from "lucide-react";
import { studentsApi, StudentDetails } from "@/lib/api/students";

interface StudentDocumentsDialogProps {
  studentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDocumentsDialog({
  studentId,
  open,
  onOpenChange,
}: StudentDocumentsDialogProps) {
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingPdf, setViewingPdf] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    if (open && studentId) {
      fetchStudentDetails();
    }
  }, [open, studentId]);

  const fetchStudentDetails = async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken");
      const data = await studentsApi.getStudentDetails(token || "", studentId);
      setStudentDetails(data);
    } catch (error) {
      console.error("Failed to fetch student details:", error);
      setError("Failed to load student documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDocumentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string; icon: any }> = {
      DRAFT: { variant: "outline", label: "Draft", icon: FileText },
      PENDING_SIGNATURE: { variant: "warning", label: "Pending Signature", icon: Clock },
      SIGNED: { variant: "success", label: "Signed", icon: CheckCircle },
      REJECTED: { variant: "destructive", label: "Rejected", icon: XCircle },
      CANCELLED: { variant: "outline", label: "Cancelled", icon: XCircle },
    };

    const config = statusConfig[status] || { variant: "outline", label: status, icon: FileText };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 text-xs">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getFormLabel = (formType: string) => {
    const formLabels: Record<string, string> = {
      BLI_01: "BLI-01: Application Form",
      BLI_02: "BLI-02: Acceptance Letter",
      BLI_03: "BLI-03: Training Agreement",
      BLI_03_HARDCOPY: "BLI-03: Training Agreement (Hardcopy)",
      BLI_04: "BLI-04: Completion Report",
      SLI_01: "SLI-01: Supervisor Letter",
      SLI_03: "SLI-03: Training Certificate",
      SLI_04: "SLI-04: Evaluation Form",
      DLI_01: "DLI-01: Daily Log",
    };
    return formLabels[formType] || formType;
  };

  const handleViewDocument = (fileUrl: string, documentType: string) => {
    setViewingPdf({
      url: fileUrl,
      title: getFormLabel(documentType),
    });
  };

  const handleCloseViewer = () => {
    setViewingPdf(null);
  };

  const handleDownloadDocument = async (fileUrl: string, documentType: string) => {
    try {
      // Fetch the file as a blob to force download
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      
      // Create object URL from blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${documentType}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download document:", error);
      alert("Failed to download document. Please try again.");
    }
  };

  const handleDownloadAll = async () => {
    if (!studentId) return;

    try {
      setDownloadingAll(true);
      const token = localStorage.getItem("accessToken");
      const blob = await studentsApi.downloadAllStudentDocuments(token || "", studentId);
      
      // Create object URL from blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      const studentName = studentDetails?.student?.name || "Student";
      const matricNo = studentDetails?.student?.matricNo || "";
      const sanitizedName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `${sanitizedName}_${matricNo}_Documents.zip`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download all documents:", error);
      alert("Failed to download all documents. Please try again.");
    } finally {
      setDownloadingAll(false);
    }
  };

  const getApprovedDocuments = () => {
    if (!studentDetails || !studentDetails.applications.length) return [];

    const approvedDocs: Array<{
      id: string;
      type: string;
      status: string;
      fileUrl: string;
      applicationId: string;
      companyName: string;
      sessionName: string;
    }> = [];

    studentDetails.applications.forEach((app) => {
      const companyName = app.company?.name || app.organizationName || "Unknown Company";
      const sessionName = `${app.session.year} / Semester ${app.session.semester}`;

      app.documents.forEach((doc) => {
        if (doc.status === "SIGNED" || doc.status === "APPROVED" || doc.status === "PENDING_SIGNATURE") {
          approvedDocs.push({
            id: doc.id,
            type: doc.type,
            status: doc.status,
            fileUrl: doc.fileUrl,
            applicationId: app.id,
            companyName,
            sessionName,
          });
        }
      });
    });

    return approvedDocs;
  };

  const approvedDocuments = getApprovedDocuments();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {viewingPdf && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseViewer}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {viewingPdf ? viewingPdf.title : "Student Documents"}
          </DialogTitle>
          <DialogDescription>
            {viewingPdf
              ? "Viewing document - Click the back arrow to return to the list"
              : "View and download approved documents for this student"}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading documents...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && studentDetails && !viewingPdf && (
          <div className="space-y-4">
            {approvedDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No approved documents found for this student</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <p className="text-sm text-blue-800">
                        Found {approvedDocuments.length} approved document(s)
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleDownloadAll}
                      disabled={downloadingAll}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <PackageOpen className="h-4 w-4 mr-2" />
                      {downloadingAll ? "Downloading..." : "Download All as ZIP"}
                    </Button>
                  </div>
                </div>

                {approvedDocuments.map((doc) => (
                  <Card key={doc.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-5 w-5 text-green-600" />
                            <h4 className="font-semibold text-gray-900">
                              {getFormLabel(doc.type)}
                            </h4>
                            {getDocumentStatusBadge(doc.status)}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <span className="font-medium">Company:</span> {doc.companyName}
                            </p>
                            <p>
                              <span className="font-medium">Session:</span> {doc.sessionName}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDocument(doc.fileUrl, doc.type)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownloadDocument(doc.fileUrl, doc.type)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && !error && viewingPdf && (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg" style={{ height: "70vh" }}>
              <iframe
                src={viewingPdf.url}
                className="w-full h-full rounded-lg"
                title={viewingPdf.title}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseViewer}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
              <Button onClick={() => handleDownloadDocument(viewingPdf.url, viewingPdf.title)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
