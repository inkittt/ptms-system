"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, CheckCircle, Calendar, Building2, User, Phone, Mail, Loader2, XCircle, AlertCircle } from "lucide-react";

export default function BLI03SubmissionDetailPage() {
  const params = useParams();
  const submissionId = params.id as string;
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [comments, setComments] = useState("");
  
  const [signatureType, setSignatureType] = useState<"typed" | "drawn" | "upload">("typed");
  const [typedSignature, setTypedSignature] = useState("");
  const [drawnSignature, setDrawnSignature] = useState("");
  const [uploadedSignature, setUploadedSignature] = useState<File | null>(null);
  const [uploadedSignaturePreview, setUploadedSignaturePreview] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

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
        const bli03Form = app.formResponses?.find((f: any) => f.formTypeEnum === 'BLI_03');
        const bli03Data = bli03Form?.payloadJSON || {};

        setSubmission({
          id: app.id,
          studentName: app.user.name,
          studentId: app.user.matricNo,
          program: app.user.program,
          studentPhone: bli03Data.studentPhone || app.studentPhone || 'N/A',
          studentEmail: bli03Data.studentEmail || app.studentEmail || 'N/A',
          organizationName: bli03Data.organizationName || app.organizationName || 'N/A',
          organizationAddress: bli03Data.organizationAddress || app.organizationAddress || 'N/A',
          organizationPhone: bli03Data.organizationPhone || app.organizationPhone || 'N/A',
          organizationFax: bli03Data.organizationFax || app.organizationFax || '',
          organizationEmail: bli03Data.organizationEmail || app.organizationEmail || 'N/A',
          contactPersonName: bli03Data.contactPersonName || app.contactPersonName || 'N/A',
          contactPersonPhone: bli03Data.contactPersonPhone || app.contactPersonPhone || 'N/A',
          startDate: bli03Data.startDate || app.startDate || 'N/A',
          endDate: bli03Data.endDate || app.endDate || 'N/A',
          reportingPeriod: bli03Data.reportingPeriod || 'N/A',
          studentSignature: bli03Form?.studentSignature,
          studentSignatureType: bli03Form?.studentSignatureType,
          studentSignedAt: bli03Form?.studentSignedAt,
          coordinatorSignature: bli03Form?.coordinatorSignature,
          coordinatorSignatureType: bli03Form?.coordinatorSignatureType,
          coordinatorSignedAt: bli03Form?.coordinatorSignedAt,
          isApproved: bli03Form?.verifiedBy ? true : false,
          submittedAt: bli03Form?.submittedAt || app.updatedAt,
        });
        
        // Pre-fill coordinator signature with their name
        const profileResponse = await fetch('http://localhost:3000/api/applications/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setTypedSignature(profileData.profile.name || "");
        }
      } catch (error) {
        console.error("Error loading submission:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSubmission();
  }, [submissionId]);

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

  const handleSignatureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      alert('Please select a PNG or JPG image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB');
      return;
    }

    setUploadedSignature(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedSignaturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleApprove = async (decision: 'APPROVE' | 'REQUEST_CHANGES') => {
    if (decision === 'APPROVE') {
      let signature = '';
      if (signatureType === 'typed') {
        signature = typedSignature;
      } else if (signatureType === 'drawn') {
        signature = drawnSignature;
      } else if (signatureType === 'upload') {
        if (!uploadedSignature) {
          alert('❌ Please upload your signature image before approving.');
          return;
        }
      }
      
      if (!signature && signatureType !== 'upload') {
        alert('❌ Please provide your signature before approving.');
        return;
      }
    }

    const confirmMessage = decision === 'APPROVE'
      ? '⚠️ Confirmation Required\n\n' +
        'Are you ready to approve and sign this BLI-03 form?\n\n' +
        'By clicking OK, you confirm that:\n' +
        '1. You have reviewed all information\n' +
        '2. Your signature is authentic\n' +
        '3. The form will be marked as approved\n\n' +
        'Click OK to approve, or Cancel to review.'
      : 'Are you sure you want to request changes to this submission?\n\n' +
        'The student will be notified and will need to resubmit with corrections.';

    if (!window.confirm(confirmMessage)) return;

    setIsApproving(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      // If upload type, first upload the signature image
      if (decision === 'APPROVE' && signatureType === 'upload' && uploadedSignature) {
        const formData = new FormData();
        formData.append('signature', uploadedSignature);

        const uploadResponse = await fetch(`http://localhost:3000/api/applications/${submissionId}/upload-signature`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload signature image');
        }
      }
      
      const signature = signatureType === 'typed' ? typedSignature : (signatureType === 'drawn' ? drawnSignature : '');
      
      const response = await fetch(`http://localhost:3000/api/applications/bli03/submissions/${submissionId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          decision,
          comments: comments || undefined,
          coordinatorSignature: decision === 'APPROVE' ? signature : undefined,
          coordinatorSignatureType: decision === 'APPROVE' ? signatureType : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process approval');
      }

      alert(`✅ BLI-03 submission ${decision === 'APPROVE' ? 'approved and signed' : 'sent back for changes'} successfully!`);
      window.location.href = '/coordinator/bli03-submissions';
    } catch (error) {
      console.error('Error processing approval:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to process approval'}`);
    } finally {
      setIsApproving(false);
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
    if (!dateString || dateString === 'N/A') return 'N/A';
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
          <Link href="/coordinator/bli03-submissions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Submissions
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">BLI-03 Submission Details</h1>
            <p className="text-gray-600">Internship Progress Report - {submission.studentName}</p>
          </div>
          <div className="flex gap-2">
            <a href={`http://localhost:3000/api/applications/${submissionId}/bli03/pdf`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {submission.studentSignedAt ? (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Student Signed</p>
                <p className="text-sm text-green-700">
                  Signed by {submission.studentName} on {formatDate(submission.studentSignedAt)}
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
                <p className="font-semibold text-yellow-900">Waiting for Student Signature</p>
                <p className="text-sm text-yellow-700">
                  The student has not yet signed this form.
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
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{submission.studentPhone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{submission.studentEmail}</p>
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
              <p className="font-medium">{submission.organizationName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">{submission.organizationAddress}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact Person</p>
              <p className="font-medium">{submission.contactPersonName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{submission.organizationPhone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{submission.organizationEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Internship Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Internship Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="font-medium">{formatDate(submission.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">End Date</p>
              <p className="font-medium">{formatDate(submission.endDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Reporting Period</p>
              <Badge>{submission.reportingPeriod}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Form Submitted Date</p>
              <p className="font-medium">{formatDate(submission.submittedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Signature */}
      {submission.studentSignature && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Student Signature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-2">Signature Type</p>
                <Badge>{submission.studentSignatureType === 'typed' ? 'Typed Signature' : 'Drawn Signature'}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Signature</p>
                {submission.studentSignatureType === 'typed' ? (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="font-serif text-3xl">{submission.studentSignature}</p>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-white">
                    <img src={submission.studentSignature} alt="Student Signature" className="max-w-md" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Signed At</p>
                <p className="font-medium">{formatDate(submission.studentSignedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coordinator Signature & Approval */}
      {submission.studentSignedAt && !submission.isApproved && (
        <Card className="mt-6 border-blue-200">
          <CardHeader>
            <CardTitle>Coordinator Approval & Signature</CardTitle>
            <CardDescription>
              Review the submission and provide your signature to approve
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Coordinator Signature <span className="text-red-600">*</span></Label>
              <Tabs value={signatureType} onValueChange={(v) => setSignatureType(v as "typed" | "drawn" | "upload")} className="mt-2">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="typed">Typed Signature</TabsTrigger>
                  <TabsTrigger value="drawn">Draw Signature</TabsTrigger>
                  <TabsTrigger value="upload">Upload Image</TabsTrigger>
                </TabsList>
                
                <TabsContent value="typed" className="space-y-2">
                  <Input
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="Type your full name"
                    className="font-serif text-2xl"
                  />
                  <p className="text-xs text-gray-500">
                    Your typed name will serve as your electronic signature
                  </p>
                </TabsContent>
                
                <TabsContent value="drawn" className="space-y-2">
                  <div className="border-2 border-gray-300 rounded-lg bg-white">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={200}
                      className="w-full cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
                    Clear Signature
                  </Button>
                  <p className="text-xs text-gray-500">
                    Draw your signature using your mouse or touchscreen
                  </p>
                </TabsContent>

                <TabsContent value="upload" className="space-y-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleSignatureFileChange}
                      className="mb-2"
                    />
                    {uploadedSignaturePreview && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <img 
                          src={uploadedSignaturePreview} 
                          alt="Signature preview" 
                          className="max-w-md border rounded-lg p-2 bg-white"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload a PNG or JPG image of your signature (max 2MB)
                  </p>
                </TabsContent>
              </Tabs>
            </div>

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
                onClick={() => handleApprove('APPROVE')}
                disabled={isApproving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Sign & Approve
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleApprove('REQUEST_CHANGES')}
                disabled={isApproving}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                {isApproving ? (
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>ℹ️ Important:</strong> By signing and approving this submission, you confirm that you have reviewed all information and the student's placement is confirmed. The student will be notified of your decision.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {submission.isApproved && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Approved and Signed by Coordinator</p>
                <p className="text-sm text-green-700">
                  This submission has been approved on {formatDate(submission.coordinatorSignedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
