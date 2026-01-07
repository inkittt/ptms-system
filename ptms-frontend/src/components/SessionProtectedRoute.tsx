"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { sessionsApi, StudentSession } from "@/lib/api/sessions";
import { authService } from "@/lib/auth";
import { Button } from "@/components/ui/button";

interface SessionProtectedRouteProps {
  children: React.ReactNode;
  requireEligible?: boolean;
}

export default function SessionProtectedRoute({ 
  children, 
  requireEligible = false 
}: SessionProtectedRouteProps) {
  const [studentSession, setStudentSession] = useState<StudentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const token = authService.getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const data = await sessionsApi.getMySession(token);
      
      if (!data) {
        setError("not_enrolled");
      } else if (requireEligible && !data.isEligible) {
        setError("not_eligible");
      } else {
        setStudentSession(data);
      }
    } catch (err: any) {
      setError("fetch_error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking session enrollment...</p>
        </div>
      </div>
    );
  }

  if (error === "not_enrolled") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto mt-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <p className="font-semibold">You are not enrolled in any active session</p>
                <p>
                  You need to be enrolled in an active internship session to access this page. 
                  Please contact your coordinator to be added to a session.
                </p>
                <div className="flex gap-3 mt-4">
                  <Button onClick={() => router.push("/student/dashboard")}>
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/student/session")}>
                    View Session Info
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (error === "not_eligible") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto mt-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <p className="font-semibold">You are not eligible for this session</p>
                <p>
                  You have {studentSession?.creditsEarned} credits, but {studentSession?.session.minCredits} credits are required.
                  Please contact your coordinator for more information.
                </p>
                <div className="flex gap-3 mt-4">
                  <Button onClick={() => router.push("/student/dashboard")}>
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/student/session")}>
                    View Session Details
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (error === "fetch_error") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto mt-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <p className="font-semibold">Failed to load session information</p>
                <p>There was an error loading your session details. Please try again.</p>
                <Button onClick={checkSession}>Retry</Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
