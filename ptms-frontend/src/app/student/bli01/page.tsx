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
import { ArrowLeft, Save, Loader2, Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { applicationsApi, Session } from "@/lib/api/applications";
import { authService } from "@/lib/auth";

const bli01Schema = z.object({
  studentName: z.string().min(1, "Student name is required"),
  icNo: z.string().min(1, "NRIC is required"),
  matricNo: z.string().min(1, "UiTM Student Number is required"),
  trainingSession: z.string().min(1, "Training session is required"),
  cgpa: z.string().min(1, "CGPA is required"),
  program: z.string().min(1, "Program is required"),
  faculty: z.string().min(1, "Faculty is required"),
});

type BLI01FormData = z.infer<typeof bli01Schema>;

export default function BLI01FormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [submittedApplicationId, setSubmittedApplicationId] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BLI01FormData>({
    resolver: zodResolver(bli01Schema),
  });

  useEffect(() => {
    async function loadData() {
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        alert('Please login first to access this page.');
        router.push('/login');
        return;
      }

      try {
        const [profileResponse, sessionsResponse, applicationsResponse] = await Promise.all([
          applicationsApi.getUserProfile(),
          applicationsApi.getActiveSessions(),
          applicationsApi.getMyApplications(),
        ]);

        const profile = profileResponse.profile;
        const activeSessions = sessionsResponse.sessions;
        const applications = applicationsResponse.applications;

        if (activeSessions) {
          setSessions(activeSessions);
        }

        if (profile) {
          if (profile.name) setValue('studentName', profile.name);
          if (profile.phone) setValue('icNo', profile.phone);
          if (profile.matricNo) setValue('matricNo', profile.matricNo);
          if (profile.program) setValue('program', profile.program);
          if (profile.assignedSession) {
            setValue('trainingSession', profile.assignedSession.id);
            setSelectedSession(profile.assignedSession.id);
          }
        }

        // Check if user already has an application with BLI-01 form
        if (applications && applications.length > 0) {
          const existingApp = applications.find(app => 
            app.formResponses?.some((form: any) => form.formTypeEnum === 'BLI_01')
          );
          if (existingApp) {
            setSubmittedApplicationId(existingApp.id);
          }
        }
      } catch (error: any) {
        console.error('Error loading data:', error);
        
        // If unauthorized, redirect to login
        if (error.message === 'Unauthorized') {
          alert('Your session has expired. Please login again.');
          authService.clearTokens();
          router.push('/login');
        } else {
          alert('Error loading profile data. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [setValue, router]);

  const onSubmit = async (data: BLI01FormData) => {
    // If there's already a submitted application, warn the user
    if (submittedApplicationId) {
      const confirmRegenerate = window.confirm(
        "⚠️ WARNING: You already have a BLI-01 application!\n\n" +
        "Generating a new PDF will:\n" +
        "• DELETE your previous application from the database\n" +
        "• REMOVE all associated data (documents, reviews, etc.)\n" +
        "• CREATE a completely new application\n\n" +
        "Are you sure you want to continue?"
      );

      if (!confirmRegenerate) {
        return; // User cancelled
      }
    }

    setIsSubmitting(true);
    try {
      // Submit the form (backend will delete old application if exists)
      const response = await applicationsApi.createApplication(data);
      const applicationId = response.application.id;
      setSubmittedApplicationId(applicationId);
      
      // Automatically download PDF after submission
      const blob = await applicationsApi.downloadBLI01PDF(applicationId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BLI-01-${applicationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      if (submittedApplicationId) {
        alert("✅ Previous application deleted and new BLI-01 form generated successfully!\n\nPDF has been downloaded.");
      } else {
        alert("✅ BLI-01 form submitted and PDF downloaded successfully!");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      alert(error.message || "Error submitting form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!submittedApplicationId) {
      alert("Please submit the form first before downloading the PDF.");
      return;
    }

    setIsDownloading(true);
    try {
      const blob = await applicationsApi.downloadBLI01PDF(submittedApplicationId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BLI-01-${submittedApplicationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert("PDF downloaded successfully!");
    } catch (error: any) {
      console.error("Error downloading PDF:", error);
      alert(error.message || "Error downloading PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/student/applications">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">BLI-01 Form</h1>
        <p className="text-gray-600">Student Information and Internship Application Form</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>BLI-01 Application Form</CardTitle>
            <CardDescription>Please verify and complete your information below. Fields marked with existing data are auto-filled from your profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentName">Name of Student <span className="text-red-500">*</span></Label>
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
                <Label htmlFor="icNo">NRIC <span className="text-red-500">*</span></Label>
                <Input
                  id="icNo"
                  {...register("icNo")}
                  placeholder="e.g., 123456-78-9012"
                />
                {errors.icNo && (
                  <p className="text-sm text-red-600 mt-1">{errors.icNo.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="matricNo">UiTM Student Number <span className="text-red-500">*</span></Label>
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
                <Label htmlFor="trainingSession">Training Session <span className="text-red-500">*</span></Label>
                <Select 
                  value={selectedSession} 
                  onValueChange={(value) => {
                    setValue("trainingSession", value);
                    setSelectedSession(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select training session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.length > 0 ? (
                      sessions.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.name} ({session.semester})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No active sessions available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.trainingSession && (
                  <p className="text-sm text-red-600 mt-1">{errors.trainingSession.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="cgpa">CGPA <span className="text-red-500">*</span></Label>
                <Input
                  id="cgpa"
                  {...register("cgpa")}
                  placeholder="e.g., 3.45"
                  step="0.01"
                />
                {errors.cgpa && (
                  <p className="text-sm text-red-600 mt-1">{errors.cgpa.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="program">Program <span className="text-red-500">*</span></Label>
                <Input
                  id="program"
                  {...register("program")}
                  placeholder="e.g., Bachelor of Computer Science"
                />
                {errors.program && (
                  <p className="text-sm text-red-600 mt-1">{errors.program.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="faculty">Faculty <span className="text-red-500">*</span></Label>
                <Select onValueChange={(value) => setValue("faculty", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Faculty of Applied Science (Fakulti Sains Gunaan)">Faculty of Applied Science (Fakulti Sains Gunaan)</SelectItem>
                    <SelectItem value="Faculty of Built Environment (Fakulti Alam Bina)">Faculty of Built Environment (Fakulti Alam Bina)</SelectItem>
                    <SelectItem value="Faculty of Electrical Engineering (Fakulti Kejuruteraan Elektrik)">Faculty of Electrical Engineering (Fakulti Kejuruteraan Elektrik)</SelectItem>
                    <SelectItem value="Faculty of Civil Engineering (Fakulti Kejuruteraan Awam)">Faculty of Civil Engineering (Fakulti Kejuruteraan Awam)</SelectItem>
                    <SelectItem value="Faculty of Mechanical Engineering (Fakulti Kejuruteraan Mekanikal)">Faculty of Mechanical Engineering (Fakulti Kejuruteraan Mekanikal)</SelectItem>
                    <SelectItem value="Faculty of Chemical Engineering (Fakulti Kejuruteraan Kimia)">Faculty of Chemical Engineering (Fakulti Kejuruteraan Kimia)</SelectItem>
                    <SelectItem value="Faculty of Plantation & Agrotechnology (Fakulti Perladangan & Agroteknologi)">Faculty of Plantation & Agrotechnology (Fakulti Perladangan & Agroteknologi)</SelectItem>
                    <SelectItem value="Faculty of Sports Science & Recreation (Fakulti Sains Sukan dan Rekreasi)">Faculty of Sports Science & Recreation (Fakulti Sains Sukan dan Rekreasi)</SelectItem>
                    <SelectItem value="Faculty of Medicine (Fakulti Perubatan)">Faculty of Medicine (Fakulti Perubatan)</SelectItem>
                    <SelectItem value="Faculty of Pharmacy (Fakulti Farmasi)">Faculty of Pharmacy (Fakulti Farmasi)</SelectItem>
                    <SelectItem value="Faculty of Dentistry (Fakulti Pergigian)">Faculty of Dentistry (Fakulti Pergigian)</SelectItem>
                    <SelectItem value="Faculty of Health Sciences (Fakulti Sains Kesihatan)">Faculty of Health Sciences (Fakulti Sains Kesihatan)</SelectItem>
                    <SelectItem value="Faculty of Computer & Mathematical Sciences (Fakulti Sains Komputer & Matematik)">Faculty of Computer & Mathematical Sciences (Fakulti Sains Komputer & Matematik)</SelectItem>
                    <SelectItem value="Faculty of Art & Design (Fakulti Seni & Reka)">Faculty of Art & Design (Fakulti Seni & Reka)</SelectItem>
                    <SelectItem value="Faculty of Education (Fakulti Pendidikan)">Faculty of Education (Fakulti Pendidikan)</SelectItem>
                    <SelectItem value="Faculty of Music (Fakulti Muzik)">Faculty of Music (Fakulti Muzik)</SelectItem>
                    <SelectItem value="Faculty of Law (Fakulti Undang-Undang)">Faculty of Law (Fakulti Undang-Undang)</SelectItem>
                    <SelectItem value="Faculty of Communication & Media Studies (Fakulti Komunikasi & Media)">Faculty of Communication & Media Studies (Fakulti Komunikasi & Media)</SelectItem>
                    <SelectItem value="Faculty of Film, Theatre & Animation (Fakulti Filem, Teater & Animasi)">Faculty of Film, Theatre & Animation (Fakulti Filem, Teater & Animasi)</SelectItem>
                    <SelectItem value="Faculty of Information Science (Fakulti Sains Maklumat / Pengurusan Maklumat)">Faculty of Information Science (Fakulti Sains Maklumat / Pengurusan Maklumat)</SelectItem>
                    <SelectItem value="Faculty of Administrative Science & Policy Studies (Fakulti Sains Pentadbiran & Pengajian Polisi)">Faculty of Administrative Science & Policy Studies (Fakulti Sains Pentadbiran & Pengajian Polisi)</SelectItem>
                    <SelectItem value="Faculty of Accountancy (Fakulti Perakaunan)">Faculty of Accountancy (Fakulti Perakaunan)</SelectItem>
                    <SelectItem value="Faculty of Business Management (Fakulti Pengurusan Perniagaan)">Faculty of Business Management (Fakulti Pengurusan Perniagaan)</SelectItem>
                    <SelectItem value="Faculty of Hotel & Tourism Management (Fakulti Pengurusan Hotel & Pelancongan)">Faculty of Hotel & Tourism Management (Fakulti Pengurusan Hotel & Pelancongan)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.faculty && (
                  <p className="text-sm text-red-600 mt-1">{errors.faculty.message}</p>
                )}
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Fields with auto-filled data are from your profile. Please verify all information is correct before submitting.
              </p>
            </div>
            {submittedApplicationId && (
              <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-300 rounded-md">
                <p className="text-sm text-orange-900 font-semibold mb-2">
                  ⚠️ WARNING: You already have a submitted BLI-01 application!
                </p>
                <p className="text-sm text-orange-800">
                  If you generate a new PDF, your <strong>previous application will be permanently deleted</strong> from the database, including all associated documents and reviews. Only proceed if you need to correct information or regenerate the form.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between gap-4">
          <Link href="/student/applications">
            <Button variant="outline" type="button">
              {submittedApplicationId ? "Back to Applications" : "Cancel"}
            </Button>
          </Link>
          <div className="flex gap-4">
            {submittedApplicationId && (
              <Button 
                type="button" 
                variant="secondary"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  {submittedApplicationId ? "Regenerate PDF" : "Generate PDF"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
