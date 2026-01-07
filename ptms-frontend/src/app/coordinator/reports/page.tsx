"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { exportReportToCSV, exportReportToJSON, printReport, prepareReportData } from "@/lib/simpleExportUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Download,
  FileText,
  TrendingUp,
  Users,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileCheck,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  Printer,
  FileJson,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { reportsApi } from "@/lib/api/reports";
import { sessionsApi, Session } from "@/lib/api/sessions";
import { authService } from "@/lib/auth";

// Mock data - replace with API calls
const mockOverviewStats = {
  totalStudents: 120,
  eligibleStudents: 95,
  totalApplications: 78,
  approvedApplications: 52,
  pendingReview: 15,
  changesRequested: 8,
  rejectedApplications: 3,
  sli03Issued: 45,
  ongoingInternships: 40,
  completedInternships: 35,
  avgReviewTime: 3.5, // days
  avgApprovalRate: 87, // percentage
};

const applicationTrendData = [
  { month: "Jan", submitted: 12, approved: 10, rejected: 1 },
  { month: "Feb", submitted: 15, approved: 13, rejected: 1 },
  { month: "Mar", submitted: 18, approved: 15, rejected: 2 },
  { month: "Apr", submitted: 10, approved: 8, rejected: 0 },
  { month: "May", submitted: 23, approved: 20, rejected: 2 },
];

const statusDistributionData = [
  { name: "Approved", value: 52, color: "#10B981" },
  { name: "Pending Review", value: 15, color: "#F59E0B" },
  { name: "Changes Requested", value: 8, color: "#EF4444" },
  { name: "Rejected", value: 3, color: "#6B7280" },
];

const programDistributionData = [
  { program: "CS251", students: 45, approved: 38, pending: 5, rejected: 2 },
  { program: "CS252", students: 30, approved: 25, pending: 4, rejected: 1 },
  { program: "CS253", students: 25, approved: 20, pending: 4, rejected: 1 },
  { program: "CS254", students: 20, approved: 15, pending: 3, rejected: 2 },
];

const topCompaniesData = [
  { company: "Tech Solutions Sdn Bhd", students: 8, industry: "IT Services" },
  { company: "Digital Innovations", students: 6, industry: "Software" },
  { company: "Malaysia Tech Corp", students: 5, industry: "Technology" },
  { company: "Smart Systems", students: 5, industry: "IT Consulting" },
  { company: "Cloud Services Malaysia", students: 4, industry: "Cloud Computing" },
];

const industryDistributionData = [
  { name: "IT Services", value: 25, color: "#3B82F6" },
  { name: "Software Development", value: 20, color: "#8B5CF6" },
  { name: "Technology", value: 15, color: "#10B981" },
  { name: "Consulting", value: 12, color: "#F59E0B" },
  { name: "Others", value: 6, color: "#6B7280" },
];

const reviewPerformanceData = [
  { week: "Week 1", reviewed: 12, avgTime: 2.5 },
  { week: "Week 2", reviewed: 15, avgTime: 3.0 },
  { week: "Week 3", reviewed: 18, avgTime: 2.8 },
  { week: "Week 4", reviewed: 10, avgTime: 4.2 },
];

const documentTypeData = [
  { type: "SLI-01", total: 78, approved: 70, revisions: 6, rejected: 2, avgReviewTime: 2.5 },
  { type: "SLI-02", total: 65, approved: 58, revisions: 5, rejected: 2, avgReviewTime: 3.2 },
  { type: "Resume", total: 78, approved: 72, revisions: 4, rejected: 2, avgReviewTime: 1.8 },
  { type: "Acceptance Letter", total: 78, approved: 75, revisions: 2, rejected: 1, avgReviewTime: 1.5 },
];

