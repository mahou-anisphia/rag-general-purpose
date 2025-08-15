"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Database,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  HardDrive,
  Activity,
  FileText,
  MessageSquare,
  Zap,
} from "lucide-react";
import { useNotifications } from "~/hooks/use-notifications";

export default function AdminDatabaseStatusPage() {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { showError } = useNotifications();

  const {
    data: status,
    refetch,
    isLoading,
    error,
  } = api.database.status.useQuery(undefined, {
    refetchInterval: autoRefresh ? 30000 : false, // Auto-refresh every 30 seconds if enabled
    onError: (error) =>
      showError({ title: "Failed to fetch database status", error }),
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const StatusIndicator = ({
    status: connectionStatus,
  }: {
    status: "connected" | "disconnected";
  }) => {
    if (connectionStatus === "connected") {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Connected</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-red-600">
        <XCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Disconnected</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Database className="h-6 w-6" />
            Database Status
          </h1>
          <p className="text-muted-foreground text-sm">
            Monitor the health and performance of your database services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "border-green-200 bg-green-50" : ""}
          >
            <Activity className="mr-2 h-4 w-4" />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      {status && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          Last updated: {formatTimestamp(status.lastUpdated)}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">
                Failed to load database status
              </span>
            </div>
            <p className="mt-2 text-sm text-red-600">{error.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Database Services */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* PostgreSQL / Prisma */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                PostgreSQL (Prisma)
              </div>
              {status?.prisma && (
                <StatusIndicator status={status.prisma.status} />
              )}
            </CardTitle>
            <CardDescription>
              Primary relational database for application data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status?.prisma ? (
              status.prisma.status === "connected" ? (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Version:</span>
                      <p className="font-medium">{status.prisma.version}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Database Size:
                      </span>
                      <p className="font-medium">
                        {status.prisma.databaseSize}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">
                      Connection Pool:
                    </span>
                    <div className="mt-1 flex gap-4">
                      <Badge variant="outline">
                        Active: {status.prisma.connectionPool.active}
                      </Badge>
                      <Badge variant="outline">
                        Idle: {status.prisma.connectionPool.idle}
                      </Badge>
                      <Badge variant="outline">
                        Total: {status.prisma.connectionPool.total}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-600">
                    Connection Error
                  </p>
                  <p className="mt-1 text-xs text-red-500">
                    {status.prisma.error}
                  </p>
                </div>
              )
            ) : (
              <div className="animate-pulse space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Qdrant Vector Database */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Qdrant Vector DB
              </div>
              {status?.qdrant && (
                <StatusIndicator status={status.qdrant.status} />
              )}
            </CardTitle>
            <CardDescription>
              Vector database for document embeddings and semantic search
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status?.qdrant ? (
              status.qdrant.status === "connected" ? (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Collection:</span>
                      <p className="font-medium">
                        {status.qdrant.collectionName}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline" className="ml-1">
                        {status.qdrant.collectionStatus}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Vector Points:
                      </span>
                      <p className="font-medium">
                        {status.qdrant.pointsCount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Indexed Vectors:
                      </span>
                      <p className="font-medium">
                        {status.qdrant.indexedVectorsCount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">
                      Embedding Model:
                    </span>
                    <p className="text-sm font-medium">
                      {status.qdrant.embeddingModel}
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-600">
                    Connection Error
                  </p>
                  <p className="mt-1 text-xs text-red-500">
                    {status.qdrant.error}
                  </p>
                </div>
              )
            ) : (
              <div className="animate-pulse space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Database Statistics */}
      {status?.stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Document Statistics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Total:</span>
                <span className="font-medium">
                  {status.stats.documents.total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Processed:
                </span>
                <span className="font-medium text-green-600">
                  {status.stats.documents.processed}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Pending:</span>
                <span className="font-medium text-orange-600">
                  {status.stats.documents.unprocessed}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Chat Statistics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Total Chats:
                </span>
                <span className="font-medium">{status.stats.chats}</span>
              </div>
            </CardContent>
          </Card>

          {/* Table Sizes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <HardDrive className="h-4 w-4" />
                Table Sizes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {status.stats.tableSizes.slice(0, 5).map((table) => (
                  <div
                    key={table.name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-muted-foreground truncate text-sm">
                      {table.name}:
                    </span>
                    <span className="text-sm font-medium">{table.size}</span>
                  </div>
                ))}
                {status.stats.tableSizes.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    No data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
