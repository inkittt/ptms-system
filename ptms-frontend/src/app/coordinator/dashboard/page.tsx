"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical,
  BarChart3,
  FileText,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { reportsApi } from "@/lib/api/reports";

interface DashboardStats {
  totalApplications: number;
  totalStudents: number;
  pendingReview: number;
  approved: number;
  overdue: number;
  sli03Issued: number;
}

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export default function CoordinatorDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [overviewResponse, distributionResponse] = await Promise.all([
          reportsApi.getOverviewStats(),
          reportsApi.getStatusDistribution(),
        ]);

        setStats(overviewResponse.stats);
        setStatusDistribution(distributionResponse.distribution || []);
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string; icon: any }> = {
      SUBMITTED: { variant: "info", label: "Submitted", icon: Clock },
      UNDER_REVIEW: { variant: "warning", label: "Under Review", icon: Eye },
      CHANGES_REQUESTED: { variant: "destructive", label: "Changes Requested", icon: AlertTriangle },
      APPROVED: { variant: "success", label: "Approved", icon: CheckCircle },
      SLI_03_ISSUED: { variant: "success", label: "SLI-03 Issued", icon: FileCheck },
      REPORTED: { variant: "success", label: "Reported", icon: CheckCircle },
      REJECTED: { variant: "destructive", label: "Rejected", icon: XCircle },
    };

    const config = statusConfig[status] || { variant: "outline", label: status, icon: Clock };
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Coordinator Portal</h1>
            <p className="text-sm text-gray-600">Loading dashboard...</p>
          </div>
        </header>
        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Coordinator Portal</h1>
          </div>
        </header>
        <main className="p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900 mb-1">Error Loading Dashboard</p>
                  <p className="text-sm text-red-800">{error || "Failed to load dashboard data"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Prepare chart data from status distribution
  const chartData = statusDistribution.map(item => ({
    name: item.status,
    value: item.count,
    fill: item.status === 'PENDING' ? '#F59E0B' : 
          item.status === 'APPROVED' ? '#10B981' : 
          item.status === 'SUBMITTED' ? '#3B82F6' : '#8B5CF6'
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="w-full">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Coordinator Portal</h1>
            <p className="text-sm text-gray-600">Practical Training Management System</p>
          </div>
        </header>

        <main className="p-6">
          {/* Status Review Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Applications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All submitted applications
                </p>
              </CardContent>
            </Card>

            {/* Total Approved */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Approved applications
                </p>
              </CardContent>
            </Card>

            {/* Total Pending */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
                <Clock className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{stats.pendingReview}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting review
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-4">Application Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
    </div>
  </div>
  );
}

// Application Card Component
function ApplicationCard({ 
  application, 
  getStatusBadge 
}: { 
  application: any; 
  getStatusBadge: (status: string) => JSX.Element;
}) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900">{application.student.name}</h3>
            {getStatusBadge(application.status)}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
            <div>
              <span className="font-medium">Matric No:</span> {application.student.matricNo}
            </div>
            <div>
              <span className="font-medium">Program:</span> {application.student.program}
            </div>
            <div className="col-span-2">
              <span className="font-medium">Company:</span> {application.company}
            </div>
            <div>
              <span className="font-medium">Submitted:</span>{" "}
              {new Date(application.submittedAt).toLocaleDateString("en-MY")}
            </div>
            <div>
              <span className="font-medium">Waiting:</span>{" "}
              <span className={application.daysWaiting > 7 ? "text-red-600 font-semibold" : ""}>
                {application.daysWaiting} days
              </span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-2">
        <Button size="sm" className="flex-1">
          <Eye className="h-4 w-4 mr-2" />
          Review
        </Button>
        <Button size="sm" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Documents
        </Button>
      </div>
    </div>
  );
}
