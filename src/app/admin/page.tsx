"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import { TooltipProvider } from "~/components/ui/tooltip";
import { useNotifications } from "~/hooks/use-notifications";
import { UploadSection } from "./_components/upload-section";
import { SettingsSection } from "./_components/settings-section";
import { DocumentsTable } from "./_components/documents-table";
import { DocumentPreview } from "./_components/document-preview";
import { UpcomingFeatures } from "./_components/upcoming-features";

export default function AdminDocumentsPage() {
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    contentType: string;
    fileName: string;
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);

  const { data: documents = [], refetch } = api.documents.listAll.useQuery();
  const { showError } = useNotifications();

  const previewMutation = api.documents.getPreviewUrl.useMutation({
    onSuccess: (data) => {
      setPreviewDoc(data);
      setPreviewLoading(null);
    },
    onError: (error) => {
      showError({ title: "Preview failed", error: error.message });
      setPreviewLoading(null);
    },
  });

  const handlePreview = (documentId: string) => {
    setPreviewLoading(documentId);
    previewMutation.mutate({ documentId });
  };

  const handleClosePreview = () => {
    setPreviewDoc(null);
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-muted-foreground text-sm">
            Upload and monitor source documents used by KuruBot.
          </p>
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          <UploadSection onUploadSuccess={refetch} />
          <SettingsSection />
        </section>

        <DocumentsTable
          documents={documents}
          onPreview={handlePreview}
          onRefetch={refetch}
          previewLoading={previewLoading}
        />

        <UpcomingFeatures />

        <DocumentPreview previewDoc={previewDoc} onClose={handleClosePreview} />
      </div>
    </TooltipProvider>
  );
}
