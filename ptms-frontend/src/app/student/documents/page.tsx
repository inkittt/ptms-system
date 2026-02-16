"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  FileDown,
  ArrowRight,
  Lock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/auth";
import { useEffect, useState } from "react";
import { applicationsApi } from "@/lib/api/applications";
import Link from "next/link";

interface Document {
  id: string;
  type: string;
  fileUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

interface ApplicationInfo {
  id: string;
  status: string;
  user: {
    id: string;
    name: string;
    matricNo: string;
    program: string;
  };
  session: {
    id: string;
    name: string;
    year: number;
    semester: number;
  };
}

interface DocumentsData {
  application: ApplicationInfo;
  documents: Document[];
}

interface UnlockStatus {
  bli01: boolean;
  bli02: boolean;
  bli03: boolean;
  sli03: boolean;
  dli01: boolean;
  bli04: boolean;
}

interface UnlockData {
  unlockStatus: UnlockStatus;
  applicationStatus: string;
  bli03Approved: boolean;
}

export default function StudentDocumentsPage() {
  const { user } = useAuth();
  const [documentsData, setDocumentsData] = useState<DocumentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [unlockData, setUnlockData] = useState<UnlockData | null>(null);

  useEffect(() => {
    const fetchApplicationId = async () => {
      try {
        const response = await applicationsApi.getMyApplications();
        console.log("=== APPLICATIONS DEBUG ===");
        console.log("Full response:", response);
        console.log("Applications array:", response.applications);
        console.log("Applications count:", response.applications?.length || 0);
        
        if (response.applications && response.applications.length > 0) {
          console.log("Setting applicationId:", response.applications[0].id);
          setApplicationId(response.applications[0].id);
        } else {
          console.warn("No applications found in response");
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Failed to fetch application:", err);
        setError(err.message || "Failed to load application");
        setLoading(false);
      }
    };

    fetchApplicationId();
  }, []);

  useEffect(() => {
    if (!applicationId) return;

    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const token = authService.getAccessToken();
        if (!token) {
          setError("No authentication token found");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/documents`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }

        const data = await response.json();
        console.log("Documents data:", data);
        // Backend returns { documents: { application, documents } }
        setDocumentsData(data.documents || data);
      } catch (err: any) {
        console.error("Failed to fetch documents:", err);
        setError(err.message || "Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

    const fetchUnlockStatus = async () => {
      try {
        const token = authService.getAccessToken();
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/unlock-status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Unlock status:", data);
          setUnlockData(data);
        }
      } catch (err: any) {
        console.error("Failed to fetch unlock status:", err);
      }
    };

    fetchDocuments();
    fetchUnlockStatus();
  }, [applicationId]);

  const handleDownloadPDF = async (pdfType: string) => {
    if (!applicationId) {
      alert("No application found");
      return;
    }

    // BLI-01 is always unlocked when application exists
    if (pdfType !== 'bli01') {
      // Check if document is unlocked
      const docKey = pdfType.toLowerCase() as keyof UnlockStatus;
      if (unlockData && !unlockData.unlockStatus[docKey]) {
        alert(`This document is locked. Complete previous steps to unlock it.`);
        return;
      }
    }

    // BLI-02 is an uploaded document, not a generated PDF
    if (pdfType === 'bli02') {
      if (!documentsData) return;
      const bli02Doc = documentsData.documents.find(doc => doc.type === 'BLI_02');
      if (bli02Doc) {
        await handleDownloadDocument(bli02Doc);
      } else {
        alert('BLI-02 document not found');
      }
      return;
    }

    try {
      const token = authService.getAccessToken();
      if (!token) {
        alert("No authentication token found");
        return;
      }

      // Convert pdfType to hyphenated format for API (bli01 -> bli-01)
      const formattedPdfType = pdfType.replace(/([a-z]+)(\d+)/, '$1-$2');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/${formattedPdfType}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate ${pdfType.toUpperCase()} PDF`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pdfType.toUpperCase()}-${applicationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log(`${pdfType.toUpperCase()} PDF downloaded successfully`);
    } catch (err: any) {
      console.error(`Failed to download ${pdfType} PDF:`, err);
      alert(err.message || `Failed to download ${pdfType.toUpperCase()} PDF`);
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        alert("No authentication token found");
        return;
      }

      if (!applicationId) {
        alert("No application found");
        return;
      }

      // Use the proper backend endpoint for downloading student documents
      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/documents/${doc.id}/download`;

      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download document");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.type}-${doc.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log("Document downloaded successfully");
    } catch (err: any) {
      console.error("Failed to download document:", err);
      alert(err.message || "Failed to download document");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SIGNED":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "PENDING_SIGNATURE":
      case "DRAFT":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "SIGNED":
        return "Signed";
      case "PENDING_SIGNATURE":
        return "Pending Signature";
      case "DRAFT":
        return "Draft";
      case "REJECTED":
        return "Rejected";
      default:
        return status;
    }
  };

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, "-");
  };

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </main>
    );
  }

  if (error || !documentsData) {
    return (
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
        </div>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900 mb-1">No Application Found</p>
                  <p className="text-sm text-yellow-800 mb-3">
                    You need to create an application first before accessing documents. 
                    Please go to the Applications page to start your BLI-01 application.
                  </p>
                </div>
              </div>
              <div>
                <Link href="/student/applications">
                  <Button className="bg-yellow-600 hover:bg-yellow-700">
                    Go to Applications
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { application, documents } = documentsData;

  const lecturerUploadedDocs = documents.filter(
    (doc) => !["BLI_01", "BLI_02", "BLI_03", "SLI_03", "DLI_01", "BLI_04", "SLI_04"].includes(doc.type)
  );

  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
        <p className="text-gray-600">
          Download your generated PDFs and documents uploaded by lecturers
        </p>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Application Info */}
        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Student Name</p>
                <p className="font-medium text-gray-900">{application.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Matric No</p>
                <p className="font-medium text-gray-900">{application.user.matricNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Session</p>
                <p className="font-medium text-gray-900">
                  {application.session.name} ({application.session.year})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated PDFs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              Student Documents
            </CardTitle>
            <CardDescription>
              Download your stored PDFs from submitted and approved forms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* BLI-01 */}
              <div className="border rounded-lg p-4 transition-colors hover:border-blue-500">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">BLI-01</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Application for Industrial Training
                </p>
                <Button
                  onClick={() => handleDownloadPDF("bli01")}
                  className="w-full"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>

              {/* BLI-02 */}
              <div className={`border rounded-lg p-4 transition-colors ${
                unlockData?.unlockStatus.bli02 
                  ? "hover:border-blue-500" 
                  : "opacity-60 bg-gray-50"
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">BLI-02</h3>
                  </div>
                  {!unlockData?.unlockStatus.bli02 && (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Pending Signature
                </p>
                <Button
                  onClick={() => handleDownloadPDF("bli02")}
                  className="w-full"
                  size="sm"
                  disabled={!unlockData?.unlockStatus.bli02}
                >
                  {unlockData?.unlockStatus.bli02 ? (
                    <><Download className="h-4 w-4 mr-2" />Download PDF</>
                  ) : (
                    <><Lock className="h-4 w-4 mr-2" />Get approval to unlock</>
                  )}
                </Button>
              </div>

              {/* BLI-03 */}
              <div className={`border rounded-lg p-4 transition-colors ${
                unlockData?.unlockStatus.bli03 
                  ? "hover:border-blue-500" 
                  : "opacity-60 bg-gray-50"
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">BLI-03</h3>
                  </div>
                  {!unlockData?.unlockStatus.bli03 && (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Industrial Training Information
                </p>
                <Button
                  onClick={() => handleDownloadPDF("bli03")}
                  className="w-full"
                  size="sm"
                  disabled={!unlockData?.unlockStatus.bli03}
                >
                  {unlockData?.unlockStatus.bli03 ? (
                    <><Download className="h-4 w-4 mr-2" />Download PDF</>
                  ) : (
                    <><Lock className="h-4 w-4 mr-2" />Get BLI-01 approval</>
                  )}
                </Button>
              </div>

              {/* SLI-03 */}
              <div className={`border rounded-lg p-4 transition-colors ${
                unlockData?.unlockStatus.sli03 
                  ? "hover:border-blue-500" 
                  : "opacity-60 bg-gray-50"
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">SLI-03</h3>
                  </div>
                  {!unlockData?.unlockStatus.sli03 && (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Confirmation Letter to Student
                </p>
                <Button
                  onClick={() => handleDownloadPDF("sli03")}
                  className="w-full"
                  size="sm"
                  disabled={!unlockData?.unlockStatus.sli03}
                >
                  {unlockData?.unlockStatus.sli03 ? (
                    <><Download className="h-4 w-4 mr-2" />Download PDF</>
                  ) : (
                    <><Lock className="h-4 w-4 mr-2" />Get BLI-03 signature</>
                  )}
                </Button>
              </div>

              {/* DLI-01 */}
              <div className={`border rounded-lg p-4 transition-colors ${
                unlockData?.unlockStatus.dli01 
                  ? "hover:border-blue-500" 
                  : "opacity-60 bg-gray-50"
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">DLI-01</h3>
                  </div>
                  {!unlockData?.unlockStatus.dli01 && (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Industrial Training Letter
                </p>
                <Button
                  onClick={() => handleDownloadPDF("dli01")}
                  className="w-full"
                  size="sm"
                  disabled={!unlockData?.unlockStatus.dli01}
                >
                  {unlockData?.unlockStatus.dli01 ? (
                    <><Download className="h-4 w-4 mr-2" />Download PDF</>
                  ) : (
                    <><Lock className="h-4 w-4 mr-2" />Get BLI-03 signature</>
                  )}
                </Button>
              </div>

              {/* BLI-04 */}
              <div className={`border rounded-lg p-4 transition-colors ${
                unlockData?.unlockStatus.bli04 
                  ? "hover:border-blue-500" 
                  : "opacity-60 bg-gray-50"
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">BLI-04</h3>
                  </div>
                  {!unlockData?.unlockStatus.bli04 && (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Reporting Duty Confirmation
                </p>
                <Button
                  onClick={() => handleDownloadPDF("bli04")}
                  className="w-full"
                  size="sm"
                  disabled={!unlockData?.unlockStatus.bli04}
                >
                  {unlockData?.unlockStatus.bli04 ? (
                    <><Download className="h-4 w-4 mr-2" />Download PDF</>
                  ) : (
                    <><Lock className="h-4 w-4 mr-2" />Get BLI-03 signature</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lecturer Uploaded Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Lecturer Uploaded Documents
            </CardTitle>
            <CardDescription>
              Documents uploaded by your lecturers or coordinators
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lecturerUploadedDocs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No documents uploaded yet</p>
                <p className="text-sm text-gray-500">
                  Documents uploaded by lecturers will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lecturerUploadedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(doc.status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDocumentType(doc.type)}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{getStatusText(doc.status)}</span>
                          <span>•</span>
                          <span>Version {doc.version}</span>
                          <span>•</span>
                          <span>
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownloadDocument(doc)}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 mb-1">Document Information</p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>PDFs are stored after submission and approval</li>
                  <li>Download the same approved PDF version anytime you need it</li>
                  <li>Lecturer-uploaded documents will appear in the second section</li>
                  <li>Keep copies of all important documents for your records</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
