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
import { FileText, ExternalLink, X, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";

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
    setPdfZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setPdfZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setPdfRotation(prev => (prev + 90) % 360);
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
    const lastDotIndex = fileName.lastIndexOf('.');
    const extension = lastDotIndex > -1 ? fileName.substring(lastDotIndex) : '';
    const nameWithoutExt = lastDotIndex > -1 ? fileName.substring(0, lastDotIndex) : fileName;
    
    // Calculate available space for the name part
    const availableSpace = maxLength - extension.length - 3; // 3 for "..."
    
    if (availableSpace <= 0) {
      // If extension is too long, just truncate the whole thing
      return fileName.substring(0, maxLength - 3) + '...';
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
        <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-gray-900">
          {/* PDF Controls Bar */}
          <div className="flex items-center justify-between p-2 bg-background border-b">
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
              <span className="text-sm font-medium min-w-[60px] text-center">
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
                className="h-8 ml-2"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(url, '_blank')}
                className="h-8"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
          
          {/* PDF Viewer Container - Full width for better display */}
          <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800">
            <div 
              className="min-h-full flex justify-center p-4"
              style={{
                transform: `scale(${pdfZoom / 100}) rotate(${pdfRotation}deg)`,
                transformOrigin: 'center top',
                transition: 'transform 200ms'
              }}
            >
              <object
                data={`${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                type="application/pdf"
                className="shadow-lg"
                style={{
                  width: '100%',
                  maxWidth: '1200px',
                  height: '100vh',
                  minHeight: '800px'
                }}
              >
                <embed
                  src={`${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                  type="application/pdf"
                  className="shadow-lg"
                  style={{
                    width: '100%',
                    maxWidth: '1200px',
                    height: '100vh',
                    minHeight: '800px'
                  }}
                />
                <p className="text-center p-8">
                  Your browser does not support PDFs. 
                  <a href={url} className="text-blue-500 underline ml-1">Download the PDF</a> instead.
                </p>
              </object>
            </div>
          </div>
        </div>
      );
    }

    if (contentType.startsWith("image/")) {
      return (
        <div className="flex justify-center items-center h-full p-4 bg-gray-50 dark:bg-gray-900">
          <img
            src={url}
            alt={fileName}
            className="max-w-full max-h-full object-contain rounded shadow-lg"
          />
        </div>
      );
    }

    if (contentType.startsWith("text/") || contentType === "text/csv") {
      return (
        <div className="w-full h-full flex flex-col">
          <iframe
            src={url}
            className="w-full flex-1 border-0 rounded bg-background"
            title={`Preview of ${fileName}`}
          />
        </div>
      );
    }

    return (
      <div className="text-center py-8 h-full flex flex-col justify-center items-center p-4">
        <FileText className="size-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">Preview not available for this file type.</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary underline hover:no-underline inline-flex items-center gap-2"
        >
          <ExternalLink className="size-4" />
          Download file instead
        </a>
      </div>
    );
  };

  return (
    <Dialog open={!!previewDoc} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="max-w-[2000px] w-[98vw] h-[90vh] p-0 overflow-hidden min-w-[80vw]">
        <DialogHeader className="px-6 pt-6 pb-2 space-y-2 relative border-b">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <div className="pr-12">
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTitle className="text-lg font-semibold truncate cursor-help">
                  {previewDoc && truncateFileName(previewDoc.fileName, 40)}
                </DialogTitle>
              </TooltipTrigger>
              <TooltipContent className="max-w-xl z-50">
                <p className="break-all">{previewDoc?.fileName}</p>
              </TooltipContent>
            </Tooltip>
            <DialogDescription className="text-sm text-muted-foreground">
              {previewDoc?.contentType}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {renderPreviewContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
