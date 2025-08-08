"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { FileText, ExternalLink, Trash2 } from "lucide-react";

interface DocumentsTableProps {
  documents: Array<{
    id: string;
    name: string;
    status: "pending" | "processing" | "indexed" | "error";
    uploader: string;
    uploadedAt: string;
    size: string;
    source: string;
  }>;
  onPreview: (documentId: string) => void;
  onRefetch: () => void;
  previewLoading: string | null;
}

export function DocumentsTable({ 
  documents, 
  onPreview, 
  onRefetch, 
  previewLoading 
}: DocumentsTableProps) {
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const deleteMutation = api.documents.delete.useMutation({
    onSuccess: () => {
      setDeleteLoading(null);
      onRefetch();
    },
    onError: (error) => {
      setDeleteLoading(null);
      alert("Delete failed: " + error.message);
    },
  });

  const handleDelete = (documentId: string, fileName: string) => {
    if (confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      setDeleteLoading(documentId);
      deleteMutation.mutate({ documentId });
    }
  };

  const getStatusBadge = (status: "pending" | "processing" | "indexed" | "error") => {
    const variant = 
      status === "indexed" ? "default" :
      status === "processing" ? "secondary" :
      status === "pending" ? "outline" : "destructive";
    const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
    return <Badge variant={variant}>{displayStatus}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Documents</CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-0">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[250px]">Name</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[150px]">Uploaded By</TableHead>
                <TableHead className="min-w-[150px]">Uploaded At</TableHead>
                <TableHead className="min-w-[80px]">Size</TableHead>
                <TableHead className="min-w-[120px]">Source</TableHead>
                <TableHead className="min-w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground flex-shrink-0" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-medium truncate max-w-[200px] block cursor-help">
                            {doc.name}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p className="break-all">{doc.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell>
                    <span className="truncate block max-w-[120px]" title={doc.uploader}>
                      {doc.uploader}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{doc.uploadedAt}</TableCell>
                  <TableCell className="whitespace-nowrap">{doc.size}</TableCell>
                  <TableCell>{doc.source}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="break-all pr-4">{doc.name}</DialogTitle>
                            <DialogDescription>
                              Document details and processing information.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Status</p>
                                <p className="text-sm text-muted-foreground">{doc.status}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Size</p>
                                <p className="text-sm text-muted-foreground">{doc.size}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Uploaded By</p>
                                <p className="text-sm text-muted-foreground break-all">{doc.uploader}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Source</p>
                                <p className="text-sm text-muted-foreground">{doc.source}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => onPreview(doc.id)}
                            disabled={previewLoading === doc.id}
                          >
                            <ExternalLink className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Preview document</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDelete(doc.id, doc.name)}
                            disabled={deleteLoading === doc.id}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete document</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
