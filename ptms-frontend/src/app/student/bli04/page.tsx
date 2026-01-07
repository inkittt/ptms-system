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
import { ArrowLeft, Save, FileText, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { applicationsApi } from "@/lib/api/applications";

// Zod validation schema for BLI-04 form
const bli04Schema = z.object({
  // Student Information
  studentName: z.string().min(1, "Student name is required"),
  studentId: z.string().min(1, "Student ID is required"),
  program: z.string().min(1, "Program is required"),

  // Organisation Information
  organisationName: z.string().min(1, "Organisation name is required"),
  organisationAddress: z.string().min(1, "Organisation address is required"),
  department: z.string().min(1, "Department is required"),
  supervisorName: z.string().min(1, "Supervisor name is required"),
  telephoneNo: z.string().min(1, "Telephone number is required"),
  faxNo: z.string().optional(),
  email: z.string().email("Invalid email format"),
  
  // Organisation Sector (checkboxes)
  organisationSector: z.array(z.string()).min(1, "Please select at least one organisation sector"),
  organisationSectorOther: z.string().optional(),
  
  // Industry Code (checkboxes)
  industryCode: z.array(z.string()).min(1, "Please select at least one industry code"),
  industryCodeOther: z.string().optional(),
  
  // Supervisor Confirmation
  reportingDate: z.string().min(1, "Reporting date is required"),
  supervisorSignatureDate: z.string().min(1, "Supervisor signature date is required. Please ensure your supervisor has signed and dated the form before submitting."),
});

type BLI04FormData = z.infer<typeof bli04Schema>;

export default function BLI04FormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [organisationSectors, setOrganisationSectors] = useState<string[]>([]);
  const [industryCodes, setIndustryCodes] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BLI04FormData>({
    resolver: zodResolver(bli04Schema),
    defaultValues: {
      organisationSector: [],
      industryCode: [],
    },
  });

  const toggleOrganisationSector = (sector: string) => {
    const updated = organisationSectors.includes(sector)
      ? organisationSectors.filter(s => s !== sector)
      : [...organisationSectors, sector];
    setOrganisationSectors(updated);
    setValue("organisationSector", updated);
  };

  const toggleIndustryCode = (code: string) => {
    const updated = industryCodes.includes(code)
      ? industryCodes.filter(c => c !== code)
      : [...industryCodes, code];
    setIndustryCodes(updated);
    setValue("industryCode", updated);
  };

  useEffect(() => {
    async function loadApplicationData() {
      try {
        const response = await applicationsApi.getMyApplications();
        const applications = response.applications;
        
        console.log('Applications response:', applications);
        
        if (applications && applications.length > 0) {
          const existingApp = applications.find((app: any) => 
            app.formResponses?.some((form: any) => form.formTypeEnum === 'BLI_01')
          );
          
          console.log('Existing app:', existingApp);
          
          if (existingApp) {
            const appData = existingApp as any;
            
            // Get BLI-01 form data
            const bli01Form = appData.formResponses?.find(
              (form: any) => form.formTypeEnum === 'BLI_01'
            );
            const bli01Data = bli01Form?.payloadJSON as any;
            
            console.log('BLI-01 data:', bli01Data);
            
            // Get BLI-03 form data
            const bli03Form = appData.formResponses?.find(
              (form: any) => form.formTypeEnum === 'BLI_03'
            );
            const bli03Data = bli03Form?.payloadJSON as any;
            
            console.log('BLI-03 data:', bli03Data);
            
            // Auto-fill student information - try multiple sources
            // First try from user object in application
            if (appData.user) {
              console.log('Using user data from app:', appData.user);
              setValue("studentName", appData.user.name || "");
              setValue("studentId", appData.user.matricNo || "");
              setValue("program", appData.user.program || "");
            } 
            // Fallback to BLI-01 form data
            else if (bli01Data) {
              console.log('Using BLI-01 form data');
              setValue("studentName", bli01Data.studentName || "");
              setValue("studentId", bli01Data.matricNo || "");
              setValue("program", bli01Data.program || "");
            }
            
            // Auto-fill organization information from BLI-03
            if (bli03Data) {
              console.log('Filling organization data from BLI-03');
              setValue("organisationName", bli03Data.organizationName || "");
              setValue("organisationAddress", bli03Data.organizationAddress || "");
              setValue("department", bli03Data.department || "");
              setValue("supervisorName", bli03Data.contactPersonName || "");
              setValue("telephoneNo", bli03Data.organizationPhone || "");
              setValue("faxNo", bli03Data.organizationFax || "");
              setValue("email", bli03Data.organizationEmail || "");
            }
          }
        }
      } catch (error) {
        console.error('Error loading application data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadApplicationData();
  }, [setValue]);

  const onSubmit = async (data: BLI04FormData) => {
    // Additional validation check for supervisor signature date
    if (!data.supervisorSignatureDate || data.supervisorSignatureDate.trim() === '') {
      alert('⚠️ Supervisor Signature Date is required!\n\nPlease ensure your industrial supervisor has signed the form and enter the signature date before submitting.');
      return;
    }

    // Confirm with user before submission
    const confirmSubmit = window.confirm(
      '⚠️ Confirmation Required\n\n' +
      'Have you ensured that:\n' +
      '1. Your industrial supervisor has physically signed the form?\n' +
      '2. The supervisor signature date is correct?\n' +
      '3. All information is accurate?\n\n' +
      'Click OK to submit, or Cancel to review the form.'
    );

    if (!confirmSubmit) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Get application ID from the applications
      const response = await applicationsApi.getMyApplications();
      const applications = response.applications;
      
      if (!applications || applications.length === 0) {
        throw new Error('No application found. Please complete BLI-01 first.');
      }
      
      const application = applications[0];
      
      // Submit BLI-04 form to backend
      const token = localStorage.getItem('accessToken');
      const submitResponse = await fetch(`http://localhost:3000/api/applications/${application.id}/bli04`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.message || 'Failed to submit BLI-04 form');
      }

      alert("✅ BLI-04 form submitted successfully!\n\nCoordinators can now view your submission.");
      window.location.href = '/student/applications';
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to submit form. Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading form data...</span>
        </div>
      </main>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-900">BLI-04 Form</h1>
        <p className="text-gray-600">Report for Duty Form</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
        {/* Student Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Student's Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="studentName">Name</Label>
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
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  {...register("studentId")}
                  placeholder="e.g., 2021234567"
                />
                {errors.studentId && (
                  <p className="text-sm text-red-600 mt-1">{errors.studentId.message}</p>
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
            </div>
          </CardContent>
        </Card>

        {/* Organisation Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Organisation Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="organisationName">Name</Label>
                <Input
                  id="organisationName"
                  {...register("organisationName")}
                  placeholder="Enter organisation name"
                />
                {errors.organisationName && (
                  <p className="text-sm text-red-600 mt-1">{errors.organisationName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="organisationAddress">Address</Label>
                <Input
                  id="organisationAddress"
                  {...register("organisationAddress")}
                  placeholder="Enter organisation address"
                />
                {errors.organisationAddress && (
                  <p className="text-sm text-red-600 mt-1">{errors.organisationAddress.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  {...register("department")}
                  placeholder="Enter department"
                />
                {errors.department && (
                  <p className="text-sm text-red-600 mt-1">{errors.department.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="supervisorName">Supervisor Name</Label>
                <Input
                  id="supervisorName"
                  {...register("supervisorName")}
                  placeholder="Enter supervisor name"
                />
                {errors.supervisorName && (
                  <p className="text-sm text-red-600 mt-1">{errors.supervisorName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="telephoneNo">Telephone No</Label>
                <Input
                  id="telephoneNo"
                  {...register("telephoneNo")}
                  placeholder="e.g., 03-12345678"
                />
                {errors.telephoneNo && (
                  <p className="text-sm text-red-600 mt-1">{errors.telephoneNo.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="faxNo">Fax No (Optional)</Label>
                <Input
                  id="faxNo"
                  {...register("faxNo")}
                  placeholder="e.g., 03-12345679"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  {...register("email")}
                  placeholder="organisation@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Organisation Sector Checkboxes */}
            <div className="space-y-3 pt-4">
              <Label>Organisation Sector (Tick where applicable)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  {[
                    'Agriculture, Forestry and Fisheries',
                    'Mining and Quarrying',
                    'Manufacturing',
                    'Electricity, Gas, Steam & Air Conditioning',
                    'Water Supply, Sewerage, Waste Management & Restorative Activities',
                    'Construction',
                    'Wholesale Trade & Retail Selling, Vehicle Repairs',
                    'Transportation & Storage',
                    'Accommodation & Food Services',
                    'Information & Communication',
                    'Finance and Insurance / Takaful Activities',
                    'Property Activities',
                  ].map((sector) => (
                    <div key={sector} className="flex items-center space-x-2">
                      <Checkbox
                        id={sector}
                        checked={organisationSectors.includes(sector)}
                        onCheckedChange={() => toggleOrganisationSector(sector)}
                      />
                      <label htmlFor={sector} className="text-sm">{sector}</label>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    'Professional, Scientific & Technical Activities',
                    'Administration & Support Services Activities',
                    'Public Administration & Defense; Social Security',
                    'Education',
                    'Human Health & Social Work Activities',
                    'Art, Entertainment & Recreation',
                    'Other Service Activities',
                    'Household activity as an employer for domestic personnel; Activities of producing goods and services indistinguishable by private households for own use',
                    'Organisation & Agencies Outside the Territory',
                  ].map((sector) => (
                    <div key={sector} className="flex items-center space-x-2">
                      <Checkbox
                        id={sector}
                        checked={organisationSectors.includes(sector)}
                        onCheckedChange={() => toggleOrganisationSector(sector)}
                      />
                      <label htmlFor={sector} className="text-sm">{sector}</label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="others-sector"
                      checked={organisationSectors.includes('Others')}
                      onCheckedChange={() => toggleOrganisationSector('Others')}
                    />
                    <label htmlFor="others-sector" className="text-sm">Others:</label>
                    <Input
                      {...register("organisationSectorOther")}
                      placeholder="Specify"
                      className="h-8"
                      disabled={!organisationSectors.includes('Others')}
                    />
                  </div>
                </div>
              </div>
              {errors.organisationSector && (
                <p className="text-sm text-red-600 mt-1">{errors.organisationSector.message}</p>
              )}
            </div>

            {/* Industry Code Checkboxes */}
            <div className="space-y-3 pt-4">
              <Label>Industry Code (Tick where applicable)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  {[
                    'Government',
                    'Statutory Body',
                    'Private Multinational / Foreign',
                    'Local Private Agency',
                  ].map((code) => (
                    <div key={code} className="flex items-center space-x-2">
                      <Checkbox
                        id={code}
                        checked={industryCodes.includes(code)}
                        onCheckedChange={() => toggleIndustryCode(code)}
                      />
                      <label htmlFor={code} className="text-sm">{code}</label>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    'Own Enterprise',
                    'GLC',
                    'NGO',
                  ].map((code) => (
                    <div key={code} className="flex items-center space-x-2">
                      <Checkbox
                        id={code}
                        checked={industryCodes.includes(code)}
                        onCheckedChange={() => toggleIndustryCode(code)}
                      />
                      <label htmlFor={code} className="text-sm">{code}</label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="others-industry"
                      checked={industryCodes.includes('Others')}
                      onCheckedChange={() => toggleIndustryCode('Others')}
                    />
                    <label htmlFor="others-industry" className="text-sm">Others:</label>
                    <Input
                      {...register("industryCodeOther")}
                      placeholder="Specify"
                      className="h-8"
                      disabled={!industryCodes.includes('Others')}
                    />
                  </div>
                </div>
              </div>
              {errors.industryCode && (
                <p className="text-sm text-red-600 mt-1">{errors.industryCode.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Industrial Supervisor Confirmation Section */}
        <Card>
          <CardHeader>
            <CardTitle>Industrial Supervisor Confirmation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300 mb-4">
              <p className="text-sm text-yellow-900 font-semibold">
                ⚠️ Important: This form must be signed by your industrial supervisor before submission. 
                Please ensure your supervisor has signed the physical form and provided the signature date below.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm mb-4">
                It is hereby confirmed that the above student has reported him/herself to undergo industrial training in this organization starting from:
              </p>
              <div className="mb-4">
                <Label htmlFor="reportingDate">Reporting Date <span className="text-red-600">*</span></Label>
                <Input
                  id="reportingDate"
                  type="date"
                  {...register("reportingDate")}
                />
                {errors.reportingDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.reportingDate.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Supervisor Signature & Official Stamp:</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center text-gray-400 text-sm">
                    (Space for signature and stamp)
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Physical signature required on printed form
                  </p>
                </div>
                <div>
                  <Label htmlFor="supervisorSignatureDate">Supervisor Signature Date <span className="text-red-600">*</span></Label>
                  <Input
                    id="supervisorSignatureDate"
                    type="date"
                    {...register("supervisorSignatureDate")}
                    className="border-2"
                  />
                  {errors.supervisorSignatureDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.supervisorSignatureDate.message}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    Enter the date your supervisor signed the form
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Please return this form within 7 working days from the date of reporting for duty to:</strong>
              </p>
              <p className="text-sm text-blue-900 mt-2">
                <strong>INDUSTRIAL TRAINING COORDINATOR (CDCS251/CS251)</strong><br />
                Faculty of Computer and Mathematical Sciences<br />
                Universiti Teknologi Mara (UiTM) Cawangan Melaka, Kampus Jasin<br />
                77300 Merlimau, Melaka<br />
                <em>Email: albin1841@uitm.edu.my (013-8218885)</em>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link href="/student/applications">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Submit BLI-04 Form
              </>
            )}
          </Button>
        </div>
      </form>
    </main>
  );
}
