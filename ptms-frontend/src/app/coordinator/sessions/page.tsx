"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as RadixDialog from "@radix-ui/react-dialog";
const Dialog = RadixDialog.Root;
const DialogTrigger = RadixDialog.Trigger;
const DialogContent = RadixDialog.Content;
const DialogTitle = RadixDialog.Title;
const DialogDescription = RadixDialog.Description;
const DialogOverlay = RadixDialog.Overlay;
const DialogHeader = ({ children, className = "", ...props }: any) => (
  <div className={`flex flex-col gap-1 ${className}`} {...props}>
    {children}
  </div>
);
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit, Trash2, Calendar, Users, Clock, Upload, CheckCircle, XCircle, Download, PenTool } from "lucide-react";
import { sessionsApi, Session, ImportResult } from "@/lib/api/sessions";
import { authService } from "@/lib/auth";

// Form validation schema
const sessionSchema = z.object({
  name: z.string().min(1, "Session name is required"),
  description: z.string().optional(),
  year: z.string().min(4, "Year must be 4 digits"),
  semester: z.enum(["1", "2"], { required_error: "Please select a semester" }),
  trainingStartDate: z.string().optional(),
  trainingEndDate: z.string().optional(),
  minCredits: z.number().min(1, "Minimum credits must be at least 1"),
  minWeeks: z.number().min(1, "Minimum weeks must be at least 1"),
  maxWeeks: z.number().min(1, "Maximum weeks must be at least 1"),
  applicationDeadline: z.string().min(1, "BLI-02 application deadline is required"),
  bli03Deadline: z.string().min(1, "BLI-03 deadline is required"),
  reportingDeadline: z.string().min(1, "BLI-04 reporting deadline is required"),
}).refine((data) => data.minWeeks <= data.maxWeeks, {
  message: "Minimum weeks cannot be greater than maximum weeks",
  path: ["minWeeks"],
}).refine((data) => {
  if (data.trainingStartDate && data.trainingEndDate) {
    return new Date(data.trainingStartDate) <= new Date(data.trainingEndDate);
  }
  return true;
}, {
  message: "Training start date cannot be after training end date",
  path: ["trainingStartDate"],
});