export default function CoordinatorReportsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [dateRange, setDateRange] = useState("6months");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [applicationTrendData, setApplicationTrendData] = useState<any[]>([]);
  const [statusDistributionData, setStatusDistributionData] = useState<any[]>([]);
  const [programDistributionData, setProgramDistributionData] = useState<any[]>([]);
  const [topCompaniesData, setTopCompaniesData] = useState<any[]>([]);
  const [industryDistributionData, setIndustryDistributionData] = useState<any[]>([]);
  const [documentTypeData, setDocumentTypeData] = useState<any[]>([]);
  const [reviewPerformanceData, setReviewPerformanceData] = useState<any[]>([]);
  const [studentProgressData, setStudentProgressData] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchAllData();
    }
  }, [selectedSession, selectedProgram, dateRange]);

  const fetchSessions = async () => {
    try {
      const token = authService.getAccessToken();
      if (!token) throw new Error("No authentication token");

      const data = await sessionsApi.getAll(token);
      setSessions(data);
      
      // Auto-select the first active session or the first session
      const activeSession = data.find(s => s.isActive);
      if (activeSession) {
        setSelectedSession(activeSession.id);
      } else if (data.length > 0) {
        setSelectedSession(data[0].id);
      }
    } catch (err: any) {
      console.error("Failed to fetch sessions:", err);
      setError("Failed to load sessions");
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const monthsMap: { [key: string]: number } = {
        "1month": 1,
        "3months": 3,
        "6months": 6,
        "1year": 12,
        "all": 24,
      };

      const months = monthsMap[dateRange] || 6;

      const [
        overviewRes,
        trendsRes,
        statusRes,
        programRes,
        companiesRes,
        industryRes,
        documentRes,
        performanceRes,
        studentProgressRes,
      ] = await Promise.all([
        reportsApi.getOverviewStats(selectedSession, selectedProgram),
        reportsApi.getApplicationTrends(selectedSession, months),
        reportsApi.getStatusDistribution(selectedSession, selectedProgram),
        reportsApi.getProgramDistribution(selectedSession),
        reportsApi.getTopCompanies(selectedSession),
        reportsApi.getIndustryDistribution(selectedSession),
        reportsApi.getDocumentStats(selectedSession),
        reportsApi.getReviewPerformance(selectedSession),
        reportsApi.getStudentProgress(selectedSession),
      ]);

      setOverviewStats(overviewRes.stats);
      setApplicationTrendData(trendsRes.trends);
      setStatusDistributionData(statusRes.distribution);
      setProgramDistributionData(programRes.distribution);
      setTopCompaniesData(companiesRes.companies);
      setIndustryDistributionData(industryRes.distribution);
      setDocumentTypeData(documentRes.stats);
      setReviewPerformanceData(performanceRes.performance);
      setStudentProgressData(studentProgressRes.progress);
    } catch (err: any) {
      console.error("Failed to fetch reports data:", err);
      const errorMessage = err.message || "Failed to load reports data";
      setError(errorMessage);
      
      // Show more detailed error in console
      if (err.response) {
        console.error("Response error:", err.response);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const reportData = prepareReportData(overviewStats || mockOverviewStats);
    exportReportToCSV(reportData);
  };

  const handleExportJSON = () => {
    const reportData = prepareReportData(overviewStats || mockOverviewStats);
    exportReportToJSON(reportData);
  };

  const handlePrint = () => {
    printReport();
  };

  const handleGenerateReport = () => {
    fetchAllData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Reports</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchAllData}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = overviewStats || mockOverviewStats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-sm text-gray-600">Comprehensive insights and statistics</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportJSON}>
                <FileJson className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Filters Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Session</label>
                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.name} {session.isActive && "(Active)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Program</label>
                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    <SelectItem value="CS251">CS251</SelectItem>
                    <SelectItem value="CS252">CS252</SelectItem>
                    <SelectItem value="CS253">CS253</SelectItem>
                    <SelectItem value="CS254">CS254</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">Last Month</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={handleGenerateReport}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.eligibleStudents} eligible for LI
              </p>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {Math.round((stats.eligibleStudents / stats.totalStudents) * 100)}% eligible
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {stats.approvedApplications} approved
              </p>
              <div className="mt-2">
                <Badge variant="success" className="text-xs">
                  {stats.avgApprovalRate}% approval rate
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Review Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgReviewTime} days</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingReview} pending review
              </p>
              <div className="mt-2">
                <Badge variant="warning" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Target: 3 days
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedInternships}</div>
              <p className="text-xs text-muted-foreground">
                {stats.ongoingInternships} ongoing
              </p>
              <div className="mt-2">
                <Badge variant="success" className="text-xs">
                  {stats.totalApplications > 0 ? Math.round((stats.completedInternships / stats.totalApplications) * 100) : 0}% completion
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Different Report Sections */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Application Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Application Trends</CardTitle>
                  <CardDescription>Monthly submission and approval trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={applicationTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="submitted" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2} />
                      <Line type="monotone" dataKey="rejected" stroke="#EF4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>Current application status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Program-wise Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Program-wise Application Breakdown</CardTitle>
                <CardDescription>Applications by program with status details</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={programDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="program" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="approved" fill="#10B981" name="Approved" />
                    <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                    <Bar dataKey="rejected" fill="#EF4444" name="Rejected" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            {/* Student Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Student Progress Overview</CardTitle>
                <CardDescription>Current status of all students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Not Started</span>
                    </div>
                    <span className="font-bold text-blue-600">
                      {studentProgressData?.summary?.notStarted || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">Application Submitted</span>
                    </div>
                    <span className="font-bold text-yellow-600">
                      {studentProgressData?.summary?.submitted || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Approved & Ongoing</span>
                    </div>
                    <span className="font-bold text-green-600">
                      {studentProgressData?.summary?.ongoing || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Completed</span>
                    </div>
                    <span className="font-bold text-purple-600">
                      {studentProgressData?.summary?.completed || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student List with Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Student Progress Details</CardTitle>
                <CardDescription>Individual student progress tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Student</th>
                        <th className="text-left py-3 px-4 font-medium">Matric No</th>
                        <th className="text-left py-3 px-4 font-medium">Program</th>
                        <th className="text-center py-3 px-4 font-medium">Status</th>
                        <th className="text-center py-3 px-4 font-medium">Progress</th>
                        <th className="text-center py-3 px-4 font-medium">Documents</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentProgressData?.students?.map((student: any) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td 
                            className="py-3 px-4 font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            onClick={() => {
                              setSelectedStudent(student);
                              setStudentDialogOpen(true);
                            }}
                          >
                            {student.name}
                          </td>
                          <td className="py-3 px-4">{student.matricNo}</td>
                          <td className="py-3 px-4">{student.program || 'N/A'}</td>
                          <td className="text-center py-3 px-4">
                            <Badge 
                              variant={
                                student.status === 'Completed' ? 'default' :
                                student.status === 'Approved & Ongoing' ? 'success' :
                                student.status === 'Application Submitted' ? 'warning' :
                                'secondary'
                              }
                              className="text-xs"
                            >
                              {student.status}
                            </Badge>
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    student.progress === 100 ? 'bg-purple-600' :
                                    student.progress >= 50 ? 'bg-green-600' :
                                    student.progress > 0 ? 'bg-yellow-600' :
                                    'bg-gray-400'
                                  }`}
                                  style={{ width: `${student.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{student.progress}%</span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {student.completedSteps}/{student.totalSteps}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(!studentProgressData?.students || studentProgressData.students.length === 0) && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-500">
                            No students enrolled in this session
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Companies */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Companies</CardTitle>
                  <CardDescription>Companies with most student placements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topCompaniesData.map((company, index) => (
                      <div 
                        key={company.company} 
                        className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedCompany(company);
                          setCompanyDialogOpen(true);
                        }}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm hover:text-indigo-600">{company.company}</p>
                          <p className="text-xs text-muted-foreground">{company.industry}</p>
                        </div>
                        <Badge variant="secondary">{company.students} students</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Industry Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Industry Distribution</CardTitle>
                  <CardDescription>Students by industry sector</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={industryDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {industryDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Review Statistics</CardTitle>
                <CardDescription>Performance metrics by document type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Document Type</th>
                        <th className="text-center py-3 px-4 font-medium">Total</th>
                        <th className="text-center py-3 px-4 font-medium">Approved</th>
                        <th className="text-center py-3 px-4 font-medium">Pending Approval</th>
                        <th className="text-center py-3 px-4 font-medium">Change Requests</th>
                        <th className="text-center py-3 px-4 font-medium">Rejected</th>
                        <th className="text-center py-3 px-4 font-medium">Avg Review Time</th>
                        <th className="text-center py-3 px-4 font-medium">Approval Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentTypeData.map((doc) => (
                        <tr key={doc.type} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{doc.type}</td>
                          <td className="text-center py-3 px-4">{doc.total}</td>
                          <td className="text-center py-3 px-4">
                            <Badge variant="success">{doc.approved}</Badge>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {doc.pendingApproval || 0}
                            </Badge>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge variant="warning">{doc.changeRequests || 0}</Badge>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge variant="destructive">{doc.rejected}</Badge>
                          </td>
                          <td className="text-center py-3 px-4">{doc.avgReviewTime} days</td>
                          <td className="text-center py-3 px-4">
                            <span className="font-medium text-green-600">
                              {doc.total > 0 ? Math.round((doc.approved / doc.total) * 100) : 0}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Performance Over Time</CardTitle>
                <CardDescription>Weekly review metrics and average processing time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={reviewPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="reviewed"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                      name="Documents Reviewed"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgTime"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      name="Avg Time (days)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">55</div>
                  <p className="text-xs text-muted-foreground mt-1">Last 4 weeks</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Average Processing Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">3.1 days</div>
                  <p className="text-xs text-green-600 mt-1">↓ 0.4 days from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">First-Time Approval Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">82%</div>
                  <p className="text-xs text-green-600 mt-1">↑ 5% from last month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Company Details Dialog */}
      <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedCompany?.company || "Company Details"}
            </DialogTitle>
            <DialogDescription>
              Detailed information about this company
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Company Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Industry</label>
                <p className="text-base font-medium mt-1">{selectedCompany?.industry || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Student Placements</label>
                <p className="text-base font-medium mt-1">{selectedCompany?.students || 0} students</p>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Information
              </h3>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                {selectedCompany?.contactName && (
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Contact Person</p>
                      <p className="text-sm font-medium">{selectedCompany.contactName}</p>
                    </div>
                  </div>
                )}
                {selectedCompany?.contactEmail && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium">{selectedCompany.contactEmail}</p>
                    </div>
                  </div>
                )}
                {selectedCompany?.contactPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium">{selectedCompany.contactPhone}</p>
                    </div>
                  </div>
                )}
                {selectedCompany?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium">{selectedCompany.address}</p>
                    </div>
                  </div>
                )}
                {!selectedCompany?.contactName && !selectedCompany?.contactEmail && 
                 !selectedCompany?.contactPhone && !selectedCompany?.address && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No contact information available
                  </p>
                )}
              </div>
            </div>

            {/* Students Placed */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Students Placed at This Company</h3>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-blue-600">{selectedCompany?.students || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Total students in this session</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Details Dialog */}
      <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedStudent?.name || "Student Details"}
            </DialogTitle>
            <DialogDescription>
              Student information and progress tracking
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Student Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Matric Number</label>
                <p className="text-base font-medium mt-1">{selectedStudent?.matricNo || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Program</label>
                <p className="text-base font-medium mt-1">{selectedStudent?.program || "N/A"}</p>
              </div>
            </div>

            {/* Progress Status */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Current Status</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <Badge 
                    variant={
                      selectedStudent?.status === 'Completed' ? 'default' :
                      selectedStudent?.status === 'Approved & Ongoing' ? 'success' :
                      selectedStudent?.status === 'Application Submitted' ? 'warning' :
                      'secondary'
                    }
                    className="text-sm px-3 py-1"
                  >
                    {selectedStudent?.status || "Unknown"}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {selectedStudent?.completedSteps || 0}/{selectedStudent?.totalSteps || 5} documents completed
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Overall Progress</span>
                    <span className="font-bold">{selectedStudent?.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        selectedStudent?.progress === 100 ? 'bg-purple-600' :
                        selectedStudent?.progress >= 50 ? 'bg-green-600' :
                        selectedStudent?.progress > 0 ? 'bg-yellow-600' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${selectedStudent?.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Document Checklist */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Document Submission Progress</h3>
              <div className="space-y-2">
                {(() => {
                  // Check actual submission status from backend data
                  const hasBLI01 = selectedStudent?.formResponses?.some((form: any) => form.formTypeEnum === 'BLI_01') || false;
                  const hasBLI02 = selectedStudent?.documents?.some((doc: any) => doc.type === 'BLI_02') || false;
                  const hasBLI03Online = selectedStudent?.formResponses?.some((form: any) => form.formTypeEnum === 'BLI_03') || false;
                  const hasBLI03Hardcopy = selectedStudent?.documents?.some((doc: any) => doc.type === 'BLI_03_HARDCOPY') || false;
                  const hasBLI04 = selectedStudent?.documents?.some((doc: any) => doc.type === 'BLI_04') || false;

                  const documents = [
                    { key: 'BLI-01', label: 'BLI-01', isCompleted: hasBLI01 },
                    { key: 'BLI-02', label: 'BLI-02', isCompleted: hasBLI02 },
                    { key: 'BLI-03-ONLINE', label: 'BLI-03 (Online)', isCompleted: hasBLI03Online },
                    { key: 'BLI-03-HARDCOPY', label: 'BLI-03 (Hardcopy)', isCompleted: hasBLI03Hardcopy },
                    { key: 'BLI-04', label: 'BLI-04', isCompleted: hasBLI04 }
                  ];

                  return documents.map((doc) => (
                    <div 
                      key={doc.key} 
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        doc.isCompleted ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                        doc.isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {doc.isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-white" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <span className={`font-medium ${
                        doc.isCompleted ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {doc.label}
                      </span>
                      <span className={`ml-auto text-xs ${
                        doc.isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {doc.isCompleted ? 'Submitted' : 'Pending'}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Application Status */}
            {selectedStudent?.applicationStatus && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Application Status</p>
                <p className="text-lg font-semibold text-blue-700 mt-1">
                  {selectedStudent.applicationStatus.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
