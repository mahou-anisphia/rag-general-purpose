"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useNotifications } from "~/hooks/use-notifications";
import { truncateFilename } from "~/utils/filename";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  FileText,
  ExternalLink,
  Trash2,
  MoreHorizontal,
  FileSearch,
  Zap,
} from "lucide-react";

interface DocumentsTableProps {
  documents: Array<{
    id: string;
    name: string;
    status: "pending" | "processing" | "indexed" | "error";
    uploader: string;
    uploadedAt: string;
    size: string;
    source: string;
    hasRawText: boolean;
  }>;
  onPreview: (documentId: string) => void;
  onRefetch: () => void;
  previewLoading: string | null;
}

export function DocumentsTable({
  documents,
  onPreview,
  onRefetch,
  previewLoading,
}: DocumentsTableProps) {
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [processLoading, setProcessLoading] = useState<string | null>(null);
  const [indexLoading, setIndexLoading] = useState<string | null>(null);

  // Confirmation dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [processConfirmOpen, setProcessConfirmOpen] = useState(false);
  const [indexConfirmOpen, setIndexConfirmOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { showError, showSuccess } = useNotifications();

  const deleteMutation = api.documents.delete.useMutation({
    onSuccess: () => {
      setDeleteLoading(null);
      onRefetch();
    },
    onError: (error) => {
      setDeleteLoading(null);
      showError({ title: "Delete failed", error: error.message });
    },
  });

  const processMutation = api.documents.processPdf.useMutation({
    onSuccess: () => {
      setProcessLoading(null);
      onRefetch();
    },
    onError: (error) => {
      setProcessLoading(null);
      showError({ title: "Process failed", error: error.message });
    },
  });

  const indexMutation = api.documents.processForIndexing.useMutation({
    onSuccess: (data) => {
      setIndexLoading(null);
      onRefetch();
      if (data.stats) {
        showSuccess({
          title: "Document indexed successfully!",
          description: `Chunks: ${data.stats.chunks} • Points indexed: ${data.stats.pointsIndexed} • Tokens used: ${data.stats.tokensUsed} • Cost: $${data.stats.estimatedCost.toFixed(4)}`,
          duration: 8000,
        });
      }
    },
    onError: (error) => {
      setIndexLoading(null);
      showError({ title: "Indexing failed", error: error.message });
    },
  });

  const handleDeleteClick = (documentId: string, fileName: string) => {
    setSelectedDocument({ id: documentId, name: fileName });
    setDeleteConfirmOpen(true);
  };

  const handleProcessClick = (documentId: string, fileName: string) => {
    setSelectedDocument({ id: documentId, name: fileName });
    setProcessConfirmOpen(true);
  };

  const handleIndexClick = (documentId: string, fileName: string) => {
    setSelectedDocument({ id: documentId, name: fileName });
    setIndexConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDocument) {
      setDeleteLoading(selectedDocument.id);
      deleteMutation.mutate({ documentId: selectedDocument.id });
      setDeleteConfirmOpen(false);
      setSelectedDocument(null);
    }
  };

  const confirmProcess = () => {
    if (selectedDocument) {
      setProcessLoading(selectedDocument.id);
      processMutation.mutate({ documentId: selectedDocument.id });
      setProcessConfirmOpen(false);
      setSelectedDocument(null);
    }
  };

  const confirmIndex = () => {
    if (selectedDocument) {
      setIndexLoading(selectedDocument.id);
      indexMutation.mutate({ documentId: selectedDocument.id });
      setIndexConfirmOpen(false);
      setSelectedDocument(null);
    }
  };

  const getStatusBadge = (
    status: "pending" | "processing" | "indexed" | "error",
  ) => {
    const variant =
      status === "indexed"
        ? "default"
        : status === "processing"
          ? "secondary"
          : status === "pending"
            ? "outline"
            : "destructive";
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
                <TableHead className="min-w-[140px] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="text-muted-foreground size-4 flex-shrink-0" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block max-w-[200px] cursor-help truncate font-medium">
                            {truncateFilename(doc.name, 35)}
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
                    <span
                      className="block max-w-[120px] truncate"
                      title={doc.uploader}
                    >
                      {doc.uploader}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {doc.uploadedAt}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {doc.size}
                  </TableCell>
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
                            <DialogTitle className="pr-4 text-left break-all">
                              {doc.name}
                            </DialogTitle>
                            <DialogDescription>
                              Document details and processing information.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Status</p>
                                <p className="text-muted-foreground text-sm">
                                  {doc.status}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Size</p>
                                <p className="text-muted-foreground text-sm">
                                  {doc.size}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  Uploaded By
                                </p>
                                <p className="text-muted-foreground text-sm break-all">
                                  {doc.uploader}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Source</p>
                                <p className="text-muted-foreground text-sm">
                                  {doc.source}
                                </p>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={
                              deleteLoading === doc.id ||
                              processLoading === doc.id ||
                              indexLoading === doc.id
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleProcessClick(doc.id, doc.name)}
                            disabled={
                              processLoading === doc.id ||
                              doc.hasRawText ||
                              !doc.name.toLowerCase().endsWith(".pdf")
                            }
                          >
                            <FileSearch className="mr-2 size-4" />
                            {doc.hasRawText
                              ? "Already Processed"
                              : "Process PDF"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleIndexClick(doc.id, doc.name)}
                            disabled={
                              indexLoading === doc.id ||
                              !doc.hasRawText ||
                              doc.status === "indexed"
                            }
                          >
                            <Zap className="mr-2 size-4" />
                            {doc.status === "indexed"
                              ? "Already Indexed"
                              : indexLoading === doc.id
                                ? "Indexing..."
                                : "Index for Search"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(doc.id, doc.name)}
                            disabled={deleteLoading === doc.id}
                            variant="destructive"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription className="break-words">
              Are you sure you want to delete &ldquo;
              {selectedDocument && truncateFilename(selectedDocument.name, 50)}
              &rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setSelectedDocument(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Confirmation Dialog */}
      <Dialog open={processConfirmOpen} onOpenChange={setProcessConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Document</DialogTitle>
            <DialogDescription className="break-words">
              Process &ldquo;
              {selectedDocument && truncateFilename(selectedDocument.name, 50)}
              &rdquo; to extract text content?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setProcessConfirmOpen(false);
                setSelectedDocument(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmProcess}>Process</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Index Confirmation Dialog */}
      <Dialog open={indexConfirmOpen} onOpenChange={setIndexConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Index Document</DialogTitle>
            <DialogDescription className="break-words">
              Index &ldquo;
              {selectedDocument && truncateFilename(selectedDocument.name, 50)}
              &rdquo; for vector search? This will generate embeddings and may
              incur OpenAI costs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIndexConfirmOpen(false);
                setSelectedDocument(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmIndex}>Index</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