type SessionFormData = z.infer<typeof sessionSchema>;

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [programs, setPrograms] = useState<string[]>([]);
  const [selectedExportProgram, setSelectedExportProgram] = useState("ALL");
  const [isExporting, setIsExporting] = useState(false);
  
  const [signatureType, setSignatureType] = useState<"typed" | "drawn" | "upload">("typed");
  const [typedSignature, setTypedSignature] = useState("");
  const [drawnSignature, setDrawnSignature] = useState("");
  const [uploadedSignature, setUploadedSignature] = useState<File | null>(null);
  const [uploadedSignaturePreview, setUploadedSignaturePreview] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      name: "",
      description: "",
      year: new Date().getFullYear().toString(),
      semester: "1",
      trainingStartDate: "",
      trainingEndDate: "",
      minCredits: 113,
      minWeeks: 8,
      maxWeeks: 14,
      applicationDeadline: "",
      bli03Deadline: "",
      reportingDeadline: "",
    },
  });

  const editForm = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      name: "",
      description: "",
      year: new Date().getFullYear().toString(),
      semester: "1",
      trainingStartDate: "",
      trainingEndDate: "",
      minCredits: 113,
      minWeeks: 8,
      maxWeeks: 14,
      applicationDeadline: "",
      bli03Deadline: "",
      reportingDeadline: "",
    },
  });

  useEffect(() => {
    fetchSessions();
    fetchPrograms();
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      if (canvas) {
        setDrawnSignature(canvas.toDataURL());
      }
      setIsDrawing(false);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawnSignature("");
  };

  const handleSignatureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      alert('Please select a PNG or JPG image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB');
      return;
    }

    setUploadedSignature(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedSignaturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const fetchPrograms = async () => {
    try {
      const token = authService.getAccessToken();
      if (!token) return;
      
      const response = await fetch('http://localhost:3000/api/students/programs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPrograms(data.programs || []);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const token = authService.getAccessToken();
      if (!token) return;
      
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

  const fetchSessions = async () => {
    const token = authService.getAccessToken();
    if (!token) return;

    try {
      setLoading(true);
      const data = await sessionsApi.getAll(token);
      setSessions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SessionFormData) => {
    const token = authService.getAccessToken();
    if (!token) return;

    let signature = '';
    if (signatureType === 'typed') {
      signature = typedSignature;
    } else if (signatureType === 'drawn') {
      signature = drawnSignature;
    } else if (signatureType === 'upload') {
      if (!uploadedSignature) {
        alert('Please upload your signature image before creating the session.');
        return;
      }
    }

    if (!signature && signatureType !== 'upload') {
      alert('Please provide your signature before creating the session.');
      return;
    }

    try {
      // First create the session
      const createdSession = await sessionsApi.create({
        name: data.name || `${data.year} Semester ${data.semester}`,
        year: parseInt(data.year),
        semester: parseInt(data.semester),
        trainingStartDate: data.trainingStartDate || undefined,
        trainingEndDate: data.trainingEndDate || undefined,
        minCredits: data.minCredits,
        minWeeks: data.minWeeks,
        maxWeeks: data.maxWeeks,
        deadlinesJSON: {
          applicationDeadline: data.applicationDeadline,
          bli03Deadline: data.bli03Deadline,
          reportingDeadline: data.reportingDeadline,
        },
        coordinatorSignature: signatureType === 'upload' ? '' : signature,
        coordinatorSignatureType: signatureType === 'upload' ? 'image' : signatureType,
      }, token);

      // If upload type, upload the signature image
      if (signatureType === 'upload' && uploadedSignature && createdSession.id) {
        const formData = new FormData();
        formData.append('signature', uploadedSignature);

        const uploadResponse = await fetch(`http://localhost:3000/api/sessions/${createdSession.id}/upload-coordinator-signature`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload signature image');
        }
      }

      await fetchSessions();
      setIsCreateDialogOpen(false);
      form.reset();
      setTypedSignature("");
      setDrawnSignature("");
      setUploadedSignature(null);
      setUploadedSignaturePreview("");
      clearSignature();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create session");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedSession) return;

    const token = authService.getAccessToken();
    if (!token) return;

    try {
      const result = await sessionsApi.importStudents(selectedSession.id, file, token);
      setImportResult(result);
      await fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to import students");
    }
  };

  const handleUpdateSession = async (data: SessionFormData) => {
    const token = authService.getAccessToken();
    if (!token || !editingSession) return;

    try {
      await sessionsApi.update(editingSession.id, {
        name: data.name || `${data.year} Semester ${data.semester}`,
        year: parseInt(data.year),
        semester: parseInt(data.semester),
        trainingStartDate: data.trainingStartDate || undefined,
        trainingEndDate: data.trainingEndDate || undefined,
        minCredits: data.minCredits,
        minWeeks: data.minWeeks,
        maxWeeks: data.maxWeeks,
        deadlinesJSON: {
          applicationDeadline: data.applicationDeadline,
          bli03Deadline: data.bli03Deadline,
          reportingDeadline: data.reportingDeadline,
        },
      }, token);
      await fetchSessions();
      setIsEditDialogOpen(false);
      setEditingSession(null);
      editForm.reset();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update session");
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    const token = authService.getAccessToken();
    if (!token) return;

    try {
      await sessionsApi.delete(id, token);
      await fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete session");
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Session Management</h1>
              <p className="text-sm text-gray-600">Create and manage internship sessions</p>
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
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessions.filter(s => s.isActive).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently accepting applications
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessions.reduce((sum, s) => sum + (s.totalStudents || 0), 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    Enrolled across all sessions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessions.reduce((sum, s) => sum + (s.totalApplications || 0), 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all sessions
                  </p>
                </CardContent>
              </Card>
            </div>

        {/* Create Session Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Sessions</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            </DialogTrigger>
            <DialogOverlay className="fixed inset-0 bg-black/50 z-40" />
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white border shadow-lg rounded-lg p-6 z-50">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Create New Session</DialogTitle>
                <DialogDescription>
                  Set up a new internship session with deadlines and requirements.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                {/* Session Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Session Information</h3>
                  
                  <div>
                    <Label>Session Name *</Label>
                    <Controller
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <Input placeholder="e.g., 2024/2025 Semester 1 Internship" {...field} className="mt-1" />
                      )}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600 mt-1">{(form.formState.errors.name as any).message}</p>
                    )}
                  </div>

                  <div>
                    <Label>Description (Optional)</Label>
                    <Controller
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <textarea
                          {...field}
                          placeholder="Add any additional information about this session..."
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Academic Period */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Academic Period</h3>
                  <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Academic Year</Label>
                    <Controller
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <Input placeholder="2024" {...field} />
                      )}
                    />
                    {form.formState.errors.year && (
                      <p className="text-sm text-red-600">{(form.formState.errors.year as any).message}</p>
                    )}
                  </div>

                  <div>
                    <Label>Semester</Label>
                    <Controller
                      control={form.control}
                      name="semester"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Semester 1</SelectItem>
                            <SelectItem value="2">Semester 2</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.semester && (
                      <p className="text-sm text-red-600">{(form.formState.errors.semester as any).message}</p>
                    )}
                  </div>
                  </div>

                  {/* Training Period */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Intern Start Date (Optional)</Label>
                      <Controller
                        control={form.control}
                        name="trainingStartDate"
                        render={({ field }) => (
                          <Input type="date" {...field} />
                        )}
                      />
                      {form.formState.errors.trainingStartDate && (
                        <p className="text-sm text-red-600 mt-1">{(form.formState.errors.trainingStartDate as any).message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Expected start date for internship training (DD/MM/YYYY)</p>
                    </div>

                    <div>
                      <Label>Intern End Date (Optional)</Label>
                      <Controller
                        control={form.control}
                        name="trainingEndDate"
                        render={({ field }) => (
                          <Input type="date" {...field} />
                        )}
                      />
                      {form.formState.errors.trainingEndDate && (
                        <p className="text-sm text-red-600 mt-1">{(form.formState.errors.trainingEndDate as any).message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Expected end date for internship training (DD/MM/YYYY)</p>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Requirements</h3>
                  <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Min Credits</Label>
                    <Controller
                      control={form.control}
                      name="minCredits"
                      render={({ field }) => (
                        <Input
                          type="number"
                          value={field.value as any}
                          onChange={(e) => field.onChange(parseInt(e.target.value || "0", 10))}
                        />
                      )}
                    />
                    {form.formState.errors.minCredits && (
                      <p className="text-sm text-red-600">{(form.formState.errors.minCredits as any).message}</p>
                    )}
                  </div>

                  <div>
                    <Label>Min Weeks</Label>
                    <Controller
                      control={form.control}
                      name="minWeeks"
                      render={({ field }) => (
                        <Input
                          type="number"
                          value={field.value as any}
                          onChange={(e) => field.onChange(parseInt(e.target.value || "0", 10))}
                        />
                      )}
                    />
                    {form.formState.errors.minWeeks && (
                      <p className="text-sm text-red-600">{(form.formState.errors.minWeeks as any).message}</p>
                    )}
                  </div>

                  <div>
                    <Label>Max Weeks</Label>
                    <Controller
                      control={form.control}
                      name="maxWeeks"
                      render={({ field }) => (
                        <Input
                          type="number"
                          value={field.value as any}
                          onChange={(e) => field.onChange(parseInt(e.target.value || "0", 10))}
                        />
                      )}
                    />
                    {form.formState.errors.maxWeeks && (
                      <p className="text-sm text-red-600">{(form.formState.errors.maxWeeks as any).message}</p>
                    )}
                  </div>
                  </div>
                </div>

                {/* Deadlines */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Important Deadlines</h3>
                  <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>BLI-02 Application Deadline *</Label>
                    <Controller
                      control={form.control}
                      name="applicationDeadline"
                      render={({ field }) => (
                        <Input type="date" {...field} />
                      )}
                    />
                    {form.formState.errors.applicationDeadline && (
                      <p className="text-sm text-red-600 mt-1">{(form.formState.errors.applicationDeadline as any).message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Deadline for students to submit BLI-02 application form</p>
                  </div>

                  <div>
                    <Label>BLI-03 Submission Deadline *</Label>
                    <Controller
                      control={form.control}
                      name="bli03Deadline"
                      render={({ field }) => (
                        <Input type="date" {...field} />
                      )}
                    />
                    {form.formState.errors.bli03Deadline && (
                      <p className="text-sm text-red-600 mt-1">{(form.formState.errors.bli03Deadline as any).message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Deadline for students to submit BLI-03 acceptance form</p>
                  </div>

                  <div>
                    <Label>BLI-04 Reporting Deadline *</Label>
                    <Controller
                      control={form.control}
                      name="reportingDeadline"
                      render={({ field }) => (
                        <Input type="date" {...field} />
                      )}
                    />
                    {form.formState.errors.reportingDeadline && (
                      <p className="text-sm text-red-600 mt-1">{(form.formState.errors.reportingDeadline as any).message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Deadline for students to submit BLI-04 reporting duty form</p>
                  </div>
                  </div>
                </div>

                {/* Coordinator Signature */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    Coordinator Signature *
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Signature Type</Label>
                      <Tabs value={signatureType} onValueChange={(v) => setSignatureType(v as "typed" | "drawn" | "upload")} className="mt-2">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="typed">Typed Signature</TabsTrigger>
                          <TabsTrigger value="drawn">Draw Signature</TabsTrigger>
                          <TabsTrigger value="upload">Upload Image</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="typed" className="space-y-2">
                          <Input
                            placeholder="Type your full name as signature"
                            value={typedSignature}
                            onChange={(e) => setTypedSignature(e.target.value)}
                            className="font-serif text-2xl"
                          />
                          <p className="text-xs text-gray-500">
                            Type your full name as it should appear on the session record
                          </p>
                        </TabsContent>
                        
                        <TabsContent value="drawn" className="space-y-2">
                          <div className="border-2 border-gray-300 rounded-lg bg-white">
                            <canvas
                              ref={canvasRef}
                              width={600}
                              height={200}
                              className="w-full cursor-crosshair"
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                            />
                          </div>
                          <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
                            Clear Signature
                          </Button>
                          <p className="text-xs text-gray-500">
                            Draw your signature using your mouse or touchscreen
                          </p>
                        </TabsContent>

                        <TabsContent value="upload" className="space-y-2">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                            <Input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg"
                              onChange={handleSignatureFileChange}
                              className="mb-2"
                            />
                            {uploadedSignaturePreview && (
                              <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                <img 
                                  src={uploadedSignaturePreview} 
                                  alt="Signature preview" 
                                  className="max-w-md border rounded-lg p-2 bg-white"
                                />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Upload a PNG or JPG image of your signature (max 2MB)
                          </p>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Session</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sessions Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-3">Session</th>
                    <th className="text-left py-2 px-3">Credits</th>
                    <th className="text-left py-2 px-3">Duration</th>
                    <th className="text-left py-2 px-3">Deadlines</th>
                    <th className="text-left py-2 px-3">Status</th>
                    <th className="text-left py-2 px-3">Applications</th>
                    <th className="text-left py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="border-t">
                      <td className="py-4 px-3 align-top">
                        <div>
                          <div className="font-medium">
                            {session.year} Semester {session.semester}
                          </div>
                          <div className="text-sm text-gray-500">
                            Created {new Date(session.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 align-top">
                        <div className="font-medium">{session.minCredits}+</div>
                        <div className="text-sm text-gray-500">credits</div>
                      </td>
                      <td className="py-4 px-3 align-top">
                        <div className="font-medium">{session.minWeeks}-{session.maxWeeks}</div>
                        <div className="text-sm text-gray-500">weeks</div>
                      </td>
                      <td className="py-4 px-3 align-top">
                        <div className="text-sm">
                          <div>App: {session.deadlinesJSON?.applicationDeadline ? new Date(session.deadlinesJSON.applicationDeadline).toLocaleDateString() : 'N/A'}</div>
                          <div>BLI-03: {session.deadlinesJSON?.bli03Deadline ? new Date(session.deadlinesJSON.bli03Deadline).toLocaleDateString() : 'N/A'}</div>
                          <div>Report: {session.deadlinesJSON?.reportingDeadline ? new Date(session.deadlinesJSON.reportingDeadline).toLocaleDateString() : 'N/A'}</div>
                        </div>
                      </td>
                      <td className="py-4 px-3 align-top">{getStatusBadge(session.isActive)}</td>
                      <td className="py-4 px-3 align-top">
                        <div className="font-medium">{session.totalApplications || 0}</div>
                        <div className="text-sm text-gray-500">{session.totalStudents || 0} students</div>
                      </td>
                      <td className="py-4 px-3 align-top">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingSession(session);
                              editForm.reset({
                                name: session.name || `${session.year} Semester ${session.semester}`,
                                description: "",
                                year: session.year.toString(),
                                semester: session.semester.toString() as "1" | "2",
                                trainingStartDate: session.trainingStartDate ? new Date(session.trainingStartDate).toISOString().split('T')[0] : "",
                                trainingEndDate: session.trainingEndDate ? new Date(session.trainingEndDate).toISOString().split('T')[0] : "",
                                minCredits: session.minCredits,
                                minWeeks: session.minWeeks,
                                maxWeeks: session.maxWeeks,
                                applicationDeadline: session.deadlinesJSON?.applicationDeadline || "",
                                bli03Deadline: session.deadlinesJSON?.bli03Deadline || "",
                                reportingDeadline: session.deadlinesJSON?.reportingDeadline || "",
                              });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedSession(session);
                              setImportResult(null);
                              setIsImportDialogOpen(true);
                            }}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Import Students Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Import Students to Session</DialogTitle>
              <DialogDescription>
                Upload a CSV file with student eligibility data (matricNo, creditsEarned, status)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {selectedSession && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">
                    {selectedSession.year} Semester {selectedSession.semester}
                  </p>
                  <p className="text-sm text-gray-600">
                    Min Credits: {selectedSession.minCredits}
                  </p>
                </div>
              )}

              <div>
                <Label>CSV File</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-2">
                  CSV format: matricNo, creditsEarned, status (optional)
                </p>
              </div>

              {importResult && (
                <div className="space-y-2">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Successfully imported {importResult.successful} out of {importResult.total} students
                    </AlertDescription>
                  </Alert>

                  {importResult.failed > 0 && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to import {importResult.failed} students:
                        <ul className="list-disc list-inside mt-2">
                          {importResult.errors.slice(0, 5).map((err, idx) => (
                            <li key={idx} className="text-sm">{err}</li>
                          ))}
                          {importResult.errors.length > 5 && (
                            <li className="text-sm">...and {importResult.errors.length - 5} more</li>
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsImportDialogOpen(false);
                    setImportResult(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Session Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogOverlay className="fixed inset-0 bg-black/50 z-40" />
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white border shadow-lg rounded-lg p-6 z-50">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Edit Session</DialogTitle>
              <DialogDescription>
                Update session details, deadlines, and requirements.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={editForm.handleSubmit(handleUpdateSession)} className="space-y-6 mt-4">
              {/* Session Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Session Information</h3>
                
                <div>
                  <Label>Session Name *</Label>
                  <Controller
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <Input placeholder="e.g., 2024/2025 Semester 1 Internship" {...field} className="mt-1" />
                    )}
                  />
                  {editForm.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">{(editForm.formState.errors.name as any).message}</p>
                  )}
                </div>

                <div>
                  <Label>Description (Optional)</Label>
                  <Controller
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <textarea
                        {...field}
                        placeholder="Add any additional information about this session..."
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Academic Period */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Academic Period</h3>
                <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Academic Year</Label>
                  <Controller
                    control={editForm.control}
                    name="year"
                    render={({ field }) => (
                      <Input placeholder="2024" {...field} />
                    )}
                  />
                  {editForm.formState.errors.year && (
                    <p className="text-sm text-red-600">{(editForm.formState.errors.year as any).message}</p>
                  )}
                </div>

                <div>
                  <Label>Semester</Label>
                  <Controller
                    control={editForm.control}
                    name="semester"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Semester 1</SelectItem>
                          <SelectItem value="2">Semester 2</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {editForm.formState.errors.semester && (
                    <p className="text-sm text-red-600">{(editForm.formState.errors.semester as any).message}</p>
                  )}
                </div>
                </div>

                {/* Training Period */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Intern Start Date (Optional)</Label>
                    <Controller
                      control={editForm.control}
                      name="trainingStartDate"
                      render={({ field }) => (
                        <Input type="date" {...field} />
                      )}
                    />
                    {editForm.formState.errors.trainingStartDate && (
                      <p className="text-sm text-red-600 mt-1">{(editForm.formState.errors.trainingStartDate as any).message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Expected start date for internship training (DD/MM/YYYY)</p>
                  </div>

                  <div>
                    <Label>Intern End Date (Optional)</Label>
                    <Controller
                      control={editForm.control}
                      name="trainingEndDate"
                      render={({ field }) => (
                        <Input type="date" {...field} />
                      )}
                    />
                    {editForm.formState.errors.trainingEndDate && (
                      <p className="text-sm text-red-600 mt-1">{(editForm.formState.errors.trainingEndDate as any).message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Expected end date for internship training (DD/MM/YYYY)</p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Requirements</h3>
                <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Min Credits</Label>
                  <Controller
                    control={editForm.control}
                    name="minCredits"
                    render={({ field }) => (
                      <Input
                        type="number"
                        value={field.value as any}
                        onChange={(e) => field.onChange(parseInt(e.target.value || "0", 10))}
                      />
                    )}
                  />
                  {editForm.formState.errors.minCredits && (
                    <p className="text-sm text-red-600">{(editForm.formState.errors.minCredits as any).message}</p>
                  )}
                </div>

                <div>
                  <Label>Min Weeks</Label>
                  <Controller
                    control={editForm.control}
                    name="minWeeks"
                    render={({ field }) => (
                      <Input
                        type="number"
                        value={field.value as any}
                        onChange={(e) => field.onChange(parseInt(e.target.value || "0", 10))}
                      />
                    )}
                  />
                  {editForm.formState.errors.minWeeks && (
                    <p className="text-sm text-red-600">{(editForm.formState.errors.minWeeks as any).message}</p>
                  )}
                </div>

                <div>
                  <Label>Max Weeks</Label>
                  <Controller
                    control={editForm.control}
                    name="maxWeeks"
                    render={({ field }) => (
                      <Input
                        type="number"
                        value={field.value as any}
                        onChange={(e) => field.onChange(parseInt(e.target.value || "0", 10))}
                      />
                    )}
                  />
                  {editForm.formState.errors.maxWeeks && (
                    <p className="text-sm text-red-600">{(editForm.formState.errors.maxWeeks as any).message}</p>
                  )}
                </div>
                </div>
              </div>

              {/* Deadlines */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Important Deadlines</h3>
                <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>BLI-02 Application Deadline *</Label>
                  <Controller
                    control={editForm.control}
                    name="applicationDeadline"
                    render={({ field }) => (
                      <Input type="date" {...field} />
                    )}
                  />
                  {editForm.formState.errors.applicationDeadline && (
                    <p className="text-sm text-red-600 mt-1">{(editForm.formState.errors.applicationDeadline as any).message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Deadline for students to submit BLI-02 application form</p>
                </div>

                <div>
                  <Label>BLI-03 Submission Deadline *</Label>
                  <Controller
                    control={editForm.control}
                    name="bli03Deadline"
                    render={({ field }) => (
                      <Input type="date" {...field} />
                    )}
                  />
                  {editForm.formState.errors.bli03Deadline && (
                    <p className="text-sm text-red-600 mt-1">{(editForm.formState.errors.bli03Deadline as any).message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Deadline for students to submit BLI-03 acceptance form</p>
                </div>

                <div>
                  <Label>BLI-04 Reporting Deadline *</Label>
                  <Controller
                    control={editForm.control}
                    name="reportingDeadline"
                    render={({ field }) => (
                      <Input type="date" {...field} />
                    )}
                  />
                  {editForm.formState.errors.reportingDeadline && (
                    <p className="text-sm text-red-600 mt-1">{(editForm.formState.errors.reportingDeadline as any).message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Deadline for students to submit BLI-04 reporting duty form</p>
                </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingSession(null);
                    editForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Session</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </>
        )}
      </main>
    </div>
  );
}
