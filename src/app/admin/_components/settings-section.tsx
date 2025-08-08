import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export function SettingsSection() {
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
            <p className="font-medium">512 tokens</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Overlap</p>
            <p className="font-medium">64 tokens</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Embedder</p>
            <p className="font-medium">OpenAI text-embedding-3-large</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Storage</p>
            <p className="font-medium">Postgres + Vectors</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
