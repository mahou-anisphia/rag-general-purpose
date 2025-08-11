"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  FileText,
  ExternalLink,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
} from "lucide-react";

interface DocumentPreviewProps {
  previewDoc: {
    url: string;
    contentType: string;
    fileName: string;
  } | null;
  onClose: () => void;
}

export function DocumentPreview({ previewDoc, onClose }: DocumentPreviewProps) {
  const [pdfZoom, setPdfZoom] = useState(100);
  const [pdfRotation, setPdfRotation] = useState(0);

  const handleZoomIn = () => {
    setPdfZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setPdfZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setPdfRotation((prev) => (prev + 90) % 360);
  };

  const handleClose = () => {
    setPdfZoom(100);
    setPdfRotation(0);
    onClose();
  };

  // Helper function to truncate long filenames
  const truncateFileName = (fileName: string, maxLength: number = 50) => {
    if (fileName.length <= maxLength) return fileName;

    // Get file extension
    const lastDotIndex = fileName.lastIndexOf(".");
    const extension = lastDotIndex > -1 ? fileName.substring(lastDotIndex) : "";
    const nameWithoutExt =
      lastDotIndex > -1 ? fileName.substring(0, lastDotIndex) : fileName;

    // Calculate available space for the name part
    const availableSpace = maxLength - extension.length - 3; // 3 for "..."

    if (availableSpace <= 0) {
      // If extension is too long, just truncate the whole thing
      return fileName.substring(0, maxLength - 3) + "...";
    }

    // Truncate the name part and add extension
    const truncatedName = nameWithoutExt.substring(0, availableSpace);
    return `${truncatedName}...${extension}`;
  };

  const renderPreviewContent = () => {
    if (!previewDoc) return null;

    const { url, contentType, fileName } = previewDoc;

    if (contentType === "application/pdf") {
      // Enhanced PDF viewer with proper sizing and controls
      return (
        <div className="flex h-full w-full flex-col bg-gray-50 dark:bg-gray-900">
          {/* PDF Controls Bar */}
          <div className="bg-background flex items-center justify-between border-b p-2">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleZoomOut}
                disabled={pdfZoom <= 50}
                className="h-8"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="min-w-[60px] text-center text-sm font-medium">
                {pdfZoom}%
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleZoomIn}
                disabled={pdfZoom >= 200}
                className="h-8"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRotate}
                className="ml-2 h-8"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(url, "_blank")}
                className="h-8"
              >
                <Download className="mr-1 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          {/* PDF Viewer Container - Full width for better display */}
          <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800">
            <div
              className="flex min-h-full justify-center p-4"
              style={{
                transform: `scale(${pdfZoom / 100}) rotate(${pdfRotation}deg)`,
                transformOrigin: "center top",
                transition: "transform 200ms",
              }}
            >
              <object
                data={`${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                type="application/pdf"
                className="shadow-lg"
                style={{
                  width: "100%",
                  maxWidth: "1200px",
                  height: "100vh",
                  minHeight: "800px",
                }}
              >
                <embed
                  src={`${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                  type="application/pdf"
                  className="shadow-lg"
                  style={{
                    width: "100%",
                    maxWidth: "1200px",
                    height: "100vh",
                    minHeight: "800px",
                  }}
                />
                <p className="p-8 text-center">
                  Your browser does not support PDFs.
                  <a href={url} className="ml-1 text-blue-500 underline">
                    Download the PDF
                  </a>{" "}
                  instead.
                </p>
              </object>
            </div>
          </div>
        </div>
      );
    }

    if (contentType.startsWith("image/")) {
      return (
        <div className="flex h-full items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
          <img
            src={url}
            alt={fileName}
            className="max-h-full max-w-full rounded object-contain shadow-lg"
          />
        </div>
      );
    }

    if (contentType.startsWith("text/") || contentType === "text/csv") {
      return (
        <div className="flex h-full w-full flex-col">
          <iframe
            src={url}
            className="bg-background w-full flex-1 rounded border-0"
            title={`Preview of ${fileName}`}
          />
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col items-center justify-center p-4 py-8 text-center">
        <FileText className="text-muted-foreground mb-4 size-12" />
        <p className="text-muted-foreground mb-4">
          Preview not available for this file type.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary inline-flex items-center gap-2 underline hover:no-underline"
        >
          <ExternalLink className="size-4" />
          Download file instead
        </a>
      </div>
    );
  };

  return (
    <Dialog
      open={!!previewDoc}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="h-[90vh] w-[98vw] max-w-[2000px] min-w-[80vw] overflow-hidden p-0">
        <DialogHeader className="relative space-y-2 border-b px-6 pt-6 pb-2">
          <button
            onClick={handleClose}
            className="ring-offset-background focus:ring-ring absolute top-4 right-4 z-10 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <div className="pr-12">
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTitle className="cursor-help truncate text-lg font-semibold">
                  {previewDoc && truncateFileName(previewDoc.fileName, 40)}
                </DialogTitle>
              </TooltipTrigger>
              <TooltipContent className="z-50 max-w-xl">
                <p className="break-all">{previewDoc?.fileName}</p>
              </TooltipContent>
            </Tooltip>
            <DialogDescription className="text-muted-foreground text-sm">
              {previewDoc?.contentType}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">{renderPreviewContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
