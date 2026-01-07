"use client";

import { useState, useEffect } from "react";
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
import { ArrowLeft, Save, FileText, Download, Upload, AlertTriangle } from "lucide-react";
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

  // Document Uploads
  bli03Hardcopy: z.any().optional(),
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
  const [isUploadingHardcopy, setIsUploadingHardcopy] = useState(false);
  const [hardcopyFile, setHardcopyFile] = useState<File | null>(null);
  const [hardcopyUploaded, setHardcopyUploaded] = useState(false);

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
          
          // Check if hardcopy has been uploaded AND approved (not in DRAFT status)
          const hardcopyDoc = activeApplication.documents?.find(
            (doc: any) => doc.type === 'BLI_03_HARDCOPY'
          );
          // Only mark as uploaded if it exists AND is not in DRAFT status (changes requested)
          const isHardcopyApproved = hardcopyDoc && hardcopyDoc.status !== 'DRAFT';
          setHardcopyUploaded(isHardcopyApproved);
        }
      } catch (error) {
        console.error('Error checking submission status:', error);
      } finally {
        setIsCheckingSubmission(false);
      }
    };
    
    checkSubmissionStatus();
  }, [reset]);

  const onSubmit = async (data: BLI03FormData) => {
    setIsSubmitting(true);
    try {
      console.log("Starting BLI03 submission...");
      console.log("Form data:", data);
      
      // First, get the user's applications to find the active one
      console.log("Fetching applications...");
      const { applications } = await api.get<{ applications: any[] }>('/applications');
      console.log("Applications received:", applications);
      
      const activeApplication = applications[0];

      if (!activeApplication) {
        throw new Error('No active application found. Please create an application (BLI-01) first before submitting BLI-03.');
      }

      console.log("Active application:", activeApplication);
      console.log("Application ID:", activeApplication.id);

      // Safety guard: If hardcopy is already uploaded/pending, do not allow re-submission of online form
      // unless we explicitly want to allow updates (which should probably require a distinct action)
      if (hardcopyUploaded) {
        console.log("Hardcopy already uploaded, preventing form re-submission");
        return;
      }

      // Submit BLI03 data to backend (first time submission or resubmission)
      // Only patch if form is dirty or not yet generated
      if (!pdfGenerated || isDirty) {
        console.log("Submitting BLI03 data to application ID:", activeApplication.id);
        const result = await api.patch(`/applications/${activeApplication.id}/bli03`, {
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
        });

        console.log("BLI-03 data saved successfully:", result);
        setPdfGenerated(true);
      } else {
        console.log("Form data not changed, skipping BLI03 update");
      }

      // If hardcopy file is selected, upload it automatically
      if (hardcopyFile && !hardcopyUploaded) {
        console.log("Uploading hardcopy file...");
        const formData = new FormData();
        formData.append('file', hardcopyFile);
        formData.append('applicationId', activeApplication.id);
        formData.append('documentType', 'BLI_03_HARDCOPY');

        const token = localStorage.getItem('accessToken');
        const uploadResponse = await fetch(`http://localhost:3000/api/applications/${activeApplication.id}/documents/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || 'Failed to upload hardcopy');
        }

        const uploadResult = await uploadResponse.json();
        console.log('Hardcopy uploaded successfully:', uploadResult);
        setHardcopyUploaded(true);
        alert("✅ BLI-03 Progress Report and Hardcopy submitted successfully!\n\nYour coordinator will review it shortly.");
      } else {
        alert("✅ BLI-03 Progress Report submitted successfully!\n\nYou can now download the PDF, print it, sign it, and upload the hardcopy.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`❌ Error submitting form:\n\n${errorMessage}\n\nPlease check the console for more details.`);
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
      
      alert("✅ BLI-03 PDF downloaded successfully!\n\nPlease print, sign, and upload the hardcopy.");
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download BLI-03 PDF. Please make sure you have submitted the form first.');
    }
  };

  const handleHardcopyUpload = async () => {
    if (!hardcopyFile) {
      alert('Please select a file to upload');
      return;
    }

    setIsUploadingHardcopy(true);
    try {
      // Get the user's applications to find the active one
      const { applications } = await api.get<{ applications: any[] }>('/applications');
      const activeApplication = applications[0];

      if (!activeApplication) {
        throw new Error('No active application found. Please submit the BLI-03 form first.');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', hardcopyFile);
      formData.append('documentType', 'BLI_03_HARDCOPY');

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/applications/${activeApplication.id}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload hardcopy');
      }

      const result = await response.json();
      console.log('Hardcopy uploaded successfully:', result);
      
      setHardcopyUploaded(true);
      alert('✅ BLI-03 Hardcopy uploaded successfully!\n\nYour coordinator will review it shortly.');
    } catch (error) {
      console.error('Error uploading hardcopy:', error);
      alert(`❌ Error uploading hardcopy:\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploadingHardcopy(false);
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

        <Tabs defaultValue="online-form" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="online-form">Online Form</TabsTrigger>
            <TabsTrigger value="hardcopy-upload">Hardcopy Scan Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="online-form" className="space-y-6">
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

          </TabsContent>

          <TabsContent value="hardcopy-upload" className="space-y-6">
            {/* Hardcopy Scan Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Hardcopy Scan Upload</CardTitle>
                <CardDescription>Generate PDF, print, sign, and upload the scanned copy of your BLI-03 form</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center mb-4">
                  <Button onClick={handleDownloadPDF} variant="outline" disabled={!pdfGenerated}>
                    <Download className="h-4 w-4 mr-2" />
                    Download BLI-03 PDF
                  </Button>
                </div>
                {!pdfGenerated && (
                  <p className="text-sm text-center text-gray-600">
                    Submit the form first to enable PDF download
                  </p>
                )}
                {pdfGenerated && (
                  <p className="text-sm text-center text-green-600">
                    ✓ Form submitted! You can now download the PDF
                  </p>
                )}
                <div>
                  <Label htmlFor="bli03Hardcopy">BLI-03 Hardcopy Scan (PDF/JPG/PNG)</Label>
                  <Input
                    id="bli03Hardcopy"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setHardcopyFile(file);
                      }
                    }}
                    disabled={!pdfGenerated || hardcopyUploaded}
                  />
                  <p className="text-xs text-gray-500 mt-1">Scan and upload signed BLI-03 hardcopy (max 10MB)</p>
                  {!pdfGenerated && (
                    <p className="text-xs text-orange-600 mt-1">Submit the form and download PDF first</p>
                  )}
                  {hardcopyUploaded && (
                    <p className="text-xs text-green-600 mt-1">✓ Hardcopy already uploaded</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link href="/student/applications">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || isCheckingSubmission || hardcopyUploaded}>
            {isSubmitting ? (
              "Submitting..."
            ) : hardcopyUploaded ? (
              "Submitted"
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Submit Progress Report
              </>
            )}
          </Button>
        </div>
      </form>
    </main>
  );
}
