import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Settings } from "lucide-react";

export function SettingsSection() {
  const [debugLoading, setDebugLoading] = useState(false);

  const debugMutation = api.documents.debugQdrant.useMutation({
    onSuccess: (data) => {
      setDebugLoading(false);
      alert(
        `Debug completed successfully!\n\nCollection existed: ${data.collectionExists}\nMessage: ${data.message}`,
      );
    },
    onError: (error) => {
      setDebugLoading(false);
      alert("Debug failed: " + error.message);
    },
  });

  const handleDebug = () => {
    setDebugLoading(true);
    debugMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingestion Settings</CardTitle>
        <CardDescription>
          Current system configuration for document processing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Chunk Size</p>
            <p className="font-medium">1000 characters</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Overlap</p>
            <p className="font-medium">200 characters</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Embedder</p>
            <p className="font-medium">OpenAI text-embedding-3-large</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Storage</p>
            <p className="font-medium">Postgres + Qdrant</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDebug}
            disabled={debugLoading}
            className="w-full"
          >
            <Settings className="mr-2 size-4" />
            {debugLoading ? "Debugging..." : "Debug Qdrant Connection"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
