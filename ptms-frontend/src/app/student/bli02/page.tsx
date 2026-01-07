"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { documentsApi } from "@/lib/api/documents";
import { applicationsApi } from "@/lib/api/students";

// Zod validation schema for BLI-02 form
const bli02Schema = z.object({
  offerLetter: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, "File size must be less than 10MB")
    .refine(
      (file) => ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type),
      "File must be PDF, JPG, or PNG"
    )
    .refine(
      (file) => {
        const fileName = file.name.toLowerCase();
        return fileName.includes('[bli-02]') || fileName.includes('[offerletter]');
      },
      "File name must contain '[BLI-02]' or '[OfferLetter]'"
    ),
});

type BLI02FormData = z.infer<typeof bli02Schema>;

export default function BLI02FormPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<BLI02FormData>({
    resolver: zodResolver(bli02Schema),
  });

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await applicationsApi.getMyApplications();
        if (response.applications && response.applications.length > 0) {
          setApplicationId(response.applications[0].id);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const validateFile = useCallback((file: File): boolean => {
    // Check file size
    if (file.size > 10 * 1024 * 1024) {
      setError("offerLetter", { message: "File size must be less than 10MB" });
      return false;
    }

    // Check file type
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      setError("offerLetter", { message: "File must be PDF, JPG, or PNG" });
      return false;
    }

    // Check naming convention
    const fileName = file.name.toLowerCase();
    if (!fileName.includes('[bli-02]') && !fileName.includes('[offerletter]')) {
      setError("offerLetter", {
        message: "File name must contain '[BLI-02]' or '[OfferLetter]'"
      });
      return false;
    }

    clearErrors("offerLetter");
    return true;
  }, [setError, clearErrors]);

  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      setUploadedFile(file);
      setValue("offerLetter", file);

      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  }, [validateFile, setValue]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const removeFile = useCallback(() => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setValue("offerLetter", undefined as any);
    clearErrors("offerLetter");
  }, [setValue, clearErrors]);

  const onSubmit = async (data: BLI02FormData) => {
    if (!applicationId) {
      alert("No application found. Please create an application first.");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file to backend
      const response = await documentsApi.uploadDocument(
        applicationId,
        data.offerLetter,
        'BLI_02'
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("File uploaded:", response);
      alert("BLI-02 document uploaded successfully! Coordinator will review the content for completeness.");
      
      // Redirect back to applications page after successful upload
      setTimeout(() => {
        router.push('/student/applications');
      }, 1500);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`Error uploading file: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <main className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/student/applications">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">BLI-02 Form</h1>
        <p className="text-gray-600">Upload Offer Letter / Internship Agreement</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>
              Upload your offer letter or internship agreement. File must be PDF, JPG, or PNG format,
              less than 10MB, and named with "[BLI-02]" or "[OfferLetter]" prefix.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Area */}
            {!uploadedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    Drag and drop your file here
                  </p>
                  <p className="text-sm text-gray-500">
                    or{" "}
                    <label className="text-blue-600 hover:text-blue-500 cursor-pointer underline">
                      browse to choose a file
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileInputChange}
                      />
                    </label>
                  </p>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  <p>Supported formats: PDF, JPG, PNG</p>
                  <p>Maximum file size: 10MB</p>
                  <p>Naming: [BLI-02] Full Name or [OfferLetter] Full Name</p>
                </div>
              </div>
            ) : (
              /* File Preview */
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <FileText className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(uploadedFile.size)} • {uploadedFile.type}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {uploadedFile.type.split('/')[1].toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Valid
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {previewUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(previewUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Image Preview */}
                {previewUrl && (
                  <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                    <img
                      src={previewUrl}
                      alt="Document preview"
                      className="max-w-full h-auto max-h-96 mx-auto rounded"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {errors.offerLetter && (
              <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errors.offerLetter.message}</span>
              </div>
            )}

            {/* Upload Progress */}
            {isSubmitting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Requirements Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Document Requirements</CardTitle>
            <CardDescription>
              Ensure your document contains the following information for coordinator review:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm">Company name and address</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm">Internship start date and end date/scope</span>
              </div>
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm">Supervisor contact information (recommended)</span>
              </div>
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm">Internship position and responsibilities (recommended)</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Coordinator will manually verify document completeness.
                Auto OCR checks will be implemented in future updates.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link href="/student/applications">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting || !uploadedFile}
          >
            {isSubmitting ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </form>
    </main>
  );
}
