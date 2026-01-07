"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Download, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

// Zod validation schema for SLI-04 letter
const sli04Schema = z.object({
  applicationId: z.string().min(1, "Please select an application"),
  companyName: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  companyOfficer: z.string().min(1, "Company officer name is required"),
  companyOfficerPosition: z.string().min(1, "Officer position is required"),
  companyAddress: z.string().min(1, "Company address is required"),
  referenceNumber: z.string().optional(),
  offerDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type SLI04FormData = z.infer<typeof sli04Schema>;

interface Application {
  id: string;
  company?: {
    name: string;
    address?: string;
  };
  organizationName?: string;
  organizationAddress?: string;
  startDate?: string;
  endDate?: string;
  status: string;
}

interface UserProfile {
  name: string;
  matricNo: string;
  program: string;
  email: string;
  phone?: string;
}


export default function SLI04FormPage() {
  const { getToken } = useAuth();
  const token = getToken();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SLI04FormData>({
    resolver: zodResolver(sli04Schema),
  });

  const applicationId = watch("applicationId");

  useEffect(() => {
    fetchApplicationsAndProfile();
  }, []);

  useEffect(() => {
    if (applicationId) {
      const app = applications.find(a => a.id === applicationId);
      if (app) {
        setSelectedApplication(app);
        autoFillApplicationData(app);
      }
    }
  }, [applicationId, applications]);

  const fetchApplicationsAndProfile = async () => {
    try {
      setIsLoading(true);
      const [appsRes, profileRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (appsRes.ok && profileRes.ok) {
        const appsData = await appsRes.json();
        const profileData = await profileRes.json();
        setApplications(appsData.applications || []);
        setUserProfile(profileData.profile);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const autoFillApplicationData = (app: Application) => {
    const companyName = app.company?.name || app.organizationName || "";
    const companyAddress = app.company?.address || app.organizationAddress || "";
    
    setValue("companyName", companyName);
    setValue("companyAddress", companyAddress);
    if (app.startDate) setValue("startDate", app.startDate.split("T")[0]);
    if (app.endDate) setValue("endDate", app.endDate.split("T")[0]);
  };

  const onSubmit = async (data: SLI04FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${data.applicationId}/sli04/pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            companyName: data.companyName,
            position: data.position,
            referenceNumber: data.referenceNumber,
            offerDate: data.offerDate,
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = `SLI-04-${data.applicationId}.pdf`;
        link.click();
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
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
        <h1 className="text-3xl font-bold text-gray-900">SLI-04 Rejection Letter</h1>
        <p className="text-gray-600">Penolakan Tawaran Menjalani Latihan Industri</p>
      </div>

      {/* Info Card */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">About SLI-04 Rejection Letter</p>
              <p>This form generates a formal rejection letter for industrial training offers. The letter will be auto-filled with your information and the selected application details.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Generated Display */}
      {pdfUrl && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">SLI-04 PDF Generated Successfully</p>
                <p className="text-sm text-green-700">Your rejection letter has been downloaded</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = pdfUrl;
                  link.download = `SLI-04-${applicationId}.pdf`;
                  link.click();
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
        {/* Application Selection Section */}
        <Card>
          <CardHeader>
            <CardTitle>Select Application</CardTitle>
            <CardDescription>Choose the application you want to reject</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="applicationId">Application</Label>
              <Select onValueChange={(value) => setValue("applicationId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an application" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.company?.name || app.organizationName || "Unknown Company"} - {app.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.applicationId && (
                <p className="text-sm text-red-600 mt-1">{errors.applicationId.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Student Information (Auto-filled) */}
        {userProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>Auto-filled from your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Name</Label>
                  <p className="font-medium">{userProfile.name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Matric Number</Label>
                  <p className="font-medium">{userProfile.matricNo}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Program</Label>
                  <p className="font-medium">{userProfile.program}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-medium">{userProfile.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Company Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Company & Offer Details</CardTitle>
            <CardDescription>Information about the company and offer (auto-filled where available)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  {...register("companyName")}
                  placeholder="Enter company name"
                />
                {errors.companyName && (
                  <p className="text-sm text-red-600 mt-1">{errors.companyName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="position">Position Offered</Label>
                <Input
                  id="position"
                  {...register("position")}
                  placeholder="e.g., Software Engineer Intern"
                />
                {errors.position && (
                  <p className="text-sm text-red-600 mt-1">{errors.position.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="companyAddress">Company Address</Label>
              <Input
                id="companyAddress"
                {...register("companyAddress")}
                placeholder="Enter full company address"
              />
              {errors.companyAddress && (
                <p className="text-sm text-red-600 mt-1">{errors.companyAddress.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyOfficer">Company Officer Name</Label>
                <Input
                  id="companyOfficer"
                  {...register("companyOfficer")}
                  placeholder="Name of person to address"
                />
                {errors.companyOfficer && (
                  <p className="text-sm text-red-600 mt-1">{errors.companyOfficer.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="companyOfficerPosition">Officer Position</Label>
                <Input
                  id="companyOfficerPosition"
                  {...register("companyOfficerPosition")}
                  placeholder="e.g., HR Manager"
                />
                {errors.companyOfficerPosition && (
                  <p className="text-sm text-red-600 mt-1">{errors.companyOfficerPosition.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="referenceNumber">Offer Letter Reference Number (Optional)</Label>
                <Input
                  id="referenceNumber"
                  {...register("referenceNumber")}
                  placeholder="Reference number from offer letter"
                />
              </div>
              <div>
                <Label htmlFor="offerDate">Offer Letter Date (Optional)</Label>
                <Input
                  id="offerDate"
                  type="date"
                  {...register("offerDate")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Training Start Date (Optional)</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Training End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                />
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Generate PDF Button */}
        <div className="flex justify-end gap-4">
          <Link href="/student/applications">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || !applicationId}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate SLI-04 PDF
              </>
            )}
          </Button>
        </div>
      </form>
    </main>
  );
}
