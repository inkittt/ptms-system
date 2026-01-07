"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimelineItem } from "@/components/ui/timeline-item";
import {
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  ArrowRight,
  Download,
  Clock,
  Eye,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { studentsApi, StudentDashboardData } from "@/lib/api/students";
import { authService } from "@/lib/auth";
import { useEffect, useState } from "react";





export default function StudentDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = authService.getAccessToken();
        if (!token) {
          setError("No authentication token found");
          return;
        }
        const data = await studentsApi.getDashboardData(token);
        setDashboardData(data);
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </main>
    );
  }

  if (error || !dashboardData) {
    return (
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 mb-1">Error Loading Dashboard</p>
                <p className="text-sm text-red-800">{error || "Failed to load dashboard data"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { student, session, application } = dashboardData;

  return (
    <main className="flex-1 p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {student.name}</p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Eligibility Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {student.isEligible ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              Eligibility Status
            </CardTitle>
            <CardDescription>
              Your eligibility for practical training application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Credits Earned</p>
                <p className="text-2xl font-bold text-gray-900">{student.creditsEarned}</p>
                <p className="text-xs text-gray-500">Minimum required: {session?.minCredits || 113}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Program</p>
                <p className="text-sm font-medium text-gray-900">{student.program}</p>
              </div>
            </div>
            {student.isEligible ? (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  ✓ You are eligible to apply for practical training
                </p>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  ✗ You are not eligible yet. Please ensure you have completed at least {session?.minCredits || 113} credits.
                </p>
              </div>
            )}
          </CardContent>
        </Card>



        {/* Progress Tracker */}
        {application && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <h3 className="font-semibold text-gray-900 mb-6">Application Roadmap</h3>
            <div className="relative">
              <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200"></div>

              <TimelineItem
                status="completed"
                title="Eligibility Check"
                desc={`System verified your credits (${student.creditsEarned}/${session?.minCredits || 113}).`}
              />
              <TimelineItem
                status={application.status === "DRAFT" ? "current" : "completed"}
                title="Submit BLI-01 Application"
                desc="Fill personal and academic details."
              />
              <TimelineItem
                status={application.status === "DRAFT" ? "upcoming" : "current"}
                title="Upload Offer Letter (BLI-02)"
                desc="Upload signed offer letter from company."
              />
              <TimelineItem
                status="upcoming"
                title="Coordinator Review"
                desc="Wait for approval to generate SLI-03."
              />
              <TimelineItem
                status="upcoming"
                title="Reporting Duty (BLI-04)"
                desc="Supervisor confirms your first day."
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!application && student.isEligible && session && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Start your practical training application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/student/bli01">
                  <Button size="lg" className="h-auto py-6 flex-col gap-2 w-full">
                    <FileText className="h-8 w-8" />
                    <span className="text-base font-semibold">Start New Application</span>
                    <span className="text-xs font-normal opacity-80">
                      Begin your LI application process
                    </span>
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-auto py-6 flex-col gap-2">
                  <Download className="h-8 w-8" />
                  <span className="text-base font-semibold">Download Forms</span>
                  <span className="text-xs font-normal opacity-80">
                    Get blank forms and templates
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Active Session Message */}
        {!session && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900 mb-1">No Active Session</p>
                  <p className="text-sm text-yellow-800">
                    You are not currently enrolled in an active practical training session. 
                    Please contact your coordinator for more information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}



        {/* Important Notice */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 mb-1">Important Information</p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Ensure all documents are uploaded before the deadline</li>
                  <li>Official LI dates will be based on SLI-03 only</li>
                  <li>Internships beyond 14 weeks require special acknowledgment</li>
                  <li>Check your email regularly for updates from the coordinator</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
