"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Loader2, X } from "lucide-react";

export default function TestBLI03Page() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [signatureType, setSignatureType] = useState<"typed" | "drawn" | "image">("typed");
  const [typedSignature, setTypedSignature] = useState("Ahmad bin Abdullah");
  const [drawnSignature, setDrawnSignature] = useState("");
  const [uploadedSignature, setUploadedSignature] = useState<File | null>(null);
  const [uploadedSignaturePreview, setUploadedSignaturePreview] = useState<string>("");
  const [coordinatorSignatureType, setCoordinatorSignatureType] = useState<"typed" | "drawn" | "image">("typed");
  const [typedCoordinatorSig, setTypedCoordinatorSig] = useState("Dr. Siti Nurhaliza");
  const [drawnCoordinatorSig, setDrawnCoordinatorSig] = useState("");
  const [uploadedCoordinatorSig, setUploadedCoordinatorSig] = useState<File | null>(null);
  const [uploadedCoordinatorPreview, setUploadedCoordinatorPreview] = useState<string>("");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coordinatorCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawingCoordinator, setIsDrawingCoordinator] = useState(false);

  // Sample data
  const sampleData = {
    studentName: "Ahmad bin Abdullah",
    matricNo: "2021234567",
    program: "Bachelor of Computer Science (Software Engineering)",
    studentPhone: "012-3456789",
    studentEmail: "ahmad2021@student.uitm.edu.my",
    startDate: "2026-03-01",
    endDate: "2026-08-31",
    organizationName: "Tech Solutions Sdn Bhd",
    organizationAddress: "No. 123, Jalan Teknologi 5/1, Taman Industri Teknologi, 47500 Subang Jaya, Selangor",
    organizationPhone: "03-12345678",
    organizationFax: "03-12345679",
    organizationEmail: "hr@techsolutions.com.my",
    contactPersonName: "Encik Mohd Faizal bin Hassan",
    contactPersonPhone: "012-9876543"
  };

  // Drawing functions for student signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
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

  // Drawing functions for coordinator signature
  const startDrawingCoordinator = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = coordinatorCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawingCoordinator(true);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const drawCoordinator = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingCoordinator) return;
    
    const canvas = coordinatorCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawingCoordinator = () => {
    if (isDrawingCoordinator) {
      const canvas = coordinatorCanvasRef.current;
      if (canvas) {
        setDrawnCoordinatorSig(canvas.toDataURL());
      }
      setIsDrawingCoordinator(false);
    }
  };

  const clearCoordinatorSignature = () => {
    const canvas = coordinatorCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawnCoordinatorSig("");
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

  const handleCoordinatorSignatureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadedCoordinatorSig(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedCoordinatorPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      let studentSignature = '';
      let studentSigType = signatureType;

      if (signatureType === 'typed') {
        studentSignature = typedSignature;
      } else if (signatureType === 'drawn') {
        studentSignature = drawnSignature;
      } else if (signatureType === 'image' && uploadedSignaturePreview) {
        studentSignature = uploadedSignaturePreview;
      }

      let coordinatorSignature = '';
      let coordinatorSigType = coordinatorSignatureType;

      if (coordinatorSignatureType === 'typed') {
        coordinatorSignature = typedCoordinatorSig;
      } else if (coordinatorSignatureType === 'drawn') {
        coordinatorSignature = drawnCoordinatorSig;
      } else if (coordinatorSignatureType === 'image' && uploadedCoordinatorPreview) {
        coordinatorSignature = uploadedCoordinatorPreview;
      }

      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/applications/test/bli03-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          student: {
            name: sampleData.studentName,
            matricNo: sampleData.matricNo,
            program: sampleData.program,
            phone: sampleData.studentPhone,
            email: sampleData.studentEmail,
            startDate: sampleData.startDate,
            endDate: sampleData.endDate,
          },
          organization: {
            name: sampleData.organizationName,
            address: sampleData.organizationAddress,
            phone: sampleData.organizationPhone,
            fax: sampleData.organizationFax,
            email: sampleData.organizationEmail,
            contactPersonName: sampleData.contactPersonName,
            contactPersonPhone: sampleData.contactPersonPhone,
          },
          signatures: {
            studentSignature,
            studentSignatureType: studentSigType,
            studentSignedAt: new Date(),
            coordinatorSignature,
            coordinatorSignatureType: coordinatorSigType,
            coordinatorSignedAt: new Date(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BLI-03-TEST-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert("✅ BLI-03 test PDF generated successfully!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('❌ Failed to generate BLI-03 PDF. Make sure backend is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BLI-03 PDF Generation Test</h1>
          <p className="text-gray-600">Test BLI-03 document generation with sample data and signatures</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sample Data Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sample Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="bg-blue-50 p-3 rounded">
                <h3 className="font-semibold mb-2">Student Information</h3>
                <div className="space-y-1 text-xs">
                  <p><strong>Name:</strong> {sampleData.studentName}</p>
                  <p><strong>Matric No:</strong> {sampleData.matricNo}</p>
                  <p><strong>Program:</strong> {sampleData.program}</p>
                  <p><strong>Phone:</strong> {sampleData.studentPhone}</p>
                  <p><strong>Email:</strong> {sampleData.studentEmail}</p>
                </div>
              </div>
              
              <div className="bg-green-50 p-3 rounded">
                <h3 className="font-semibold mb-2">Organization Information</h3>
                <div className="space-y-1 text-xs">
                  <p><strong>Name:</strong> {sampleData.organizationName}</p>
                  <p><strong>Address:</strong> {sampleData.organizationAddress}</p>
                  <p><strong>Phone:</strong> {sampleData.organizationPhone}</p>
                  <p><strong>Contact Person:</strong> {sampleData.contactPersonName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Signature Card */}
          <Card>
            <CardHeader>
              <CardTitle>Student Signature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={signatureType} onValueChange={(v) => setSignatureType(v as "typed" | "drawn" | "image")}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="typed">Typed</TabsTrigger>
                  <TabsTrigger value="drawn">Draw</TabsTrigger>
                  <TabsTrigger value="image">Upload</TabsTrigger>
                </TabsList>

                <TabsContent value="typed">
                  <Input
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="Type signature"
                    className="font-serif italic text-lg"
                  />
                </TabsContent>

                <TabsContent value="drawn">
                  <div className="space-y-2">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={150}
                      className="border-2 border-gray-300 rounded cursor-crosshair w-full"
                      style={{ touchAction: 'none' }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="image">
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleSignatureFileChange}
                    />
                    {uploadedSignaturePreview && (
                      <div className="border p-2 rounded">
                        <img src={uploadedSignaturePreview} alt="Signature preview" className="max-h-32" />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Coordinator Signature Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Coordinator Signature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={coordinatorSignatureType} onValueChange={(v) => setCoordinatorSignatureType(v as "typed" | "drawn" | "image")}>
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                  <TabsTrigger value="typed">Typed</TabsTrigger>
                  <TabsTrigger value="drawn">Draw</TabsTrigger>
                  <TabsTrigger value="image">Upload</TabsTrigger>
                </TabsList>

                <TabsContent value="typed">
                  <Input
                    value={typedCoordinatorSig}
                    onChange={(e) => setTypedCoordinatorSig(e.target.value)}
                    placeholder="Type coordinator signature"
                    className="font-serif italic text-lg max-w-md"
                  />
                </TabsContent>

                <TabsContent value="drawn">
                  <div className="space-y-2">
                    <canvas
                      ref={coordinatorCanvasRef}
                      width={400}
                      height={150}
                      className="border-2 border-gray-300 rounded cursor-crosshair max-w-md w-full"
                      style={{ touchAction: 'none' }}
                      onMouseDown={startDrawingCoordinator}
                      onMouseMove={drawCoordinator}
                      onMouseUp={stopDrawingCoordinator}
                      onMouseLeave={stopDrawingCoordinator}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={clearCoordinatorSignature}>
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="image">
                  <div className="space-y-2 max-w-md">
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleCoordinatorSignatureFileChange}
                    />
                    {uploadedCoordinatorPreview && (
                      <div className="border p-2 rounded">
                        <img src={uploadedCoordinatorPreview} alt="Coordinator signature preview" className="max-h-32" />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Generate Button */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <Button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Generate & Download BLI-03 PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2 text-blue-900">Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Select signature types for both student and coordinator</li>
              <li>For typed signatures, enter the name in the text field</li>
              <li>For drawn signatures, draw using your mouse on the canvas</li>
              <li>For image uploads, select a PNG or JPG file (max 2MB)</li>
              <li>Click "Generate & Download" to create the PDF with signatures</li>
              <li>Check that the signature underlines appear correctly in the PDF</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
