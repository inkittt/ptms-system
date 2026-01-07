"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import SessionProtectedRoute from "@/components/SessionProtectedRoute";
import { applicationsApi } from "@/lib/api/applications";
import { documentsApi } from "@/lib/api/documents";
import {
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  ArrowRight,
  Download,
  Clock,
  Eye,
  AlertTriangle,
  Upload,
  Calendar,
  UserCheck,
  Package,
  Lock,
  ChevronRight,
  Award,
  Building2,
  Info,
  Loader2,
  MessageSquare,
} from "lucide-react";

// Mock data - will be replaced with API calls
const mockStudent = {
  name: "Ahmad Bin Abdullah",
  matricNo: "2021234567",
  program: "CS251 - Bachelor of Computer Science (Hons.)",
  creditsEarned: 115,
  isEligible: true,
};

const mockApplication = {
  id: "app-001",
  status: "UNDER_REVIEW", // DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, SLI_03_ISSUED, REPORTED, COMPLETED, CHANGES_REQUESTED, OFFER_REJECTED, REJECTED
  createdAt: "2024-11-20T10:00:00Z",
  updatedAt: "2024-11-22T14:30:00Z",
  currentStep: 3,
  totalSteps: 10,
  company: "Tech Solutions Sdn Bhd",
  startDate: "2025-01-15",
  endDate: "2025-04-15",
  agreedBeyond14Weeks: false,
  hasChangesRequested: false,
  changesComments: "",
  isOfferRejected: false,
  sli03Issued: false,
  bli04Submitted: false,
};

