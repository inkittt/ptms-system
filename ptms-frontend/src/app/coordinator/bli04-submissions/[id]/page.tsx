"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, CheckCircle, Calendar, Building2, User, Phone, Mail, Loader2, XCircle, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function BLI04SubmissionDetailPage() {
  const params = useParams();
  const submissionId = params.id as string;
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [comments, setComments] = useState("");
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationDecision, setVerificationDecision] = useState<'APPROVE' | 'REQUEST_CHANGES' | null>(null);

  useEffect(() => {
    async function loadSubmission() {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:3000/api/applications/${submissionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch submission details');
        }

        const data = await response.json();
        const app = data.application;
        const bli04Form = app.formResponses?.find((f: any) => f.formTypeEnum === 'BLI_04');
        const bli04Data = bli04Form?.payloadJSON || {};

        setSubmission({
          id: app.id,
          studentName: app.user.name,
          studentId: app.user.matricNo,
          program: app.user.program,
          organisationName: bli04Data.organisationName || 'N/A',
          organisationAddress: bli04Data.organisationAddress || 'N/A',
          department: bli04Data.department || 'N/A',
          supervisorName: bli04Form?.supervisorName || bli04Data.supervisorName || 'N/A',
          telephoneNo: bli04Data.telephoneNo || 'N/A',
          faxNo: bli04Data.faxNo || '',
          email: bli04Data.email || 'N/A',
          organisationSector: bli04Data.organisationSector || [],
          industryCode: bli04Data.industryCode || [],
          reportingDate: bli04Data.reportingDate || 'N/A',
          supervisorSignatureDate: bli04Form?.supervisorSignedAt || 'N/A',
          submittedAt: bli04Form?.submittedAt || app.updatedAt,
          supervisorSignature: bli04Form?.supervisorSignature,
          supervisorSignatureType: bli04Form?.supervisorSignatureType,
          supervisorSignedAt: bli04Form?.supervisorSignedAt,
          isVerified: bli04Form?.verifiedBy ? true : false,
          status: bli04Form?.verifiedBy ? 'VERIFIED' : 'PENDING_VERIFICATION',
        });
      } catch (error) {
        console.error("Error loading submission:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSubmission();
  }, [submissionId]);

  const handleVerify = async (decision: 'APPROVE' | 'REQUEST_CHANGES') => {
    setIsVerifying(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/applications/bli04/submissions/${submissionId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          decision,
          comments: comments || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify submission');
      }

      alert(`✅ BLI-04 submission ${decision === 'APPROVE' ? 'approved' : 'sent back for changes'} successfully!`);
      window.location.href = '/coordinator/bli04-submissions';
    } catch (error) {
      console.error('Error verifying submission:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to verify submission'}`);
    } finally {
      setIsVerifying(false);
      setShowVerificationDialog(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading submission details...</span>
        </div>
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
            <a href={`http://localhost:3000/api/applications/${submissionId}/bli04/pdf`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {submission.supervisorSignedAt ? (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Supervisor Confirmed Reporting Duty</p>
                <p className="text-sm text-green-700">
                  Signed by {submission.supervisorName} on {formatDate(submission.supervisorSignedAt)}
                  {submission.reportingDate !== 'N/A' && ` • Reporting Date: ${formatDate(submission.reportingDate)}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900">Waiting for Supervisor Signature</p>
                <p className="text-sm text-yellow-700">
                  The student has filled out the form, but the supervisor has not yet confirmed and signed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            {submission.supervisorSignedAt && (
              <div>
                <p className="text-sm text-gray-600">Supervisor Signed At</p>
                <p className="font-medium">{formatDate(submission.supervisorSignedAt)}</p>
              </div>
            )}
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

      {/* Supervisor Signature */}
      {submission.supervisorSignature && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Supervisor Signature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-2">Signature Type</p>
                <Badge>{submission.supervisorSignatureType === 'typed' ? 'Typed Signature' : 'Drawn Signature'}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Signature</p>
                {submission.supervisorSignatureType === 'typed' ? (
                  <p className="font-serif text-3xl">{submission.supervisorSignature}</p>
                ) : (
                  <div className="border rounded-lg p-4 bg-white">
                    <img src={submission.supervisorSignature} alt="Supervisor Signature" className="max-w-md" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Actions */}
      {submission.supervisorSignedAt && !submission.isVerified && (
        <Card className="mt-6 border-blue-200">
          <CardHeader>
            <CardTitle>Coordinator Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any comments or feedback..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => handleVerify('APPROVE')}
                disabled={isVerifying}
                className="bg-green-600 hover:bg-green-700"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Mark as Reported
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleVerify('REQUEST_CHANGES')}
                disabled={isVerifying}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Request Changes
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Approving this submission will mark the student as having officially reported for duty.
              The student and their supervisor will be notified of your decision.
            </p>
          </CardContent>
        </Card>
      )}

      {submission.isVerified && (
        <Card className="mt-6 border-green-200 bg-green-50">
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
    </main>
  );
}
