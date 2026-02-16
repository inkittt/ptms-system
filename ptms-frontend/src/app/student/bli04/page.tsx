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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, FileText, Download, Loader2, Link as LinkIcon, Copy, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { applicationsApi } from "@/lib/api/applications";

// Zod validation schema for BLI-04 form (for saving draft)
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
});

type BLI04FormData = z.infer<typeof bli04Schema>;

export default function BLI04FormPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [organisationSectors, setOrganisationSectors] = useState<string[]>([]);
  const [industryCodes, setIndustryCodes] = useState<string[]>([]);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [supervisorLink, setSupervisorLink] = useState<string | null>(null);
  const [linkExpiry, setLinkExpiry] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [supervisorSignature, setSupervisorSignature] = useState<string | null>(null);
  const [supervisorSignatureType, setSupervisorSignatureType] = useState<string | null>(null);
  const [supervisorName, setSupervisorName] = useState<string | null>(null);
  const [reportingDate, setReportingDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedToCoordinator, setIsSubmittedToCoordinator] = useState(false);
  const [changesRequested, setChangesRequested] = useState(false);
  const [coordinatorComments, setCoordinatorComments] = useState<string | null>(null);

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
            setApplicationId(appData.id);
            
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
            
            // Get BLI-04 form data if exists
            const bli04Form = appData.formResponses?.find(
              (form: any) => form.formTypeEnum === 'BLI_04'
            );
            const bli04Data = bli04Form?.payloadJSON as any;
            
            if (bli04Form) {
              console.log('BLI-04 Form found:', bli04Form);
              console.log('Supervisor signed at:', bli04Form.supervisorSignedAt);
              console.log('Supervisor signature:', bli04Form.supervisorSignature);
              
              // Check for coordinator reviews first
              const latestReview = appData.reviews && appData.reviews.length > 0 
                ? appData.reviews.sort((a: any, b: any) => 
                    new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime()
                  )[0]
                : null;
              
              // Check if coordinator requested changes
              if (latestReview && latestReview.decision === 'REQUEST_CHANGES') {
                setChangesRequested(true);
                setCoordinatorComments(latestReview.comments);
                setIsSubmittedToCoordinator(false);
                
                // Check if supervisor has re-signed after changes were requested
                if (bli04Form.supervisorSignedAt) {
                  console.log('Supervisor has re-signed after changes requested');
                  setIsSigned(true);
                  setSignedAt(bli04Form.supervisorSignedAt);
                  setSupervisorSignature(bli04Form.supervisorSignature);
                  setSupervisorSignatureType(bli04Form.supervisorSignatureType);
                  setSupervisorName(bli04Form.supervisorName);
                  setReportingDate(bli04Data.reportingDate);
                } else {
                  // Supervisor has not re-signed yet
                  console.log('Waiting for supervisor to re-sign');
                  setIsSigned(false);
                  setSignedAt(null);
                  setSupervisorSignature(null);
                  setSupervisorSignatureType(null);
                  setSupervisorName(null);
                  setReportingDate(null);
                }
              } else if (bli04Form.verifiedBy) {
                // Already verified by coordinator (approved)
                setIsSubmittedToCoordinator(true);
                setChangesRequested(false);
                // Check if supervisor has signed
                if (bli04Form.supervisorSignedAt) {
                  setIsSigned(true);
                  setSignedAt(bli04Form.supervisorSignedAt);
                  setSupervisorSignature(bli04Form.supervisorSignature);
                  setSupervisorSignatureType(bli04Form.supervisorSignatureType);
                  setSupervisorName(bli04Form.supervisorName);
                  setReportingDate(bli04Data.reportingDate);
                }
              } else {
                // Not yet submitted or pending verification
                setIsSubmittedToCoordinator(false);
                setChangesRequested(false);
                // Check if supervisor has signed
                if (bli04Form.supervisorSignedAt) {
                  console.log('Setting supervisor signature data...');
                  setIsSigned(true);
                  setSignedAt(bli04Form.supervisorSignedAt);
                  setSupervisorSignature(bli04Form.supervisorSignature);
                  setSupervisorSignatureType(bli04Form.supervisorSignatureType);
                  setSupervisorName(bli04Form.supervisorName);
                  setReportingDate(bli04Data.reportingDate);
                } else {
                  console.log('Supervisor has not signed yet');
                }
              }
              
              // Load saved BLI-04 data
              if (bli04Data.organisationSector) {
                setOrganisationSectors(bli04Data.organisationSector);
                setValue("organisationSector", bli04Data.organisationSector);
              }
              if (bli04Data.industryCode) {
                setIndustryCodes(bli04Data.industryCode);
                setValue("industryCode", bli04Data.industryCode);
              }
            }
            
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
            
            // Auto-fill organization information from BLI-03 or saved BLI-04
            if (bli04Data) {
              setValue("organisationName", bli04Data.organisationName || "");
              setValue("organisationAddress", bli04Data.organisationAddress || "");
              setValue("department", bli04Data.department || "");
              setValue("supervisorName", bli04Data.supervisorName || "");
              setValue("telephoneNo", bli04Data.telephoneNo || "");
              setValue("faxNo", bli04Data.faxNo || "");
              setValue("email", bli04Data.email || "");
              setValue("organisationSectorOther", bli04Data.organisationSectorOther || "");
              setValue("industryCodeOther", bli04Data.industryCodeOther || "");
            } else if (bli03Data) {
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

  const onSaveDraft = async (data: BLI04FormData) => {
    if (!applicationId) {
      alert('❌ No application found. Please complete BLI-01 first.');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/applications/${applicationId}/bli04/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save BLI-04 form');
      }

      alert("✅ BLI-04 form saved successfully!\n\nYou can now generate a link for your supervisor.");
    } catch (error) {
      console.error("Error saving form:", error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to save form. Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const onGenerateLink = async () => {
    if (!applicationId) {
      alert('❌ No application found.');
      return;
    }

    setIsGeneratingLink(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/applications/${applicationId}/bli04/generate-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate supervisor link');
      }

      const data = await response.json();
      const link = `${window.location.origin}/supervisor/bli04/${data.token}`;
      setSupervisorLink(link);
      setLinkExpiry(data.expiresAt);
      
      console.log('Link generated:', link);
      console.log('State after generation - isSigned:', isSigned, 'isSubmittedToCoordinator:', isSubmittedToCoordinator, 'changesRequested:', changesRequested);
      
      alert("✅ Supervisor link generated successfully!\n\nPlease share this link with your supervisor.");
    } catch (error) {
      console.error("Error generating link:", error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to generate link. Please try again.'}`);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyLinkToClipboard = () => {
    if (supervisorLink) {
      navigator.clipboard.writeText(supervisorLink);
      alert('✅ Link copied to clipboard!');
    }
  };

  const onSubmitToCoordinator = async () => {
    if (!applicationId) {
      alert('❌ No application found.');
      return;
    }

    if (!isSigned) {
      alert('❌ Please wait for your supervisor to sign the form first.');
      return;
    }

    const confirmSubmit = window.confirm(
      '⚠️ Confirmation Required\n\n' +
      (changesRequested 
        ? 'Are you ready to resubmit this BLI-04 form to the coordinator?\n\n' +
          'Please ensure you have addressed all the requested changes.\n\n' +
          'Click OK to resubmit, or Cancel to review.'
        : 'Are you ready to submit this BLI-04 form to the coordinator for verification?\n\n' +
          'Once submitted, the coordinator will review and verify your reporting duty.\n\n' +
          'Click OK to submit, or Cancel to review.')
    );

    if (!confirmSubmit) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/applications/${applicationId}/bli04`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          finalSubmission: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit BLI-04 form');
      }

      alert(changesRequested 
        ? '✅ BLI-04 form resubmitted to coordinator successfully!\n\nThe coordinator will now review your updated submission.'
        : '✅ BLI-04 form submitted to coordinator successfully!\n\nThe coordinator will now review and verify your submission.');
      setIsSubmittedToCoordinator(true);
      setChangesRequested(false);
      window.location.reload();
    } catch (error) {
      console.error('Error submitting form:', error);
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
                    The coordinator has reviewed your BLI-04 submission and requested changes.
                  </p>
                  {coordinatorComments && (
                    <div className="mt-3 p-3 bg-white rounded border border-orange-200">
                      <p className="text-sm font-medium text-gray-700">Coordinator's Comments:</p>
                      <p className="text-sm text-gray-600 mt-1">{coordinatorComments}</p>
                    </div>
                  )}
                  <div className="mt-3 p-3 bg-white rounded border border-orange-200">
                    <p className="text-sm font-medium text-gray-700">⚠️ Important:</p>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                      <li>Make the necessary corrections to the form</li>
                      <li>Save your updated draft</li>
                      <li>Generate a new supervisor link</li>
                      <li>Your supervisor must sign the updated form again</li>
                      <li>After supervisor signs, resubmit to coordinator</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isSubmittedToCoordinator && !changesRequested && (
        <div className="max-w-4xl mx-auto mb-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Submitted to Coordinator</h3>
                  <p className="text-sm text-blue-700">
                    Your BLI-04 form has been submitted to the coordinator for verification.
                    You will be notified once it has been reviewed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isSigned && !isSubmittedToCoordinator && !changesRequested && (
        <div className="max-w-4xl mx-auto mb-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Supervisor Confirmed</h3>
                  <p className="text-sm text-green-700">
                    Your supervisor has confirmed your reporting duty on {new Date(signedAt!).toLocaleDateString()}.
                    You can now submit this form to the coordinator for final verification.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {(() => {
        console.log('Link card condition check:', {
          supervisorLink: !!supervisorLink,
          isSigned,
          isSubmittedToCoordinator,
          changesRequested,
          shouldShow: supervisorLink && !isSubmittedToCoordinator
        });
        return supervisorLink && !isSubmittedToCoordinator;
      })() && (
        <div className="max-w-4xl mx-auto mb-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Supervisor Link Generated
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-blue-900">Share this link with your supervisor:</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={supervisorLink ?? ""}
                    readOnly
                    className="bg-white"
                  />
                  <Button type="button" onClick={copyLinkToClipboard} variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Clock className="h-4 w-4" />
                Link expires on {new Date(linkExpiry!).toLocaleDateString()} at {new Date(linkExpiry!).toLocaleTimeString()}
              </div>
              <p className="text-sm text-blue-700">
                Your supervisor will use this link to confirm your reporting duty and provide their signature.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <form onSubmit={handleSubmit(onSaveDraft)} className="max-w-4xl mx-auto space-y-6">
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

        {/* Supervisor Signature Display */}
        {isSigned && supervisorSignature && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Supervisor Signature
              </CardTitle>
              <CardDescription>
                Your supervisor has confirmed your reporting duty
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Supervisor Name</Label>
                  <p className="font-medium">{supervisorName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Reporting Date</Label>
                  <p className="font-medium">{reportingDate ? new Date(reportingDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Signed At</Label>
                  <p className="font-medium">{new Date(signedAt!).toLocaleDateString()} at {new Date(signedAt!).toLocaleTimeString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Signature Type</Label>
                  <Badge>{supervisorSignatureType === 'typed' ? 'Typed Signature' : 'Drawn Signature'}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Signature</Label>
                {supervisorSignatureType === 'typed' ? (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="font-serif text-3xl text-center">{supervisorSignature}</p>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-white">
                    <img src={supervisorSignature} alt="Supervisor Signature" className="max-w-md mx-auto" />
                  </div>
                )}
              </div>
              {!isSubmittedToCoordinator && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    ✅ Your supervisor has signed the form. You can now submit it to the coordinator for final verification.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Workflow Instructions */}
        {!isSigned && (
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                Follow these steps to complete your BLI-04 form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Fill out the form above</h4>
                    <p className="text-sm text-gray-600">Complete all required fields with accurate information</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Save your draft</h4>
                    <p className="text-sm text-gray-600">Click the "Save Draft" button below to save your information</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Generate supervisor link</h4>
                    <p className="text-sm text-gray-600">After saving, generate a secure link for your supervisor</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold">Share with supervisor</h4>
                    <p className="text-sm text-gray-600">Send the link to your industrial supervisor to confirm and sign</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold">Submit to coordinator</h4>
                    <p className="text-sm text-gray-600">After supervisor signs, submit the form to coordinator for verification</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between gap-4">
          <Link href="/student/applications">
            <Button variant="outline" type="button">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex gap-4">
            {!isSubmittedToCoordinator && (
              <>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  onClick={onGenerateLink} 
                  disabled={isGeneratingLink}
                  variant="default"
                >
                  {isGeneratingLink ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Generate Supervisor Link
                    </>
                  )}
                </Button>
              </>
            )}
            {isSigned && !isSubmittedToCoordinator && (
              <Button 
                type="button" 
                onClick={onSubmitToCoordinator} 
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {changesRequested ? 'Resubmitting...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {changesRequested ? 'Resubmit to Coordinator' : 'Submit to Coordinator'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </main>
  );
}
