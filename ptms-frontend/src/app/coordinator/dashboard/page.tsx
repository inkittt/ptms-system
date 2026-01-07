"use client";

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

// Mock data - will be replaced with API calls
const mockStats = {
  totalApplications: 45,
  eligible: 52,
  pending: 12,
  underReview: 8,
  changesRequested: 5,
  approved: 15,
  sli03Issued: 10,
  reported: 8,
  overdue: 3,
  completed: 5,
};

const chartData = [
  { name: 'Pending', value: mockStats.pending, fill: '#F59E0B' },
  { name: 'Approved', value: mockStats.approved, fill: '#10B981' },
  { name: 'Reported', value: mockStats.reported, fill: '#8B5CF6' },
];

const mockApplications = [
  {
    id: "app-001",
    student: {
      name: "Ahmad Bin Abdullah",
      matricNo: "2021234567",
      program: "CS251",
    },
    company: "Tech Solutions Sdn Bhd",
    status: "UNDER_REVIEW",
    submittedAt: "2024-11-20T10:00:00Z",
    daysWaiting: 5,
  },
  {
    id: "app-002",
    student: {
      name: "Siti Nurhaliza",
      matricNo: "2021234568",
      program: "CS251",
    },
    company: "Digital Innovations",
    status: "CHANGES_REQUESTED",
    submittedAt: "2024-11-18T14:30:00Z",
    daysWaiting: 7,
  },
  {
    id: "app-003",
    student: {
      name: "Muhammad Ali",
      matricNo: "2021234569",
      program: "CS251",
    },
    company: "Software House Malaysia",
    status: "APPROVED",
    submittedAt: "2024-11-15T09:00:00Z",
    daysWaiting: 10,
  },
];

export default function CoordinatorDashboard() {
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {mockStats.eligible} students eligible
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{mockStats.pending}</div>
              <p className="text-xs text-muted-foreground">
                {mockStats.underReview} under review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{mockStats.approved}</div>
              <p className="text-xs text-muted-foreground">
                {mockStats.sli03Issued} SLI-03 issued
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{mockStats.overdue}</div>
              <p className="text-xs text-muted-foreground">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>
        </div>





        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
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
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-4">Task Queue</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-800">Overdue Reviews</span>
                </div>
                <span className="font-bold text-red-600">{mockStats.overdue}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-blue-800">Issue SLI-03 Letters</span>
                </div>
                <span className="font-bold text-blue-600">{mockStats.sli03Issued}</span>
              </div>
            </div>
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
