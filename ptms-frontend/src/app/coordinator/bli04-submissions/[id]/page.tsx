"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, CheckCircle, Calendar, Building2, User, Phone, Mail } from "lucide-react";

export default function BLI04SubmissionDetailPage() {
  const params = useParams();
  const submissionId = params.id as string;
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSubmission() {
      try {
        // TODO: Implement API call
        // const response = await applicationsApi.getBli04SubmissionById(submissionId);
        // setSubmission(response.submission);
        
        // Mock data
        const mockData = {
          id: submissionId,
          studentName: "Ahmad Bin Abdullah",
          studentId: "2021234567",
          program: "Bachelor of Computer Science (Hons.)",
          organisationName: "Tech Solutions Sdn Bhd",
          organisationAddress: "123 Jalan Technology, Cyber Valley",
          department: "Software Development",
          supervisorName: "Encik Ahmad Ibrahim",
          telephoneNo: "03-12345678",
          faxNo: "03-12345679",
          email: "hr@techsolutions.com",
          organisationSector: ["Information & Communication", "Professional, Scientific & Technical Activities"],
          industryCode: ["Private Multinational / Foreign"],
          reportingDate: "2025-01-15",
          supervisorSignatureDate: "2025-01-15",
          submittedAt: "2025-01-10",
          status: "SUBMITTED",
        };
        setSubmission(mockData);
      } catch (error) {
        console.error("Error loading submission:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSubmission();
  }, [submissionId]);

  if (isLoading) {
    return (
      <main className="flex-1 p-8">
        <div className="text-center py-8">Loading submission details...</div>
      </main>
    );
  }

  if (!submission) {
    return (
      <main className="flex-1 p-8">
        <div className="text-center py-8 text-red-600">Submission not found</div>
      </main>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-MY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/coordinator/bli04-submissions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Submissions
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">BLI-04 Submission Details</h1>
            <p className="text-gray-600">Report for Duty - {submission.studentName}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Student Has Reported for Duty</p>
              <p className="text-sm text-green-700">
                Submitted on {formatDate(submission.submittedAt)} • Reporting Date: {formatDate(submission.reportingDate)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{submission.studentName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Student ID</p>
              <p className="font-medium">{submission.studentId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Program</p>
              <p className="font-medium">{submission.program}</p>
            </div>
          </CardContent>
        </Card>

        {/* Organisation Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organisation Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Organisation Name</p>
              <p className="font-medium">{submission.organisationName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">{submission.organisationAddress}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-medium">{submission.department}</p>
            </div>
          </CardContent>
        </Card>

        {/* Supervisor Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Supervisor Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Supervisor Name</p>
              <p className="font-medium">{submission.supervisorName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Telephone</p>
                <p className="font-medium">{submission.telephoneNo}</p>
              </div>
            </div>
            {submission.faxNo && (
              <div>
                <p className="text-sm text-gray-600">Fax</p>
                <p className="font-medium">{submission.faxNo}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{submission.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reporting Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reporting Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Reporting Date</p>
              <p className="font-medium text-lg">{formatDate(submission.reportingDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Supervisor Signature Date</p>
              <p className="font-medium">{formatDate(submission.supervisorSignatureDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Form Submitted Date</p>
              <p className="font-medium">{formatDate(submission.submittedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organisation Sector & Industry Code */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Organisation Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Organisation Sector</p>
            <div className="flex flex-wrap gap-2">
              {submission.organisationSector.map((sector: string) => (
                <Badge key={sector} variant="secondary">
                  {sector}
                </Badge>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Industry Code</p>
            <div className="flex flex-wrap gap-2">
              {submission.industryCode.map((code: string) => (
                <Badge key={code} variant="secondary">
                  {code}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
