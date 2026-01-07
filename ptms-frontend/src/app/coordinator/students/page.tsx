"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  FileText,
  Mail,
  MoreVertical,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Calendar,
  Download,
} from "lucide-react";
import { studentsApi, CoordinatorStudent } from "@/lib/api/students";
import { StudentDetailsDialog } from "@/components/coordinator/StudentDetailsDialog";


export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [eligibilityFilter, setEligibilityFilter] = useState("all");
  const [cgpaFilter, setCgpaFilter] = useState("all");
  const [programs, setPrograms] = useState<string[]>([]);
  const [selectedExportProgram, setSelectedExportProgram] = useState("ALL");
  const [isExporting, setIsExporting] = useState(false);
  const [students, setStudents] = useState<CoordinatorStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPrograms();
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [sessionFilter, programFilter, eligibilityFilter]);

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const data = await studentsApi.getPrograms(token || '');
      setPrograms(data.programs || []);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      
      const filters: any = {};
      if (sessionFilter !== "all") filters.sessionId = sessionFilter;
      if (programFilter !== "all") filters.program = programFilter;
      if (eligibilityFilter !== "all") filters.eligibility = eligibilityFilter;
      
      const data = await studentsApi.getCoordinatorStudents(token || '', filters);
      setStudents(data.students || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const url = `http://localhost:3000/api/students/export-csv?program=${selectedExportProgram}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `students_${selectedExportProgram}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getEligibilityBadge = (isEligible: boolean) => {
    return isEligible ? (
      <Badge variant="success" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Eligible
      </Badge>
    ) : (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Ineligible
      </Badge>
    );
  };

  const getApplicationStatusBadge = (status: string | null) => {
    if (!status) return null;

    const statusConfig: Record<string, { variant: any; label: string; icon: any }> = {
      DRAFT: { variant: "outline", label: "Draft", icon: FileText },
      SUBMITTED: { variant: "warning", label: "Submitted", icon: AlertTriangle },
      UNDER_REVIEW: { variant: "warning", label: "Under Review", icon: AlertTriangle },
      CHANGES_REQUESTED: { variant: "destructive", label: "Changes Requested", icon: AlertTriangle },
      APPROVED: { variant: "success", label: "Approved", icon: CheckCircle },
      SLI_03_ISSUED: { variant: "success", label: "SLI-03 Issued", icon: CheckCircle },
      COMPLETED: { variant: "success", label: "Completed", icon: CheckCircle },
    };

    const config = statusConfig[status] || { variant: "outline", label: status, icon: FileText };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricNo.includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSession = sessionFilter === "all" || student.sessionId === sessionFilter;
    const matchesProgram = programFilter === "all" || student.program === programFilter;
    const matchesEligibility = eligibilityFilter === "all" ||
      (eligibilityFilter === "eligible" && student.isEligible) ||
      (eligibilityFilter === "ineligible" && !student.isEligible);

    let matchesCgpa = true;
    if (cgpaFilter !== "all") {
      const cgpa = student.cgpa;
      switch (cgpaFilter) {
        case "below_2_5":
          matchesCgpa = cgpa < 2.5;
          break;
        case "2_5_to_3_0":
          matchesCgpa = cgpa >= 2.5 && cgpa < 3.0;
          break;
        case "3_0_to_3_5":
          matchesCgpa = cgpa >= 3.0 && cgpa < 3.5;
          break;
        case "above_3_5":
          matchesCgpa = cgpa >= 3.5;
          break;
      }
    }

    return matchesSearch && matchesSession && matchesProgram && matchesEligibility && matchesCgpa;
  });

  const getTabCount = (filter: string) => {
    switch (filter) {
      case "all":
        return students.length;
      case "eligible":
        return students.filter(s => s.isEligible).length;
      case "ineligible":
        return students.filter(s => !s.isEligible).length;
      case "active":
        return students.filter(s => s.currentApplication).length;
      default:
        return 0;
    }
  };

  const handleViewDetails = (studentId: string) => {
    setSelectedStudentId(studentId);
    setDetailsDialogOpen(true);
  };

  const handleViewApplications = (studentId: string) => {
    setSelectedStudentId(studentId);
    setDetailsDialogOpen(true);
  };

  const handleContactStudent = (email: string) => {
    console.log("Contact student:", email);
    // TODO: Open email client or messaging interface
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
              <p className="text-sm text-gray-600">View and manage student information and applications</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedExportProgram} onValueChange={setSelectedExportProgram}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Programs</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleExportCSV} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading students...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchStudents}
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        {!loading && !error && (
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, matric number, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={sessionFilter} onValueChange={setSessionFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="1">2024 Semester 1</SelectItem>
                  <SelectItem value="2">2024 Semester 2</SelectItem>
                </SelectContent>
              </Select>
              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={eligibilityFilter} onValueChange={setEligibilityFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Eligibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="eligible">Eligible</SelectItem>
                  <SelectItem value="ineligible">Ineligible</SelectItem>
                </SelectContent>
              </Select>
              <Select value={cgpaFilter} onValueChange={setCgpaFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="CGPA Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All CGPA</SelectItem>
                  <SelectItem value="below_2_5">Below 2.5</SelectItem>
                  <SelectItem value="2_5_to_3_0">2.5 - 3.0</SelectItem>
                  <SelectItem value="3_0_to_3_5">3.0 - 3.5</SelectItem>
                  <SelectItem value="above_3_5">Above 3.5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Student Tabs */}
        {!loading && !error && (
          <>
            {students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-600">No students match your current filters.</p>
              </div>
            ) : (
              <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All ({getTabCount("all")})</TabsTrigger>
                  <TabsTrigger value="eligible">Eligible ({getTabCount("eligible")})</TabsTrigger>
                  <TabsTrigger value="ineligible">Ineligible ({getTabCount("ineligible")})</TabsTrigger>
                  <TabsTrigger value="active">Active Apps ({getTabCount("active")})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {filteredStudents.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      getEligibilityBadge={getEligibilityBadge}
                      getApplicationStatusBadge={getApplicationStatusBadge}
                      onViewDetails={handleViewDetails}
                      onViewApplications={handleViewApplications}
                      onContactStudent={handleContactStudent}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="eligible" className="space-y-4">
                  {filteredStudents.filter(student => student.isEligible).map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      getEligibilityBadge={getEligibilityBadge}
                      getApplicationStatusBadge={getApplicationStatusBadge}
                      onViewDetails={handleViewDetails}
                      onViewApplications={handleViewApplications}
                      onContactStudent={handleContactStudent}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="ineligible" className="space-y-4">
                  {filteredStudents.filter(student => !student.isEligible).map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      getEligibilityBadge={getEligibilityBadge}
                      getApplicationStatusBadge={getApplicationStatusBadge}
                      onViewDetails={handleViewDetails}
                      onViewApplications={handleViewApplications}
                      onContactStudent={handleContactStudent}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="active" className="space-y-4">
                  {filteredStudents.filter(student => student.currentApplication).map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      getEligibilityBadge={getEligibilityBadge}
                      getApplicationStatusBadge={getApplicationStatusBadge}
                      onViewDetails={handleViewDetails}
                      onViewApplications={handleViewApplications}
                      onContactStudent={handleContactStudent}
                    />
                  ))}
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </main>

      <StudentDetailsDialog
        studentId={selectedStudentId}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  );
}

// Student Card Component
function StudentCard({
  student,
  getEligibilityBadge,
  getApplicationStatusBadge,
  onViewDetails,
  onViewApplications,
  onContactStudent
}: {
  student: CoordinatorStudent;
  getEligibilityBadge: (isEligible: boolean) => JSX.Element;
  getApplicationStatusBadge: (status: string | null) => JSX.Element | null;
  onViewDetails: (id: string) => void;
  onViewApplications: (id: string) => void;
  onContactStudent: (email: string) => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">{student.name}</h3>
              {getEligibilityBadge(student.isEligible)}
              {student.currentApplication && getApplicationStatusBadge(student.currentApplication.status)}
            </div>
            <div className="flex items-center gap-2 mb-3 text-sm">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <span className="font-medium text-indigo-700">
                Session: {student.sessionYear} / Semester {student.sessionSemester}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
              <div>
                <span className="font-medium">Matric No:</span> {student.matricNo}
              </div>
              <div>
                <span className="font-medium">Program:</span> {student.program}
              </div>
              <div>
                <span className="font-medium">CGPA:</span>{" "}
                <span className={`font-semibold ${student.cgpa >= 3.0 ? "text-green-600" : student.cgpa >= 2.5 ? "text-yellow-600" : "text-red-600"}`}>
                  {student.cgpa.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="font-medium">Credits:</span> {student.creditsEarned}
              </div>
              <div>
                <span className="font-medium">Email:</span> {student.email}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {student.phone}
              </div>
              <div>
                <span className="font-medium">Applications:</span> {student.totalApplications}
              </div>
              <div>
                <span className="font-medium">Completed:</span> {student.completedInternships}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => onViewDetails(student.id)}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
