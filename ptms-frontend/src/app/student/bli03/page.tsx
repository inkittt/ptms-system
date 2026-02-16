"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, FileText, Download, AlertTriangle, CheckCircle, Loader2, Clock } from "lucide-react";
import Link from "next/link";
import SessionProtectedRoute from "@/components/SessionProtectedRoute";
import { api } from "@/lib/api";

// Zod validation schema for BLI-03 form
const bli03Schema = z.object({
  // A. Student Information (BUTIRAN PELAJAR)
  studentName: z.string().min(1, "Student name is required"),
  matricNo: z.string().min(1, "Matric number is required"),
  program: z.string().min(1, "Program is required"),
  studentPhone: z.string().regex(/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/, "Invalid phone number format"),
  studentEmail: z.string().email("Invalid email format"),
  internshipStartDate: z.string().min(1, "Internship start date is required"),
  internshipEndDate: z.string().min(1, "Internship end date is required"),

  // B. Organization Selection (PEMILIHAN TEMPAT ORGANISASI)
  organizationName: z.string().min(1, "Organization name is required"),
  organizationAddress: z.string().min(1, "Organization address is required"),
  organizationPhone: z.string().regex(/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/, "Invalid phone number format"),
  organizationFax: z.string().optional(),
  organizationEmail: z.string().email("Invalid email format"),
  contactPersonName: z.string().min(1, "Contact person name is required"),
  contactPersonPhone: z.string().regex(/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/, "Invalid phone number format"),
  
  // Organization Selection Declaration
  organizationDeclaration: z.boolean().refine(val => val === true, "You must agree to the organization selection declaration"),

  // Additional fields (keeping for compatibility)
  reportingPeriod: z.string().min(1, "Reporting period is required"),

}).refine((data) => new Date(data.internshipStartDate) < new Date(data.internshipEndDate), {
  message: "Internship start date must be before end date",
  path: ["internshipEndDate"],
});

type BLI03FormData = z.infer<typeof bli03Schema>;

export default function BLI03Page() {
  return (
    <SessionProtectedRoute>
      <BLI03FormPage />
    </SessionProtectedRoute>
  );
}

