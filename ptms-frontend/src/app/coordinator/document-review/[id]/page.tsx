"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Building,
  Calendar,
  Clock,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";

// Mock data for the application
const mockApplication = {
  id: "app-001",
  student: {
    name: "Ahmad Bin Abdullah",
    matricNo: "2021234567",
    program: "CS251",
    email: "ahmad.abdullah@student.edu.my",
    phone: "+60 12-345 6789",
  },
  company: {
    name: "Tech Solutions Sdn Bhd",
    address: "123 Jalan Teknologi, Cyberjaya, Selangor",
    supervisor: "Dr. Sarah Johnson",
    supervisorEmail: "sarah.johnson@techsolutions.com.my",
  },
  status: "UNDER_REVIEW",
  submittedAt: "2024-11-20T10:00:00Z",
  trainingPeriod: {
    start: "2024-12-01",
    end: "2025-05-31",
  },
};

// Mock documents data
const mockDocuments = [
  {
    id: "doc-1",
    name: "Resume",
    type: "PDF",
    size: "2.3 MB",
    uploadedAt: "2024-11-20T10:00:00Z",
    status: "pending", // pending, approved, rejected
    comments: "",
  },
  {
    id: "doc-2",
    name: "Cover Letter",
    type: "PDF",
    size: "1.8 MB",
    uploadedAt: "2024-11-20T10:05:00Z",
    status: "pending",
    comments: "",
  },
  {
    id: "doc-3",
    name: "Academic Transcript",
    type: "PDF",
    size: "3.1 MB",
    uploadedAt: "2024-11-20T10:10:00Z",
    status: "pending",
    comments: "",
  },
  {
    id: "doc-4",
    name: "Company Acceptance Letter",
    type: "PDF",
    size: "1.5 MB",
    uploadedAt: "2024-11-20T10:15:00Z",
    status: "pending",
    comments: "",
  },
];

export default function DocumentReviewPage() {
  const params = useParams();
  const applicationId = params.id as string;

  const [documents, setDocuments] = useState(mockDocuments);
  const [overallComments, setOverallComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDocumentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: "outline", label: "Pending Review", icon: Clock },
      approved: { variant: "success", label: "Approved", icon: CheckCircle },
      rejected: { variant: "destructive", label: "Rejected", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const updateDocumentStatus = (docId: string, status: string, comments: string = "") => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === docId
          ? { ...doc, status, comments }
          : doc
      )
    );
  };

  const handleApproveAll = () => {
    setDocuments(prev =>
      prev.map(doc => ({ ...doc, status: "approved" }))
    );
  };

  const handleRejectAll = () => {
    setDocuments(prev =>
      prev.map(doc => ({ ...doc, status: "rejected" }))
    );
  };

  const handleSubmitReview = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    // In real app, this would submit to backend
    alert("Review submitted successfully!");
  };

  const allApproved = documents.every(doc => doc.status === "approved");
  const hasRejections = documents.some(doc => doc.status === "rejected");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Review</h1>
              <p className="text-sm text-gray-600">Application ID: {applicationId}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Application Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Application Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Student Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {mockApplication.student.name}</div>
                    <div><span className="font-medium">Matric No:</span> {mockApplication.student.matricNo}</div>
                    <div><span className="font-medium">Program:</span> {mockApplication.student.program}</div>
                    <div><span className="font-medium">Email:</span> {mockApplication.student.email}</div>
                    <div><span className="font-medium">Phone:</span> {mockApplication.student.phone}</div>
                  </div>
                </div>

                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Company Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Company:</span> {mockApplication.company.name}</div>
                    <div><span className="font-medium">Address:</span> {mockApplication.company.address}</div>
                    <div><span className="font-medium">Supervisor:</span> {mockApplication.company.supervisor}</div>
                    <div><span className="font-medium">Supervisor Email:</span> {mockApplication.company.supervisorEmail}</div>
                  </div>
                </div>
              </div>

              {/* Training Period */}
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  Training Period
                </h3>
                <div className="text-sm text-gray-600">
                  {new Date(mockApplication.trainingPeriod.start).toLocaleDateString("en-MY")} - {new Date(mockApplication.trainingPeriod.end).toLocaleDateString("en-MY")}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Review Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Document Review</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApproveAll}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRejectAll}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject All
                  </Button>
                </div>
              </div>
              <CardDescription>
                Review each document individually or use the bulk actions above.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <h4 className="font-medium text-gray-900">{doc.name}</h4>
                          <p className="text-sm text-gray-500">
                            {doc.type} • {doc.size} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString("en-MY")}
                          </p>
                        </div>
                      </div>
                      {getDocumentStatusBadge(doc.status)}
                    </div>

                    {doc.comments && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <strong>Comments:</strong> {doc.comments}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateDocumentStatus(doc.id, "approved")}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const comments = prompt("Enter rejection comments:");
                          if (comments) updateDocumentStatus(doc.id, "rejected", comments);
                        }}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Review Comments and Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Review Comments & Actions
              </CardTitle>
              <CardDescription>
                Add overall comments for this application review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Comments
                  </label>
                  <Textarea
                    placeholder="Enter your review comments here..."
                    value={overallComments}
                    onChange={(e) => setOverallComments(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`flex items-center gap-1 ${allApproved ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle className="h-4 w-4" />
                      All documents approved
                    </span>
                    {hasRejections && (
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        Some documents rejected
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" disabled={isSubmitting}>
                      Save Draft
                    </Button>
                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmitting || documents.some(doc => doc.status === "pending")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
