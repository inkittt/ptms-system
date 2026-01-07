"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, BookOpen, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { sessionsApi, StudentSession } from "@/lib/api/sessions";
import { authService } from "@/lib/auth";

export default function StudentSessionPage() {
  const [studentSession, setStudentSession] = useState<StudentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const token = authService.getAccessToken();
      if (!token) return;

      try {
        setLoading(true);
        const data = await sessionsApi.getMySession(token);
        setStudentSession(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load session information");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!studentSession) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Session</h1>
            <p className="text-sm text-gray-600">View your internship session details</p>
          </div>
        </header>

        <main className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You are not enrolled in any active session. Please contact your coordinator to be added to a session.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const { session, creditsEarned, isEligible } = studentSession;
  const deadlines = session.deadlinesJSON || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{session.name || `${session.year} Semester ${session.semester}`}</h1>
          <p className="text-sm text-gray-600">View your internship session details</p>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        {!isEligible && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              You are not eligible for this session. You have {creditsEarned} credits, but {session.minCredits} credits are required.
              Please contact your coordinator for more information.
            </AlertDescription>
          </Alert>
        )}

        {isEligible && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              You are eligible for this session with {creditsEarned} credits earned.
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Session Information
            </CardTitle>
            <CardDescription>
              {session.name || `${session.year} Semester ${session.semester}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Academic Period</p>
                <p className="text-lg font-semibold">
                  {session.year} Semester {session.semester}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant={session.isActive ? "default" : "secondary"}>
                  {session.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">
                  {session.minWeeks} - {session.maxWeeks} weeks
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Coordinator</p>
              <p className="font-medium">{session.coordinator?.name || 'Academic Coordinator'}</p>
              {session.coordinator?.email && (
                <p className="text-xs text-gray-500">{session.coordinator.email}</p>
              )}
              {!session.coordinator?.email && (
                <p className="text-xs text-gray-500">Contact your coordinator for any inquiries</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Session Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Session Name</p>
                <p className="text-lg font-semibold">
                  {session.name || `${session.year} Semester ${session.semester}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created On</p>
                <p className="font-medium">
                  {new Date(session.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">
                  {new Date(session.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Eligibility Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Credits Earned</p>
                <p className="text-lg font-semibold">{creditsEarned}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Minimum Required</p>
                <p className="font-medium">{session.minCredits} credits</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Eligibility</p>
                <Badge variant={isEligible ? "default" : "destructive"}>
                  {isEligible ? "Eligible" : "Not Eligible"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Important Deadlines
            </CardTitle>
            <CardDescription>
              Make sure to submit all required documents before the deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deadlines.applicationDeadline && (
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Application Deadline</p>
                    <p className="text-sm text-gray-600">Submit your internship application</p>
                  </div>
                  <p className="text-lg font-semibold">
                    {new Date(deadlines.applicationDeadline).toLocaleDateString()}
                  </p>
                </div>
              )}

              {deadlines.bli03Deadline && (
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">BLI-03 Submission Deadline</p>
                    <p className="text-sm text-gray-600">Submit BLI-03 form</p>
                  </div>
                  <p className="text-lg font-semibold">
                    {new Date(deadlines.bli03Deadline).toLocaleDateString()}
                  </p>
                </div>
              )}

              {deadlines.reportingDeadline && (
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Reporting Duty Deadline</p>
                    <p className="text-sm text-gray-600">Report for internship duty</p>
                  </div>
                  <p className="text-lg font-semibold">
                    {new Date(deadlines.reportingDeadline).toLocaleDateString()}
                  </p>
                </div>
              )}

              {!deadlines.applicationDeadline && !deadlines.bli03Deadline && !deadlines.reportingDeadline && (
                <p className="text-gray-500 text-center py-4">No deadlines set for this session</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