function BLI03FormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [isCheckingSubmission, setIsCheckingSubmission] = useState(true);
  const [isSubmittedToCoordinator, setIsSubmittedToCoordinator] = useState(false);
  const [isStudentSigned, setIsStudentSigned] = useState(false);
  const [studentSignedAt, setStudentSignedAt] = useState<string | null>(null);
  const [coordinatorApproved, setCoordinatorApproved] = useState(false);
  const [changesRequested, setChangesRequested] = useState(false);
  const [coordinatorComments, setCoordinatorComments] = useState<string | null>(null);
  
  const [signatureType, setSignatureType] = useState<"typed" | "drawn" | "upload">("typed");
  const [typedSignature, setTypedSignature] = useState("");
  const [drawnSignature, setDrawnSignature] = useState("");
  const [uploadedSignature, setUploadedSignature] = useState<File | null>(null);
  const [uploadedSignaturePreview, setUploadedSignaturePreview] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<BLI03FormData>({
    resolver: zodResolver(bli03Schema),
    defaultValues: {
      organizationDeclaration: false,
    },
  });

  // Check if BLI-03 has been submitted on component mount
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      try {
        // Fetch user profile first
        const { profile } = await api.get<{ profile: any }>('/applications/profile');
        
        let defaultValues: Partial<BLI03FormData> = {
          organizationDeclaration: false,
        };

        // Set user info from profile
        if (profile) {
          defaultValues.studentName = profile.name || '';
          defaultValues.matricNo = profile.matricNo || '';
          defaultValues.program = profile.program || '';
        }
        
        const { applications } = await api.get<{ applications: any[] }>('/applications');
        const activeApplication = applications[0];
        
        if (activeApplication) {
          // Check if there's a BLI-03 form response
          const bli03FormResponse = activeApplication.formResponses?.find(
            (form: any) => form.formTypeEnum === 'BLI_03'
          );
          
          if (bli03FormResponse) {
            setPdfGenerated(true);
            
            // Pre-populate form with previously submitted data
            const formData = bli03FormResponse.payloadJSON;
            defaultValues = {
              ...defaultValues,
              studentPhone: formData.studentPhone || '',
              studentEmail: formData.studentEmail || '',
              internshipStartDate: formData.startDate || '',
              internshipEndDate: formData.endDate || '',
              organizationName: formData.organizationName || '',
              organizationAddress: formData.organizationAddress || '',
              organizationPhone: formData.organizationPhone || '',
              organizationFax: formData.organizationFax || '',
              organizationEmail: formData.organizationEmail || '',
              contactPersonName: formData.contactPersonName || '',
              contactPersonPhone: formData.contactPersonPhone || '',
              organizationDeclaration: formData.organizationDeclaration || false,
              reportingPeriod: formData.reportingPeriod || '',
            };
          }
          
          // Reset form with all values to ensure isDirty works correctly
          reset(defaultValues);
          
          // Check if student has signed
          if (bli03FormResponse && bli03FormResponse.studentSignedAt) {
            setIsStudentSigned(true);
            setStudentSignedAt(bli03FormResponse.studentSignedAt);
          }
          
          // Check for coordinator approval or changes requested
          const latestReview = activeApplication.reviews && activeApplication.reviews.length > 0
            ? activeApplication.reviews.sort((a: any, b: any) =>
                new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime()
              )[0]
            : null;
          
          if (latestReview && latestReview.decision === 'REQUEST_CHANGES') {
            setChangesRequested(true);
            setCoordinatorComments(latestReview.comments);
            setIsSubmittedToCoordinator(false);
          } else if (bli03FormResponse && bli03FormResponse.verifiedBy) {
            setCoordinatorApproved(true);
            setIsSubmittedToCoordinator(true);
          } else if (bli03FormResponse && bli03FormResponse.studentSignedAt) {
            setIsSubmittedToCoordinator(true);
          }
        }
      } catch (error) {
        console.error('Error checking submission status:', error);
      } finally {
        setIsCheckingSubmission(false);
      }
    };
    
    checkSubmissionStatus();
  }, [reset]);

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

    // Validate file type
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      alert('Please select a PNG or JPG image file');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB');
      return;
    }

    setUploadedSignature(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedSignaturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: BLI03FormData) => {
    // Validate signature based on type
    let signature = '';
    if (signatureType === 'typed') {
      signature = typedSignature;
    } else if (signatureType === 'drawn') {
      signature = drawnSignature;
    } else if (signatureType === 'upload') {
      if (!uploadedSignature) {
        alert('❌ Please upload your signature image before submitting.');
        return;
      }
    }

    if (!signature && signatureType !== 'upload') {
      alert('❌ Please provide your signature before submitting.');
      return;
    }

    const confirmSubmit = window.confirm(
      '⚠️ Confirmation Required\n\n' +
      'Are you ready to submit this BLI-03 form with your signature?\n\n' +
      'By clicking OK, you confirm that:\n' +
      '1. All information provided is accurate\n' +
      '2. Your signature is authentic\n' +
      '3. You agree to the organization selection declaration\n\n' +
      'Click OK to submit, or Cancel to review.'
    );

    if (!confirmSubmit) return;

    setIsSubmitting(true);
    try {
      const { applications } = await api.get<{ applications: any[] }>('/applications');
      const activeApplication = applications[0];

      if (!activeApplication) {
        throw new Error('No active application found. Please create an application (BLI-01) first before submitting BLI-03.');
      }

      const token = localStorage.getItem('accessToken');

      // If upload type, first upload the signature image
      if (signatureType === 'upload' && uploadedSignature) {
        const formData = new FormData();
        formData.append('signature', uploadedSignature);

        const uploadResponse = await fetch(`http://localhost:3000/api/applications/${activeApplication.id}/upload-signature`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload signature image');
        }

        // After successful upload, submit the form without signature data
        // (signature is already saved in the database)
        const response = await fetch(`http://localhost:3000/api/applications/${activeApplication.id}/bli03/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentPhone: data.studentPhone,
            studentEmail: data.studentEmail,
            startDate: data.internshipStartDate,
            endDate: data.internshipEndDate,
            organizationName: data.organizationName,
            organizationAddress: data.organizationAddress,
            organizationPhone: data.organizationPhone,
            organizationFax: data.organizationFax,
            organizationEmail: data.organizationEmail,
            contactPersonName: data.contactPersonName,
            contactPersonPhone: data.contactPersonPhone,
            organizationDeclaration: data.organizationDeclaration,
            reportingPeriod: data.reportingPeriod,
            studentSignature: '', // Already uploaded
            studentSignatureType: 'image',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to submit BLI-03 form');
        }
      } else {
        // For typed or drawn signatures
        const response = await fetch(`http://localhost:3000/api/applications/${activeApplication.id}/bli03/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentPhone: data.studentPhone,
            studentEmail: data.studentEmail,
            startDate: data.internshipStartDate,
            endDate: data.internshipEndDate,
            organizationName: data.organizationName,
            organizationAddress: data.organizationAddress,
            organizationPhone: data.organizationPhone,
            organizationFax: data.organizationFax,
            organizationEmail: data.organizationEmail,
            contactPersonName: data.contactPersonName,
            contactPersonPhone: data.contactPersonPhone,
            organizationDeclaration: data.organizationDeclaration,
            reportingPeriod: data.reportingPeriod,
            studentSignature: signature,
            studentSignatureType: signatureType,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to submit BLI-03 form');
        }
      }

      alert(changesRequested
        ? '✅ BLI-03 form resubmitted successfully!\n\nYour coordinator will review your updated submission.'
        : '✅ BLI-03 form submitted successfully!\n\nYour coordinator will review and sign it shortly.');
      window.location.reload();
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`❌ Error submitting form:\n\n${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      console.log("Downloading BLI-03 PDF...");
      
      // Get the user's applications to find the active one
      const { applications } = await api.get<{ applications: any[] }>('/applications');
      const activeApplication = applications[0];

      if (!activeApplication) {
        throw new Error('No active application found.');
      }

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/applications/${activeApplication.id}/bli03/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BLI-03-${activeApplication.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert("✅ BLI-03 PDF downloaded successfully!");
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download BLI-03 PDF. Please make sure you have submitted the form first.');
    }
  };


  return (
    <main className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/student/applications">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">BLI-03 Form</h1>
        <p className="text-gray-600">Internship Progress Report</p>
      </div>

      {/* Status Banners */}
      {changesRequested && (
        <div className="max-w-4xl mx-auto mb-6">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold">!</div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900">Changes Requested by Coordinator</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    The coordinator has reviewed your BLI-03 submission and requested changes.
                  </p>
                  {coordinatorComments && (
                    <div className="mt-3 p-3 bg-white rounded border border-orange-200">
                      <p className="text-sm font-medium text-gray-700">Coordinator's Comments:</p>
                      <p className="text-sm text-gray-600 mt-1">{coordinatorComments}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isSubmittedToCoordinator && !changesRequested && !coordinatorApproved && (
        <div className="max-w-4xl mx-auto mb-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Pending Coordinator Review</h3>
                  <p className="text-sm text-blue-700">
                    Your BLI-03 form has been submitted and is awaiting coordinator review and signature.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {coordinatorApproved && (
        <div className="max-w-4xl mx-auto mb-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Approved by Coordinator</h3>
                  <p className="text-sm text-green-700">
                    Your BLI-03 form has been approved and signed by the coordinator.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
        {/* Validation Errors Display */}
        {Object.keys(errors).length > 0 && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Please fix the following errors:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>
                        <strong>{field}:</strong> {error?.message as string}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
            {/* A. Student Information Section (BUTIRAN PELAJAR) */}
        <Card>
          <CardHeader>
            <CardTitle>A. BUTIRAN PELAJAR (Student Information)</CardTitle>
            <CardDescription>Please provide your basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentName">Nama (Name)</Label>
                <Input
                  id="studentName"
                  {...register("studentName")}
                  placeholder="Enter your full name"
                />
                {errors.studentName && (
                  <p className="text-sm text-red-600 mt-1">{errors.studentName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="matricNo">No. Pelajar (Student Number)</Label>
                <Input
                  id="matricNo"
                  {...register("matricNo")}
                  placeholder="e.g., 2021234567"
                />
                {errors.matricNo && (
                  <p className="text-sm text-red-600 mt-1">{errors.matricNo.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="program">Program</Label>
                <Input
                  id="program"
                  {...register("program")}
                  placeholder="e.g., Bachelor of Computer Science"
                />
                {errors.program && (
                  <p className="text-sm text-red-600 mt-1">{errors.program.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="studentPhone">No. Telefon (Phone Number)</Label>
                <Input
                  id="studentPhone"
                  {...register("studentPhone")}
                  placeholder="e.g., 012-3456789"
                />
                {errors.studentPhone && (
                  <p className="text-sm text-red-600 mt-1">{errors.studentPhone.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="studentEmail">E-mel (Email)</Label>
                <Input
                  id="studentEmail"
                  {...register("studentEmail")}
                  placeholder="student@example.com"
                />
                {errors.studentEmail && (
                  <p className="text-sm text-red-600 mt-1">{errors.studentEmail.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="internshipStartDate">Tarikh LI: Mula (Start Date)</Label>
                <Input
                  id="internshipStartDate"
                  type="date"
                  {...register("internshipStartDate")}
                />
                {errors.internshipStartDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.internshipStartDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="internshipEndDate">Tamat (End Date)</Label>
                <Input
                  id="internshipEndDate"
                  type="date"
                  {...register("internshipEndDate")}
                />
                {errors.internshipEndDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.internshipEndDate.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* B. Organization Selection Section (PEMILIHAN TEMPAT ORGANISASI) */}
        <Card>
          <CardHeader>
            <CardTitle>B. PEMILIHAN TEMPAT ORGANISASI (Organization Selection)</CardTitle>
            <CardDescription>Organization information and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="organizationName">Nama Organisasi (Organization Name)</Label>
                <Textarea
                  id="organizationName"
                  {...register("organizationName")}
                  placeholder="Enter organization name"
                  rows={2}
                />
                {errors.organizationName && (
                  <p className="text-sm text-red-600 mt-1">{errors.organizationName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="organizationAddress">Alamat Organisasi (Organization Address)</Label>
                <Textarea
                  id="organizationAddress"
                  {...register("organizationAddress")}
                  placeholder="Enter organization address"
                  rows={3}
                />
                {errors.organizationAddress && (
                  <p className="text-sm text-red-600 mt-1">{errors.organizationAddress.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizationPhone">No. Telefon/Faks: TEL</Label>
                  <Input
                    id="organizationPhone"
                    {...register("organizationPhone")}
                    placeholder="e.g., 03-12345678"
                  />
                  {errors.organizationPhone && (
                    <p className="text-sm text-red-600 mt-1">{errors.organizationPhone.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="organizationFax">FAX</Label>
                  <Input
                    id="organizationFax"
                    {...register("organizationFax")}
                    placeholder="e.g., 03-12345679"
                  />
                  {errors.organizationFax && (
                    <p className="text-sm text-red-600 mt-1">{errors.organizationFax.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="organizationEmail">E-mel (Email)</Label>
                <Input
                  id="organizationEmail"
                  {...register("organizationEmail")}
                  placeholder="organization@example.com"
                />
                {errors.organizationEmail && (
                  <p className="text-sm text-red-600 mt-1">{errors.organizationEmail.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="contactPersonName">Nama Pegawai Bertanggungjawab (Contact Person Name)</Label>
                <Input
                  id="contactPersonName"
                  {...register("contactPersonName")}
                  placeholder="Enter contact person name"
                />
                {errors.contactPersonName && (
                  <p className="text-sm text-red-600 mt-1">{errors.contactPersonName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="contactPersonPhone">No. Telefon Pegawai (Contact Person Phone)</Label>
                <Input
                  id="contactPersonPhone"
                  {...register("contactPersonPhone")}
                  placeholder="e.g., 012-3456789"
                />
                {errors.contactPersonPhone && (
                  <p className="text-sm text-red-600 mt-1">{errors.contactPersonPhone.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="reportingPeriod">Reporting Duty / Tempoh Laporan</Label>
              <Select onValueChange={(value) => setValue("reportingPeriod", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reporting period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week-1-4">Weeks 1-4</SelectItem>
                  <SelectItem value="week-5-8">Weeks 5-8</SelectItem>
                  <SelectItem value="week-9-12">Weeks 9-12</SelectItem>
                  <SelectItem value="week-13-16">Weeks 13-16</SelectItem>
                  <SelectItem value="week-17-20">Weeks 17-20</SelectItem>
                  <SelectItem value="week-21-24">Weeks 21-24</SelectItem>
                  <SelectItem value="final">Final Report</SelectItem>
                </SelectContent>
              </Select>
              {errors.reportingPeriod && (
                <p className="text-sm text-red-600 mt-1">{errors.reportingPeriod.message}</p>
              )}
            </div>

            {/* Organization Selection Declaration */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-4">
                Dengan ini, saya bersetuju untuk memilih menjalani latihan industri di syarikat/organisasi seperti di atas.
              </p>
              <p className="text-sm text-gray-700 mb-4">
                Saya memahami bahawa saya tidak boleh membuat penukaran penempatan latihan industri di syarikat/organisasi lain selain organisasi di atas kecuali atas sebab-sebab yang tidak dapat dielakkan dengan kebenaran pihak kolej.
              </p>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="organizationDeclaration"
                  checked={watch("organizationDeclaration")}
                  onCheckedChange={(checked) => setValue("organizationDeclaration", checked as boolean)}
                />
                <label htmlFor="organizationDeclaration" className="text-sm font-medium leading-5">
                  SETUJU (I AGREE)
                </label>
              </div>
              {errors.organizationDeclaration && (
                <p className="text-sm text-red-600 mt-2">{errors.organizationDeclaration.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Student Signature Section */}
        {!isStudentSigned && (
          <Card>
            <CardHeader>
              <CardTitle>Student Signature</CardTitle>
              <CardDescription>
                Please provide your signature to confirm the accuracy of the information above
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Signature Type</Label>
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
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link href="/student/applications">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          {coordinatorApproved && (
            <Button onClick={handleDownloadPDF} variant="outline" type="button">
              <Download className="h-4 w-4 mr-2" />
              Download Approved PDF
            </Button>
          )}
          {!isSubmittedToCoordinator && (
            <Button type="submit" disabled={isSubmitting || isCheckingSubmission}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {changesRequested ? 'Resubmit with Signature' : 'Submit with Signature'}
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </main>
  );
}