// Workflow steps data
const workflowSteps = [
  {
    id: 1,
    title: "Fill BLI-01",
    description: "Student Application Form",
    icon: FileText,
    status: "completed",
    link: "/student/bli01",
    duration: "15-20 mins",
    output: "SLI-01 generated",
  },
  {
    id: 2,
    title: "Upload BLI-02",
    description: "Offer Letter / Acceptance Letter",
    icon: Upload,
    status: "completed",
    link: "/student/bli02",
    duration: "10 mins",
    output: "Document uploaded",
  },
  {
    id: 3,
    title: "Coordinator Review",
    description: "Wait for approval",
    icon: Clock,
    status: "in_progress",
    link: null,
    duration: "3-7 days",
    output: "Application approved",
  },
  {
    id: 4,
    title: "Fill BLI-03 Online Form",
    description: "Submit Company Details & Progress Report",
    icon: FileText,
    status: "locked",
    link: "/student/bli03",
    duration: "30-40 mins",
    output: "BLI-03 online form submitted",
  },
  {
    id: 5,
    title: "Upload BLI-03 Hardcopy",
    description: "Print, sign, scan and upload BLI-03",
    icon: Upload,
    status: "locked",
    link: "/student/bli03",
    duration: "1-2 days",
    output: "Signed hardcopy uploaded",
  },
  {
    id: 6,
    title: "BLI-03 Approval",
    description: "Coordinator reviews BLI-03",
    icon: Clock,
    status: "locked",
    link: null,
    duration: "2-3 days",
    output: "BLI-03 approved",
  },
  {
    id: 7,
    title: "Download SLI-03 + DLI-01",
    description: "Official Internship Letter Package",
    icon: Download,
    status: "locked",
    link: null,
    duration: "5 mins",
    output: "Documents downloaded",
  },
  {
    id: 8,
    title: "BLI-04 Submission",
    description: "Submit after reporting duty (e-sign support)",
    icon: UserCheck,
    status: "locked",
    link: "/student/bli04",
    duration: "45-60 mins",
    output: "BLI-04 completed",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    case 'SLI_03_ISSUED':
    case 'REPORTED':
    case 'APPROVED': return 'bg-blue-100 text-blue-800';
    case 'UNDER_REVIEW':
    case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800';
    case 'CHANGES_REQUESTED': return 'bg-orange-100 text-orange-800';
    case 'OFFER_REJECTED':
    case 'REJECTED': return 'bg-red-100 text-red-800';
    case 'DRAFT': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function StudentApplicationsPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingSLI03, setIsDownloadingSLI03] = useState(false);
  const [isDownloadingDLI01, setIsDownloadingDLI01] = useState(false);
  const [bli01ApplicationId, setBli01ApplicationId] = useState<string | null>(null);
  const [documentStatus, setDocumentStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [reviewComments, setReviewComments] = useState<string | null>(null);
  const [hasBli01, setHasBli01] = useState(false);
  const [hasBli02, setHasBli02] = useState(false);
  const [hasBli03, setHasBli03] = useState(false);
  const [hasBli04, setHasBli04] = useState(false);
  const [bli03DocumentStatus, setBli03DocumentStatus] = useState<any>(null);
  const [bli03OnlineStatus, setBli03OnlineStatus] = useState<any>(null);
  const [bli03HardcopyStatus, setBli03HardcopyStatus] = useState<any>(null);
  const [bli04DocumentStatus, setBli04DocumentStatus] = useState<any>(null);
  
  // Calculate dynamic workflow steps based on actual data
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
    
    // Step 3: Coordinator Review (BLI-02) status
    if (!hasBli02) {
      steps[2].status = "locked";
    } else if (documentStatus?.status === 'SIGNED') {
      steps[2].status = "completed";
    } else {
      steps[2].status = "in_progress";
    }
    
    // Step 4: Fill BLI-03
    if (documentStatus?.status !== 'SIGNED') {
      steps[3].status = "locked";
    } else if (hasBli03) {
      steps[3].status = "completed";
    } else {
      steps[3].status = "in_progress";
    }
    
    // Step 5: Upload BLI-03 Hardcopy
    if (!hasBli03) {
      steps[4].status = "locked";
    } else if (bli03HardcopyStatus) {
      steps[4].status = "completed";
    } else {
      steps[4].status = "in_progress";
    }
    
    // Step 6: BLI-03 Approval (both online and hardcopy must be SIGNED)
    const bothBli03Approved = 
      bli03OnlineStatus?.status === 'SIGNED' && 
      bli03HardcopyStatus?.status === 'SIGNED';
    
    if (!bli03HardcopyStatus) {
      steps[5].status = "locked";
    } else if (bothBli03Approved) {
      steps[5].status = "completed";
    } else {
      steps[5].status = "in_progress";
    }
    
    // Step 7: Download SLI-03 + DLI-01 (unlocked when step 6 is completed)
    if (!bothBli03Approved) {
      steps[6].status = "locked";
    } else if (hasBli04) {
      steps[6].status = "completed";
    } else {
      steps[6].status = "in_progress";
    }
    
    // Step 8: BLI-04 Submission (unlocked when step 6 is completed, completed when BLI-04 is submitted)
    if (!bothBli03Approved) {
      steps[7].status = "locked";
    } else if (hasBli04) {
      steps[7].status = "completed";
    } else {
      steps[7].status = "in_progress";
    }
    
    // Steps 9+: Lock until step 8 is completed
    for (let i = 8; i < steps.length; i++) {
      if (hasBli04) {
        steps[i].status = "in_progress"; // Unlock next steps after BLI-04
        break; // Only unlock the next step
      } else {
        steps[i].status = "locked";
      }
    }
    
    return steps;
  };
  
  const dynamicWorkflowSteps = getWorkflowSteps();
  const completedSteps = dynamicWorkflowSteps.filter(s => s.status === "completed").length;
  const currentStep = completedSteps + 1;
  const progressPercentage = (currentStep / dynamicWorkflowSteps.length) * 100;

  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await applicationsApi.getMyApplications();
        const applications = response.applications;
        
        if (applications && applications.length > 0) {
          const existingApp = applications.find(app => 
            app.formResponses?.some((form: any) => form.formTypeEnum === 'BLI_01')
          );
          if (existingApp) {
            setBli01ApplicationId(existingApp.id);
            setHasBli01(true);
            
            // Check for BLI-02 document status
            const bli02Document = existingApp.documents?.find(
              (doc: any) => doc.type === 'BLI_02'
            );
            
            if (bli02Document) {
              setDocumentStatus(bli02Document);
              setHasBli02(true);
              
              // Fetch reviews if available
              if (existingApp.reviews && existingApp.reviews.length > 0) {
                const latestReview = existingApp.reviews[0];
                setReviewComments(latestReview.comments);
              }
            }
            
            // Check for BLI-03 submission
            const hasBli03Form = existingApp.formResponses?.some(
              (form: any) => form.formTypeEnum === 'BLI_03'
            );
            
            if (hasBli03Form) {
              setHasBli03(true);
              
              // Check for BLI-03 online form document
              const bli03OnlineDocument = existingApp.documents?.find(
                (doc: any) => doc.type === 'BLI_03'
              );
              
              // Check for BLI-03 hardcopy document
              const bli03HardcopyDocument = existingApp.documents?.find(
                (doc: any) => doc.type === 'BLI_03_HARDCOPY'
              );
              
              // Store individual statuses
              setBli03OnlineStatus(bli03OnlineDocument || null);
              setBli03HardcopyStatus(bli03HardcopyDocument || null);
              
              // BLI-03 is fully approved only when BOTH online and hardcopy are SIGNED
              if (bli03OnlineDocument && bli03HardcopyDocument) {
                const bothApproved = 
                  bli03OnlineDocument.status === 'SIGNED' && 
                  bli03HardcopyDocument.status === 'SIGNED';
                
                // Show the most recent document status (prioritize hardcopy if both exist)
                setBli03DocumentStatus(bli03HardcopyDocument);
                
                // If both are approved, mark as fully approved
                if (bothApproved) {
                  setBli03DocumentStatus({
                    ...bli03HardcopyDocument,
                    status: 'SIGNED',
                    fullyApproved: true
                  });
                }
              } else if (bli03OnlineDocument) {
                // Only online form submitted
                setBli03DocumentStatus(bli03OnlineDocument);
              }
            }
            
            // Check for BLI-04 submission
            const hasBli04Form = existingApp.formResponses?.some(
              (form: any) => form.formTypeEnum === 'BLI_04'
            );
            
            if (hasBli04Form) {
              setHasBli04(true);
              
              // Check for BLI-04 document status
              const bli04Document = existingApp.documents?.find(
                (doc: any) => doc.type === 'BLI_04'
              );
              
              if (bli04Document) {
                setBli04DocumentStatus(bli04Document);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading applications:', error);
      } finally {
        setIsLoadingStatus(false);
      }
    }

    loadApplications();
  }, []);

  const handleDownloadBLI01PDF = async () => {
    if (!bli01ApplicationId) {
      alert("No BLI-01 application found. Please submit the form first.");
      return;
    }

    setIsDownloading(true);
    try {
      const blob = await applicationsApi.downloadBLI01PDF(bli01ApplicationId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BLI-01-${bli01ApplicationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error downloading PDF:", error);
      alert(error.message || "Error downloading PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSLI03 = async () => {
    if (!bli01ApplicationId) {
      alert("No application found.");
      return;
    }

    setIsDownloadingSLI03(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/applications/${bli01ApplicationId}/sli03/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to generate SLI-03 PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SLI-03-${bli01ApplicationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading SLI-03:', error);
      alert('Failed to download SLI-03 PDF. Please try again.');
    } finally {
      setIsDownloadingSLI03(false);
    }
  };

  const handleDownloadDLI01 = async () => {
    if (!bli01ApplicationId) {
      alert("No application found.");
      return;
    }

    setIsDownloadingDLI01(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/applications/${bli01ApplicationId}/dli01/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to generate DLI-01 PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DLI-01-${bli01ApplicationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading DLI-01:', error);
      alert('Failed to download DLI-01 PDF. Please try again.');
    } finally {
      setIsDownloadingDLI01(false);
    }
  };

  return (
    <SessionProtectedRoute requireEligible={true}>
      <main className="flex-1 p-8 bg-gray-50">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Application Workflow</h1>
        <p className="text-gray-600">Complete step-by-step guide from BLI-01 to completion</p>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* BLI-02 Document Review Status Banner */}
        {!isLoadingStatus && documentStatus && (
          <Card className={`border-2 ${
            documentStatus.status === 'SIGNED' ? 'border-green-300 bg-green-50' :
            documentStatus.status === 'DRAFT' ? 'border-orange-300 bg-orange-50' :
            documentStatus.status === 'REJECTED' ? 'border-red-300 bg-red-50' :
            'border-blue-300 bg-blue-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  documentStatus.status === 'SIGNED' ? 'bg-green-100' :
                  documentStatus.status === 'DRAFT' ? 'bg-orange-100' :
                  documentStatus.status === 'REJECTED' ? 'bg-red-100' :
                  'bg-blue-100'
                }`}>
                  {documentStatus.status === 'SIGNED' ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : documentStatus.status === 'DRAFT' ? (
                    <MessageSquare className="h-6 w-6 text-orange-600" />
                  ) : documentStatus.status === 'REJECTED' ? (
                    <XCircle className="h-6 w-6 text-red-600" />
                  ) : (
                    <Clock className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg mb-1 ${
                    documentStatus.status === 'SIGNED' ? 'text-green-900' :
                    documentStatus.status === 'DRAFT' ? 'text-orange-900' :
                    documentStatus.status === 'REJECTED' ? 'text-red-900' :
                    'text-blue-900'
                  }`}>
                    {documentStatus.status === 'SIGNED' ? '✓ BLI-02 Approved!' :
                     documentStatus.status === 'DRAFT' ? '⚠ BLI-02 Changes Requested' :
                     documentStatus.status === 'REJECTED' ? '✗ BLI-02 Rejected' :
                     '⏳ BLI-02 Under Review'}
                  </h3>
                  <p className={`text-sm mb-2 ${
                    documentStatus.status === 'SIGNED' ? 'text-green-700' :
                    documentStatus.status === 'DRAFT' ? 'text-orange-700' :
                    documentStatus.status === 'REJECTED' ? 'text-red-700' :
                    'text-blue-700'
                  }`}>
                    {documentStatus.status === 'SIGNED' ? 'Your BLI-02 document has been approved by the coordinator. You can proceed to the next step.' :
                     documentStatus.status === 'DRAFT' ? 'The coordinator has requested changes to your BLI-02 document. Please review the comments and re-upload.' :
                     documentStatus.status === 'REJECTED' ? 'Your BLI-02 document has been rejected. Please contact your coordinator for guidance.' :
                     'Your BLI-02 document is currently being reviewed by the coordinator. This typically takes 3-7 days.'}
                  </p>
                  {reviewComments && (documentStatus.status === 'DRAFT' || documentStatus.status === 'REJECTED') && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                      <p className="font-semibold mb-1">Coordinator's Comments:</p>
                      <p className="italic">"{reviewComments}"</p>
                    </div>
                  )}
                  {documentStatus.status === 'DRAFT' && (
                    <div className="mt-3">
                      <Link href="/student/bli02">
                        <Button size="sm" variant="default">
                          <Upload className="h-4 w-4 mr-2" />
                          Re-upload Document
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* BLI-03 Review Status Banner */}
        {!isLoadingStatus && bli03DocumentStatus && (
          <Card className={`border-2 ${
            bli03DocumentStatus.status === 'SIGNED' ? 'border-green-300 bg-green-50' :
            bli03DocumentStatus.status === 'DRAFT' ? 'border-orange-300 bg-orange-50' :
            bli03DocumentStatus.status === 'REJECTED' ? 'border-red-300 bg-red-50' :
            'border-blue-300 bg-blue-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  bli03DocumentStatus.status === 'SIGNED' ? 'bg-green-100' :
                  bli03DocumentStatus.status === 'DRAFT' ? 'bg-orange-100' :
                  bli03DocumentStatus.status === 'REJECTED' ? 'bg-red-100' :
                  'bg-blue-100'
                }`}>
                  {bli03DocumentStatus.status === 'SIGNED' ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : bli03DocumentStatus.status === 'DRAFT' ? (
                    <MessageSquare className="h-6 w-6 text-orange-600" />
                  ) : bli03DocumentStatus.status === 'REJECTED' ? (
                    <XCircle className="h-6 w-6 text-red-600" />
                  ) : (
                    <Clock className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg mb-1 ${
                    bli03DocumentStatus.status === 'SIGNED' ? 'text-green-900' :
                    bli03DocumentStatus.status === 'DRAFT' ? 'text-orange-900' :
                    bli03DocumentStatus.status === 'REJECTED' ? 'text-red-900' :
                    'text-blue-900'
                  }`}>
                    {bli03DocumentStatus.status === 'SIGNED' ? '✓ BLI-03 Approved!' :
                     bli03DocumentStatus.status === 'DRAFT' ? '⚠ BLI-03 Changes Requested' :
                     bli03DocumentStatus.status === 'REJECTED' ? '✗ BLI-03 Rejected' :
                     '⏳ BLI-03 Under Review'}
                  </h3>
                  <p className={`text-sm mb-2 ${
                    bli03DocumentStatus.status === 'SIGNED' ? 'text-green-700' :
                    bli03DocumentStatus.status === 'DRAFT' ? 'text-orange-700' :
                    bli03DocumentStatus.status === 'REJECTED' ? 'text-red-700' :
                    'text-blue-700'
                  }`}>
                    {bli03DocumentStatus.status === 'SIGNED' ? 'Your BLI-03 form has been approved by the coordinator. You can proceed to the next step.' :
                     bli03DocumentStatus.status === 'DRAFT' ? 'The coordinator has requested changes to your BLI-03 form. Please review the comments and re-submit.' :
                     bli03DocumentStatus.status === 'REJECTED' ? 'Your BLI-03 form has been rejected. Please contact your coordinator for guidance.' :
                     'Your BLI-03 form is currently being reviewed by the coordinator. This typically takes 2-3 days.'}
                  </p>
                  {bli03DocumentStatus.status === 'DRAFT' && (
                    <div className="mt-3 flex gap-2">
                      <Link href="/student/bli03">
                        <Button size="sm" variant="default">
                          <FileText className="h-4 w-4 mr-2" />
                          Re-submit BLI-03
                        </Button>
                      </Link>
                    </div>
                  )}
                  {(bli03DocumentStatus.status === 'SIGNED' || bli03DocumentStatus.status === 'PENDING_SIGNATURE') && (
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('accessToken');
                            const response = await fetch(`http://localhost:3000/api/applications/${bli01ApplicationId}/bli03/pdf`, {
                              headers: {
                                'Authorization': `Bearer ${token}`,
                              },
                            });
                            
                            if (!response.ok) throw new Error('Failed to generate PDF');
                            
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `BLI-03-${bli01ApplicationId}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                          } catch (error) {
                            console.error('Error downloading PDF:', error);
                            alert('Failed to download BLI-03 PDF. Please try again.');
                          }
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Download BLI-03 PDF
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Overall Progress Card */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl">Your Progress</CardTitle>
                <CardDescription className="text-base">
                  Step {currentStep} of {dynamicWorkflowSteps.length}
                  {hasBli01 && mockApplication.company && ` • ${mockApplication.company}`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
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
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {Math.round(progressPercentage)}% Complete
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed Steps</p>
                  <p className="text-2xl font-bold text-green-600">{completedSteps}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Step</p>
                  <p className="text-lg font-bold text-blue-600">
                    {dynamicWorkflowSteps[currentStep - 1]?.title || 'Get Started'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Remaining Steps</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dynamicWorkflowSteps.length - completedSteps}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Complete Workflow Timeline
            </CardTitle>
            <CardDescription>
              Follow these steps from start to finish. Click on unlocked steps to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dynamicWorkflowSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = step.status === "completed";
                const isInProgress = step.status === "in_progress";
                const isLocked = step.status === "locked";

                return (
                  <div key={step.id} className="flex items-start gap-4">
                    {/* Step Number & Connector */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                          isCompleted
                            ? "bg-green-100 border-green-500"
                            : isInProgress
                            ? "bg-blue-100 border-blue-500"
                            : "bg-gray-100 border-gray-300"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : isInProgress ? (
                          <Clock className="h-6 w-6 text-blue-600 animate-pulse" />
                        ) : (
                          <Lock className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      {index < dynamicWorkflowSteps.length - 1 && (
                        <div
                          className={`w-0.5 h-16 ${
                            isCompleted ? "bg-green-300" : "bg-gray-300"
                          }`}
                        />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 pb-8">
                      <div
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isCompleted
                            ? "bg-green-50 border-green-200"
                            : isInProgress
                            ? "bg-blue-50 border-blue-200 shadow-md"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`p-2 rounded-lg ${
                                isCompleted
                                  ? "bg-green-100"
                                  : isInProgress
                                  ? "bg-blue-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              <StepIcon
                                className={`h-5 w-5 ${
                                  isCompleted
                                    ? "text-green-600"
                                    : isInProgress
                                    ? "text-blue-600"
                                    : "text-gray-400"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900 mb-1">
                                Step {step.id}: {step.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-gray-500">
                                  <Clock className="h-4 w-4" />
                                  <span>{step.duration}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500">
                                  <ArrowRight className="h-4 w-4" />
                                  <span>{step.output}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={
                              isCompleted
                                ? "default"
                                : isInProgress
                                ? "secondary"
                                : "outline"
                            }
                            className={
                              isCompleted
                                ? "bg-green-600"
                                : isInProgress
                                ? "bg-blue-600"
                                : ""
                            }
                          >
                            {isCompleted
                              ? "Completed"
                              : isInProgress
                              ? "In Progress"
                              : "Locked"}
                          </Badge>
                        </div>

                        {/* BLI-03 Approval Status Details (Step 6) */}
                        {step.id === 6 && hasBli03 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Review Status:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Online Form Status */}
                              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-gray-600">Online Form</p>
                                  <p className={`text-sm font-semibold ${
                                    bli03OnlineStatus?.status === 'SIGNED' ? 'text-green-600' :
                                    bli03OnlineStatus?.status === 'PENDING_SIGNATURE' ? 'text-blue-600' :
                                    bli03OnlineStatus?.status === 'DRAFT' ? 'text-orange-600' :
                                    'text-gray-600'
                                  }`}>
                                    {bli03OnlineStatus?.status === 'SIGNED' ? '✓ Approved' :
                                     bli03OnlineStatus?.status === 'PENDING_SIGNATURE' ? '⏳ Under Review' :
                                     bli03OnlineStatus?.status === 'DRAFT' ? '⚠ Changes Requested' :
                                     '○ Not Submitted'}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Hardcopy Status */}
                              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                <Upload className="h-4 w-4 text-purple-600" />
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-gray-600">Hardcopy Scan</p>
                                  <p className={`text-sm font-semibold ${
                                    bli03HardcopyStatus?.status === 'SIGNED' ? 'text-green-600' :
                                    bli03HardcopyStatus?.status === 'PENDING_SIGNATURE' ? 'text-blue-600' :
                                    bli03HardcopyStatus?.status === 'DRAFT' ? 'text-orange-600' :
                                    'text-gray-600'
                                  }`}>
                                    {bli03HardcopyStatus?.status === 'SIGNED' ? '✓ Approved' :
                                     bli03HardcopyStatus?.status === 'PENDING_SIGNATURE' ? '⏳ Under Review' :
                                     bli03HardcopyStatus?.status === 'DRAFT' ? '⚠ Changes Requested' :
                                     '○ Not Uploaded'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* BLI-04 Review Status Details (Step 8) */}
                        {step.id === 8 && hasBli04 && bli04DocumentStatus && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Review Status:</p>
                            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-600">BLI-04 Report for Duty</p>
                                <p className={`text-sm font-semibold ${
                                  bli04DocumentStatus?.status === 'SIGNED' ? 'text-green-600' :
                                  bli04DocumentStatus?.status === 'PENDING_SIGNATURE' ? 'text-blue-600' :
                                  bli04DocumentStatus?.status === 'DRAFT' ? 'text-orange-600' :
                                  bli04DocumentStatus?.status === 'REJECTED' ? 'text-red-600' :
                                  'text-gray-600'
                                }`}>
                                  {bli04DocumentStatus?.status === 'SIGNED' ? '✓ Approved' :
                                   bli04DocumentStatus?.status === 'PENDING_SIGNATURE' ? '⏳ Under Review' :
                                   bli04DocumentStatus?.status === 'DRAFT' ? '⚠ Changes Requested' :
                                   bli04DocumentStatus?.status === 'REJECTED' ? '✗ Rejected' :
                                   '○ Not Submitted'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        {step.link && !isLocked && (
                          <div className="flex flex-wrap gap-2">
                            <Link href={step.link}>
                              <Button
                                className="w-full md:w-auto"
                                variant={isInProgress ? "default" : "outline"}
                              >
                                {isCompleted ? "View Form" : "Continue"}
                                <ChevronRight className="h-4 w-4 ml-2" />
                              </Button>
                            </Link>
                            {step.id === 1 && isCompleted && bli01ApplicationId && (
                              <Button
                                onClick={handleDownloadBLI01PDF}
                                disabled={isDownloading}
                                variant="secondary"
                                className="w-full md:w-auto"
                              >
                                {isDownloading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Downloading...
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        )}

                        {isLocked && (
                          <Button disabled className="w-full md:w-auto" variant="outline">
                            <Lock className="h-4 w-4 mr-2" />
                            Complete previous steps first
                          </Button>
                        )}

                        {isInProgress && !step.link && step.id === 3 && (
                          <div className="space-y-3">
                            {isLoadingStatus ? (
                              <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 p-3 rounded-lg">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Checking review status...</span>
                              </div>
                            ) : !documentStatus ? (
                              <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-100 p-3 rounded-lg">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Please upload BLI-02 document first (Step 2)</span>
                              </div>
                            ) : documentStatus.status === 'PENDING_SIGNATURE' ? (
                              <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
                                <Clock className="h-4 w-4 animate-pulse" />
                                <span>Document submitted - Waiting for coordinator review...</span>
                              </div>
                            ) : documentStatus.status === 'SIGNED' ? (
                              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 p-3 rounded-lg">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Document approved! You can proceed to the next step.</span>
                              </div>
                            ) : documentStatus.status === 'DRAFT' ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-100 p-3 rounded-lg">
                                  <MessageSquare className="h-4 w-4" />
                                  <span>Coordinator requested changes</span>
                                </div>
                                {reviewComments && (
                                  <div className="text-sm text-gray-700 bg-white border border-orange-200 p-3 rounded-lg">
                                    <p className="font-semibold mb-1">Comments:</p>
                                    <p className="italic">{reviewComments}</p>
                                  </div>
                                )}
                                <Link href="/student/bli02">
                                  <Button variant="outline" className="w-full md:w-auto">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Re-upload Document
                                  </Button>
                                </Link>
                              </div>
                            ) : documentStatus.status === 'REJECTED' ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-100 p-3 rounded-lg">
                                  <XCircle className="h-4 w-4" />
                                  <span>Document rejected by coordinator</span>
                                </div>
                                {reviewComments && (
                                  <div className="text-sm text-gray-700 bg-white border border-red-200 p-3 rounded-lg">
                                    <p className="font-semibold mb-1">Reason:</p>
                                    <p className="italic">{reviewComments}</p>
                                  </div>
                                )}
                                <p className="text-sm text-gray-600">Please contact your coordinator for further guidance.</p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
                                <Clock className="h-4 w-4" />
                                <span>Waiting for coordinator review...</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Step 7: Download SLI-03 + DLI-01 */}
                        {step.id === 7 && (isInProgress || isCompleted) && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 p-3 rounded-lg">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>BLI-03 approved! You can now download your official internship documents.</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                onClick={handleDownloadSLI03}
                                disabled={isDownloadingSLI03}
                                variant="default"
                                className="w-full md:w-auto"
                              >
                                {isDownloadingSLI03 ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Downloading...
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download SLI-03
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={handleDownloadDLI01}
                                disabled={isDownloadingDLI01}
                                variant="secondary"
                                className="w-full md:w-auto"
                              >
                                {isDownloadingDLI01 ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Downloading...
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download DLI-01
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {isInProgress && !step.link && step.id !== 3 && step.id !== 7 && (
                          <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
                            <Clock className="h-4 w-4" />
                            <span>Waiting for coordinator review...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access to Forms</CardTitle>
            <CardDescription>Direct links to all application forms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/student/bli01">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full">
                  <FileText className="h-6 w-6" />
                  <span className="font-semibold">BLI-01</span>
                  <span className="text-xs opacity-70">Application Form</span>
                </Button>
              </Link>
              <Link href="/student/bli02">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full">
                  <Upload className="h-6 w-6" />
                  <span className="font-semibold">BLI-02</span>
                  <span className="text-xs opacity-70">Document Upload</span>
                </Button>
              </Link>
              <Link href="/student/bli03">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full">
                  <FileText className="h-6 w-6" />
                  <span className="font-semibold">BLI-03</span>
                  <span className="text-xs opacity-70">Progress Report</span>
                </Button>
              </Link>
              <Link href="/student/bli04">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full">
                  <UserCheck className="h-6 w-6" />
                  <span className="font-semibold">BLI-04</span>
                  <span className="text-xs opacity-70">Final Report</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Important Reminders */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertCircle className="h-5 w-5" />
              Important Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-yellow-900">
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Official dates are ONLY from SLI-03</strong> - Do not start internship
                  before SLI-03 is issued
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Coordinator review takes 3-7 days</strong> - Check your email regularly
                  for updates
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Keep all documents safe</strong> - Download and save copies of SLI-01,
                  SLI-03, and DLI-01
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Submit BLI-04 after reporting duty</strong> - Fill the form once you
                  have reported to your company
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Internships beyond 14 weeks require acknowledgment</strong> - Check the
                  box in BLI-01
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      </main>
    </SessionProtectedRoute>
  );
}
