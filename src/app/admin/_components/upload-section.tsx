"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Upload, Settings } from "lucide-react";

interface UploadSectionProps {
  onUploadSuccess: () => void;
}

export function UploadSection({ onUploadSuccess }: UploadSectionProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const uploadMutation = api.documents.upload.useMutation({
    onSuccess: () => {
      setSelectedFiles(null);
      setIsUploading(false);
      // Reset the file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      // Notify parent of upload success
      onUploadSuccess();
    },
    onError: (error) => {
      setIsUploading(false);
      alert("Upload failed: " + error.message);
    },
  });

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Please select files to upload");
      return;
    }

    setIsUploading(true);

    try {
      for (const file of Array.from(selectedFiles)) {
        // Validate file size
        if (file.size > 20 * 1024 * 1024) {
          alert(`File ${file.name} exceeds 20MB limit`);
          continue;
        }

        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        await uploadMutation.mutateAsync({
          fileName: file.name,
          fileContent: base64,
          contentType: file.type || "application/octet-stream",
          fileSize: file.size,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>
          PDF, DOCX, TXT, CSV, Markdown. Max 20 MB each.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Label
          htmlFor="file-upload"
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center hover:bg-muted/40"
        >
          <Upload className="size-6 text-primary" />
          <div className="space-y-1">
            <p className="text-sm">Drag and drop files here</p>
            <p className="text-xs text-muted-foreground">or click to select</p>
          </div>
          <Input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            multiple
            onChange={handleFileSelect}
            accept=".pdf,.docx,.txt,.csv,.md"
          />
        </Label>
        {selectedFiles && selectedFiles.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Selected {selectedFiles.length} file(s)
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            size="sm" 
            onClick={handleUpload}
            disabled={!selectedFiles || selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? "Uploading..." : "Start Upload"}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Settings className="mr-2 size-4" />
                Configure Parsing
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure Document Parsing</DialogTitle>
                <DialogDescription>
                  Adjust how documents are processed and indexed.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Parsing configuration options would go here.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
