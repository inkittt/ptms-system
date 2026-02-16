"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Loader2, AlertCircle, FileText } from "lucide-react";

interface BLI04Data {
  studentName: string;
  studentId: string;
  program: string;
  organisationName: string;
  organisationAddress: string;
  department: string;
  supervisorName: string;
  telephoneNo: string;
  email: string;
  organisationSector: string[];
  industryCode: string[];
}

export default function SupervisorBLI04Page() {
  const params = useParams();
  const token = params.token as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [applicationId, setApplicationId] = useState<string>("");
  const [bli04Data, setBli04Data] = useState<BLI04Data | null>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [supervisorInfo, setSupervisorInfo] = useState<any>(null);
  
  const [reportingDate, setReportingDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [signatureType, setSignatureType] = useState<"typed" | "drawn" | "upload">("typed");
  const [typedSignature, setTypedSignature] = useState("");
  const [drawnSignature, setDrawnSignature] = useState("");
  const [uploadedSignature, setUploadedSignature] = useState<File | null>(null);
  const [uploadedSignaturePreview, setUploadedSignaturePreview] = useState<string>("");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      try {
        const response = await fetch(`http://localhost:3000/api/supervisor/verify/${token}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Invalid or expired link');
        }
        
        setApplicationId(data.application.id);
        setBli04Data(data.bli04Data);
        setStudentInfo(data.application.user);
        setSupervisorInfo({
          name: data.supervisorName,
          email: data.supervisorEmail,
        });
        setTypedSignature(data.supervisorName);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      verifyToken();
    }
  }, [token]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportingDate) {
      alert('Please enter the reporting date');
      return;
    }
    
    let signature = '';
    if (signatureType === 'typed') {
      signature = typedSignature;
    } else if (signatureType === 'drawn') {
      signature = drawnSignature;
    } else if (signatureType === 'upload') {
      if (!uploadedSignature) {
        alert('Please upload your signature image');
        return;
      }
    }
    
    if (!signature && signatureType !== 'upload') {
      alert('Please provide your signature');
      return;
    }
    
    const confirmSubmit = window.confirm(
      'Are you sure you want to confirm this student\'s reporting duty?\n\n' +
      'By clicking OK, you confirm that:\n' +
      '1. The student has reported for duty on the specified date\n' +
      '2. All information provided is accurate\n' +
      '3. Your signature is authentic\n\n' +
      'This action cannot be undone.'
    );
    
    if (!confirmSubmit) return;
    
    setIsSubmitting(true);
    try {
      // If upload type, first upload the signature image
      if (signatureType === 'upload' && uploadedSignature) {
        const formData = new FormData();
        formData.append('signature', uploadedSignature);

        const uploadResponse = await fetch(`http://localhost:3000/api/applications/${applicationId}/upload-supervisor-signature?token=${token}`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || 'Failed to upload signature image');
        }
      }
      
      const response = await fetch(`http://localhost:3000/api/supervisor/sign/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature: signatureType === 'upload' ? '' : signature,
          signatureType: signatureType === 'upload' ? 'image' : signatureType,
          reportingDate,
          remarks,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit signature');
      }
      
      setSuccess(true);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying supervisor link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>Invalid Link</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error}</p>
            <p className="text-sm text-gray-600">
              Please contact the student to request a new link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <CardTitle>Successfully Submitted</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Thank you for confirming {studentInfo?.name}'s reporting duty.
            </p>
            <p className="text-sm text-gray-600">
              The student and coordinator have been notified of your confirmation.
              You may now close this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">BLI-04 Confirmation</h1>
              <p className="text-gray-600">Report for Duty - Supervisor Confirmation</p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Dear {supervisorInfo?.name},</strong><br />
              Please review the information below and confirm the student's reporting duty by providing your signature.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Name</Label>
                  <p className="font-medium">{bli04Data?.studentName || studentInfo?.name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Student ID</Label>
                  <p className="font-medium">{bli04Data?.studentId || studentInfo?.matricNo}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-600">Program</Label>
                  <p className="font-medium">{bli04Data?.program || studentInfo?.program}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organisation Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-gray-600">Organisation Name</Label>
                  <p className="font-medium">{bli04Data?.organisationName}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-600">Address</Label>
                  <p className="font-medium">{bli04Data?.organisationAddress}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Department</Label>
                  <p className="font-medium">{bli04Data?.department}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Supervisor</Label>
                  <p className="font-medium">{bli04Data?.supervisorName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supervisor Confirmation</CardTitle>
              <CardDescription>
                Please confirm the student's reporting duty and provide your signature
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reportingDate">Reporting Date <span className="text-red-600">*</span></Label>
                <Input
                  id="reportingDate"
                  type="date"
                  value={reportingDate}
                  onChange={(e) => setReportingDate(e.target.value)}
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the date the student first reported for duty
                </p>
              </div>

              <div>
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Any additional comments or remarks"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Signature <span className="text-red-600">*</span></Label>
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

              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <strong>⚠️ Important:</strong> By submitting this form, you confirm that the above student has reported for duty at your organization on the specified date. Your signature certifies the accuracy of this information.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm & Sign
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
