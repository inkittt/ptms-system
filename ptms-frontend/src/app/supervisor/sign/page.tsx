"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Eye, PenTool, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

// Mock data for pending signatures
const pendingSignatures = [
  {
    id: "1",
    studentName: "Ahmad Bin Abdullah",
    matricNo: "2021234567",
    companyName: "Tech Solutions Sdn Bhd",
    formType: "BLI-04",
    formTitle: "Final Report & Evaluation",
    submittedDate: "2024-11-20",
    status: "pending",
    priority: "high"
  },
  {
    id: "2",
    studentName: "Siti Nurhaliza",
    matricNo: "2021234568",
    companyName: "Digital Innovations Ltd",
    formType: "BLI-04",
    formTitle: "Final Report & Evaluation",
    submittedDate: "2024-11-18",
    status: "pending",
    priority: "medium"
  }
];

const signedForms = [
  {
    id: "3",
    studentName: "Mohd Faiz Bin Rahman",
    matricNo: "2021234569",
    companyName: "Global Systems Inc",
    formType: "BLI-04",
    formTitle: "Final Report & Evaluation",
    submittedDate: "2024-11-15",
    signedDate: "2024-11-16",
    status: "signed"
  }
];

export default function SupervisorSignPage() {
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [isSigning, setIsSigning] = useState(false);

  const handleSignForm = async (formId: string) => {
    setIsSigning(true);
    try {
      // TODO: Implement actual signing logic
      console.log("Signing form:", formId);
      alert("Form signed successfully!");
      setSelectedForm(null);
    } catch (error) {
      console.error("Error signing form:", error);
      alert("Error signing form. Please try again.");
    } finally {
      setIsSigning(false);
    }
  };

  const FormSigningModal = ({ form }: { form: any }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Sign {form.formType} - {form.studentName}</h2>
            <Button variant="outline" onClick={() => setSelectedForm(null)}>
              Close
            </Button>
          </div>

          <div className="space-y-6">
            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Student Name</Label>
                    <Input value={form.studentName} readOnly />
                  </div>
                  <div>
                    <Label>Matric Number</Label>
                    <Input value={form.matricNo} readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Company Name</Label>
                  <Input value={form.companyName} readOnly />
                </div>
              </CardContent>
            </Card>

            {/* Supervisor Evaluation Section */}
            <Card>
              <CardHeader>
                <CardTitle>Supervisor Evaluation</CardTitle>
                <CardDescription>Please provide your assessment and signature</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="supervisorComments">Supervisor Comments</Label>
                  <Textarea
                    id="supervisorComments"
                    placeholder="Provide your overall comments and feedback"
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="wouldRecommend" />
                  <label htmlFor="wouldRecommend" className="text-sm">
                    I would recommend this student for future employment opportunities
                  </label>
                </div>

                <div>
                  <Label htmlFor="overallRating">Overall Rating (1-5)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select overall rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 - Outstanding</SelectItem>
                      <SelectItem value="4">4 - Very Good</SelectItem>
                      <SelectItem value="3">3 - Good</SelectItem>
                      <SelectItem value="2">2 - Satisfactory</SelectItem>
                      <SelectItem value="1">1 - Needs Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  <div>
                    <Label htmlFor="supervisorSignature">Supervisor Signature</Label>
                    <Input
                      id="supervisorSignature"
                      placeholder="Type your full name as signature"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setSelectedForm(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleSignForm(form.id)} disabled={isSigning}>
                {isSigning ? "Signing..." : "Sign Form"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/supervisor">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Sign Forms</h1>
        <p className="text-gray-600">Review and sign pending internship forms</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Signatures ({pendingSignatures.length})
          </TabsTrigger>
          <TabsTrigger value="signed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Signed Forms ({signedForms.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingSignatures.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600">No pending forms require your signature.</p>
              </CardContent>
            </Card>
          ) : (
            pendingSignatures.map((form) => (
              <Card key={form.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">{form.formType} - {form.formTitle}</h3>
                        <Badge variant={form.priority === 'high' ? 'destructive' : 'secondary'}>
                          {form.priority === 'high' ? 'High Priority' : 'Normal'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Student:</span> {form.studentName}
                        </div>
                        <div>
                          <span className="font-medium">Matric No:</span> {form.matricNo}
                        </div>
                        <div>
                          <span className="font-medium">Company:</span> {form.companyName}
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-gray-500">
                        Submitted on {new Date(form.submittedDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" onClick={() => setSelectedForm(form)}>
                        <PenTool className="h-4 w-4 mr-2" />
                        Sign Form
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="signed" className="space-y-4">
          {signedForms.map((form) => (
            <Card key={form.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold">{form.formType} - {form.formTitle}</h3>
                      <Badge variant="secondary">Signed</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Student:</span> {form.studentName}
                      </div>
                      <div>
                        <span className="font-medium">Matric No:</span> {form.matricNo}
                      </div>
                      <div>
                        <span className="font-medium">Company:</span> {form.companyName}
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-gray-500">
                      Submitted: {new Date(form.submittedDate).toLocaleDateString()} |
                      Signed: {new Date(form.signedDate).toLocaleDateString()}
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Signed Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Signing Modal */}
      {selectedForm && <FormSigningModal form={selectedForm} />}
    </main>
  );
}
