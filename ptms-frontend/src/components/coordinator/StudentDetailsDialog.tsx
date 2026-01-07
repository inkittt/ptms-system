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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Building,
  Calendar,
  MapPin,
  Briefcase,
  Upload,
  Eye,
  Clock,
} from "lucide-react";
import { studentsApi, StudentDetails, DocumentSubmission, FormResponse } from "@/lib/api/students";

interface StudentDetailsDialogProps {
  studentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDetailsDialog({
  studentId,
  open,
  onOpenChange,
}: StudentDetailsDialogProps) {
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError("Failed to load student details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string; icon: any }> = {
      DRAFT: { variant: "outline", label: "Draft", icon: FileText },
      SUBMITTED: { variant: "warning", label: "Submitted", icon: AlertTriangle },
      UNDER_REVIEW: { variant: "warning", label: "Under Review", icon: AlertTriangle },
      APPROVED: { variant: "success", label: "Approved", icon: CheckCircle },
      REJECTED: { variant: "destructive", label: "Rejected", icon: XCircle },
      CANCELLED: { variant: "outline", label: "Cancelled", icon: XCircle },
    };

    const config = statusConfig[status] || { variant: "outline", label: status, icon: FileText };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      BLI_03_ONLINE: "BLI-03: Training Agreement (Online)",
      BLI_03_HARDCOPY: "BLI-03: Training Agreement (Hardcopy)",
      BLI_04: "BLI-04: Completion Report",
      SLI_01: "SLI-01: Supervisor Letter",
      SLI_03: "SLI-03: Training Certificate",
      SLI_04: "SLI-04: Evaluation Form",
      DLI_01: "DLI-01: Daily Log",
    };
    return formLabels[formType] || formType;
  };

  const getFormsByType = (documents: DocumentSubmission[], formResponses: FormResponse[]) => {
    const formTypes = ["BLI_01", "BLI_02", "BLI_03", "BLI_04", "SLI_01", "SLI_03", "SLI_04", "DLI_01"];
    const forms: Record<string, { documents: DocumentSubmission[]; formResponse: FormResponse | null }> = {};

    formTypes.forEach((type) => {
      if (type === "BLI_03") {
        // Separate BLI-03 into online and hardcopy
        const formResp = formResponses.find((form) => form.formTypeEnum === type) || null;
        
        // BLI-03 Online (form response)
        if (formResp) {
          forms["BLI_03_ONLINE"] = {
            documents: [],
            formResponse: formResp,
          };
        }
        
        // BLI-03 Hardcopy (document) - check for BLI_03_HARDCOPY type
        const hardcopyDocs = documents.filter((doc) => doc.type === "BLI_03_HARDCOPY");
        if (hardcopyDocs.length > 0) {
          forms["BLI_03_HARDCOPY"] = {
            documents: hardcopyDocs,
            formResponse: null,
          };
        }
      } else {
        const docs = documents.filter((doc) => doc.type === type);
        const formResp = formResponses.find((form) => form.formTypeEnum === type) || null;
        
        if (docs.length > 0 || formResp) {
          forms[type] = {
            documents: docs,
            formResponse: formResp,
          };
        }
      }
    });

    return forms;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Student Details</DialogTitle>
          <DialogDescription>
            View comprehensive student information and application history
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading student details...</p>
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

        {!loading && !error && studentDetails && (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Student & Company Details</TabsTrigger>
              <TabsTrigger value="applications">Application History</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-base font-semibold">{studentDetails.student.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Matric Number</label>
                    <p className="text-base font-semibold">{studentDetails.student.matricNo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-base">{studentDetails.student.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-base">{studentDetails.student.phone || "N/A"}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Program</label>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                      <p className="text-base">{studentDetails.student.program}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">CGPA</label>
                    <p className={`text-base font-semibold ${
                      studentDetails.student.cgpa >= 3.0
                        ? "text-green-600"
                        : studentDetails.student.cgpa >= 2.5
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}>
                      {studentDetails.student.cgpa.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Credits Earned</label>
                    <p className="text-base font-semibold">{studentDetails.student.creditsEarned}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Eligibility Status</label>
                    <div>
                      {studentDetails.student.isEligible ? (
                        <Badge variant="success" className="flex items-center gap-1 w-fit">
                          <CheckCircle className="h-3 w-3" />
                          Eligible
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <XCircle className="h-3 w-3" />
                          Ineligible
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {studentDetails.student.sessionInfo && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Current Session Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Session</label>
                        <p className="text-base">
                          {studentDetails.student.sessionInfo.year} / Semester{" "}
                          {studentDetails.student.sessionInfo.semester}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Session Status</label>
                        <p className="text-base capitalize">{studentDetails.student.sessionInfo.status}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Session Credits</label>
                        <p className="text-base">{studentDetails.student.sessionInfo.creditsEarned}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Min Credits Required</label>
                        <p className="text-base">{studentDetails.student.sessionInfo.minCredits}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company/Organization Information */}
            {studentDetails.applications.length > 0 && studentDetails.applications[0] && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Company/Organization Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {studentDetails.applications[0].company?.name || 
                         studentDetails.applications[0].organizationName || 
                         "Unknown Company"}
                      </h3>
                      {getStatusBadge(studentDetails.applications[0].status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Session: {studentDetails.applications[0].session.year} / Semester{" "}
                        {studentDetails.applications[0].session.semester}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studentDetails.applications[0].company && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Industry</label>
                          <p className="text-base">{studentDetails.applications[0].company.industry || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Company Contact Person</label>
                          <p className="text-base">{studentDetails.applications[0].company.contactName || "N/A"}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Organization Email</label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-base">
                          {studentDetails.applications[0].organizationEmail || 
                           studentDetails.applications[0].company?.contactEmail || 
                           "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Organization Phone</label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-base">
                          {studentDetails.applications[0].organizationPhone || 
                           studentDetails.applications[0].company?.contactPhone || 
                           "N/A"}
                        </p>
                      </div>
                    </div>
                    {studentDetails.applications[0].contactPersonName && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Contact Person</label>
                        <p className="text-base">{studentDetails.applications[0].contactPersonName}</p>
                      </div>
                    )}
                    {studentDetails.applications[0].contactPersonPhone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <p className="text-base">{studentDetails.applications[0].contactPersonPhone}</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Start Date</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-base">{formatDate(studentDetails.applications[0].startDate)}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">End Date</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-base">{formatDate(studentDetails.applications[0].endDate)}</p>
                      </div>
                    </div>
                  </div>

                  {studentDetails.applications[0].organizationAddress && (
                    <div className="mt-4 pt-4 border-t">
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-1 mb-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </label>
                      <p className="text-base">{studentDetails.applications[0].organizationAddress}</p>
                    </div>
                  )}

                  {studentDetails.applications[0].roleTasksSummary && (
                    <div className="mt-4 pt-4 border-t">
                      <label className="text-sm font-medium text-gray-500 mb-2 block">
                        Role & Tasks Summary
                      </label>
                      <p className="text-base">{studentDetails.applications[0].roleTasksSummary}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            </TabsContent>

            <TabsContent value="applications" className="space-y-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Applications History
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-600">
                        Total: <span className="font-semibold">{studentDetails.totalApplications}</span>
                      </span>
                      <span className="text-green-600">
                        Completed: <span className="font-semibold">{studentDetails.completedInternships}</span>
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                {studentDetails.applications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No applications found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentDetails.applications.map((app) => (
                      <Card key={app.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Building className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold text-lg">
                                  {app.company?.name || app.organizationName || "Unknown Company"}
                                </h4>
                                {getStatusBadge(app.status)}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Session: {app.session.year} / Semester {app.session.semester}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <span className="font-medium">Period:</span>
                                <span>{formatDate(app.startDate)} - {formatDate(app.endDate)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Form Submissions Section */}
                          {(app.documents.length > 0 || app.formResponses.length > 0) && (
                            <div className="mt-4 pt-4 border-t">
                              <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Form Submissions
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(getFormsByType(app.documents, app.formResponses)).map(
                                  ([formType, formData]) => {
                                    // For BLI-03 Online, find the corresponding document status
                                    let statusToDisplay = app.status;
                                    if (formType === "BLI_03_ONLINE") {
                                      const bli03Doc = app.documents.find(d => d.type === "BLI_03");
                                      if (bli03Doc) {
                                        // Use document status badge instead of application status
                                        return (
                                          <Card key={formType} className="bg-gray-50 border">
                                            <CardContent className="p-3">
                                              <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                  <h6 className="font-medium text-sm text-gray-900">
                                                    {getFormLabel(formType)}
                                                  </h6>
                                                </div>
                                                {getDocumentStatusBadge(bli03Doc.status)}
                                              </div>
                                              {formData.formResponse && (
                                                <div className="space-y-1">
                                                  <div className="flex items-center gap-2 text-xs">
                                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                                    <span className="text-gray-600">
                                                      Submitted: {formatDate(formData.formResponse.submittedAt)}
                                                    </span>
                                                  </div>
                                                  {formData.formResponse.verifiedBy && (
                                                    <div className="flex items-center gap-2 text-xs">
                                                      <CheckCircle className="h-3 w-3 text-blue-600" />
                                                      <span className="text-gray-600">Verified</span>
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                              {formData.documents.length > 0 && (
                                                <div className="space-y-1">
                                                  {formData.documents.map((doc) => (
                                                    <div
                                                      key={doc.id}
                                                      className="flex items-center justify-between text-xs"
                                                    >
                                                      <div className="flex items-center gap-2 flex-1">
                                                        <Upload className="h-3 w-3 text-gray-400" />
                                                        <span className="text-gray-600 truncate">
                                                          Document
                                                        </span>
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                        {getDocumentStatusBadge(doc.status)}
                                                        <a
                                                          href={doc.fileUrl}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="text-blue-600 hover:text-blue-800"
                                                        >
                                                          <Eye className="h-3 w-3" />
                                                        </a>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                              {!formData.formResponse && formData.documents.length === 0 && (
                                                <p className="text-xs text-gray-500 italic">No submission yet</p>
                                              )}
                                            </CardContent>
                                          </Card>
                                        );
                                      }
                                    }
                                    
                                    return (
                                    <Card key={formType} className="bg-gray-50 border">
                                      <CardContent className="p-3">
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex-1">
                                            <h6 className="font-medium text-sm text-gray-900">
                                              {getFormLabel(formType)}
                                            </h6>
                                          </div>
                                          {formData.formResponse && getStatusBadge(statusToDisplay)}
                                        </div>

                                        {/* Form Response Info */}
                                        {formData.formResponse && (
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs">
                                              <CheckCircle className="h-3 w-3 text-green-600" />
                                              <span className="text-gray-600">
                                                Submitted: {formatDate(formData.formResponse.submittedAt)}
                                              </span>
                                            </div>
                                            {formData.formResponse.verifiedBy && (
                                              <div className="flex items-center gap-2 text-xs">
                                                <CheckCircle className="h-3 w-3 text-blue-600" />
                                                <span className="text-gray-600">Verified</span>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Documents */}
                                        {formData.documents.length > 0 && (
                                          <div className="space-y-1">
                                            {formData.documents.map((doc) => (
                                              <div
                                                key={doc.id}
                                                className="flex items-center justify-between text-xs"
                                              >
                                                <div className="flex items-center gap-2 flex-1">
                                                  <Upload className="h-3 w-3 text-gray-400" />
                                                  <span className="text-gray-600 truncate">
                                                    Document
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  {getDocumentStatusBadge(doc.status)}
                                                  <a
                                                    href={doc.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800"
                                                  >
                                                    <Eye className="h-3 w-3" />
                                                  </a>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {!formData.formResponse && formData.documents.length === 0 && (
                                          <p className="text-xs text-gray-500 italic">No submission yet</p>
                                        )}
                                      </CardContent>
                                    </Card>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}

                          {/* Reviews Section */}
                          {app.reviews.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Reviews & Feedback
                              </h5>
                              <div className="space-y-2">
                                {app.reviews.map((review) => (
                                  <div
                                    key={review.id}
                                    className="bg-gray-50 rounded-lg p-3 border"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        {review.decision === "APPROVE" && (
                                          <Badge variant="success" className="text-xs">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Approved
                                          </Badge>
                                        )}
                                        {review.decision === "REQUEST_CHANGES" && (
                                          <Badge variant="warning" className="text-xs">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            Changes Requested
                                          </Badge>
                                        )}
                                        {review.decision === "REJECT" && (
                                          <Badge variant="destructive" className="text-xs">
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Rejected
                                          </Badge>
                                        )}
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {formatDate(review.decidedAt)}
                                      </span>
                                    </div>
                                    {review.reviewer && (
                                      <p className="text-xs text-gray-600 mb-1">
                                        Reviewer: {review.reviewer.name}
                                      </p>
                                    )}
                                    {review.comments && (
                                      <p className="text-xs text-gray-700 mt-2 italic">
                                        "{review.comments}"
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-3 pt-3 border-t flex justify-between text-xs text-gray-500">
                            <span>Created: {formatDate(app.createdAt)}</span>
                            <span>Updated: {formatDate(app.updatedAt)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
