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



        {/* Application Status & Next Steps */}
        {application && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Application Status & Next Steps
              </CardTitle>
              <CardDescription>Your current progress and what to do next</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-3">Document Progress</p>
                  <div className="space-y-2">
                    {/* BLI-01 */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">BLI-01</span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                        {application.status === "APPROVED" || application.status === "SUBMITTED" ? "Approved" : application.status === "PENDING" ? "Under Review" : "Submitted"}
                      </span>
                    </div>

                    {/* BLI-02 */}
                    {(() => {
                      const bli02 = application.documents?.find(d => d.type === "BLI_02");
                      return bli02 ? (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">BLI-02</span>
                          </div>
                          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                            {bli02.status === "APPROVED" ? "Approved" : bli02.status === "PENDING" ? "Under Review" : "Submitted"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 opacity-50">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">BLI-02</span>
                          </div>
                          <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">Not submitted</span>
                        </div>
                      );
                    })()}

                    {/* BLI-03 */}
                    {(() => {
                      const bli03 = application.documents?.find(d => d.type === "BLI_03");
                      return bli03 ? (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">BLI-03</span>
                          </div>
                          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                            {bli03.status === "APPROVED" ? "Approved" : bli03.status === "PENDING" ? "Under Review" : "Submitted"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 opacity-50">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">BLI-03</span>
                          </div>
                          <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">Not submitted</span>
                        </div>
                      );
                    })()}

                    {/* BLI-04 */}
                    {(() => {
                      const bli04 = application.documents?.find(d => d.type === "BLI_04");
                      return bli04 ? (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">BLI-04</span>
                          </div>
                          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                            {bli04.status === "APPROVED" ? "Approved" : bli04.status === "PENDING" ? "Under Review" : "Submitted"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 opacity-50">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">BLI-04</span>
                          </div>
                          <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">Not submitted</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">Company</p>
                  <p className="text-sm text-gray-900">{application.companyName || "Not specified"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
