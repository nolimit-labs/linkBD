import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/layout/page-header';
import { MigrationCard } from '@/components/migrations/migration-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Database, History, CheckCircle, XCircle, RotateCcw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useMigrations, useMigrationHistory, useRunMigration, useRollbackMigration } from '@/api/migrations';

export const Route = createFileRoute('/(app)/migrations')({
  component: MigrationsPage,
});

function MigrationsPage() {
  const [runningMigration, setRunningMigration] = useState<string | null>(null);

  // Use hooks from api/migrations.ts
  const { data: migrationsData, isLoading, error } = useMigrations(runningMigration);
  const { data: historyData } = useMigrationHistory();
  
  // Migration mutations with callbacks
  const runMigrationMutation = useRunMigration(
    (filename) => setRunningMigration(filename),
    () => setRunningMigration(null)
  );

  const rollbackMigrationMutation = useRollbackMigration(
    (filename) => setRunningMigration(filename),
    () => setRunningMigration(null)
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'rolled_back':
        return <RotateCcw className="w-4 h-4 text-yellow-600" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader
          title="Database Migrations"
          description="Manage custom data migrations and transformations"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader
          title="Database Migrations"
          description="Manage custom data migrations and transformations"
        />
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load migrations: {(error as Error).message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 space-y-6 ">
      <PageHeader
        title="Database Migrations"
        description="Manage custom data migrations and transformations (This is different from the migrations in the `src/drizzle/migrations` directory)"
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Migrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{migrationsData?.migrations.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {migrationsData?.migrations.filter(m => m.lastRun?.status === 'completed').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Never Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {migrationsData?.migrations.filter(m => !m.lastRun).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="migrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="migrations">
            <Database className="w-4 h-4 mr-2" />
            Available Migrations
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Run History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="migrations" className="space-y-4">
          {runningMigration && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Migration <strong>{runningMigration}</strong> is currently running...
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {migrationsData?.migrations.map((migration) => (
              <MigrationCard
                key={migration.filename}
                migration={migration}
                onRun={runMigrationMutation.mutateAsync}
                onRollback={rollbackMigrationMutation.mutateAsync}
                isRunning={runningMigration === migration.filename}
              />
            ))}
          </div>
          
          {migrationsData?.migrations.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No migration files found. Create migration files in:<br />
                <code className="text-sm">src/db/admin/migrations/</code>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Migration Run History</CardTitle>
              <CardDescription>
                Recent migration executions and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyData?.history && historyData.history.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Migration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Run By</TableHead>
                      <TableHead>Started At</TableHead>
                      <TableHead>Completed At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData.history.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell className="font-mono text-sm">
                          {run.migrationFile}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(run.status)}
                            <Badge
                              variant={
                                run.status === 'completed' ? 'default' :
                                run.status === 'failed' ? 'destructive' :
                                run.status === 'rolled_back' ? 'secondary' :
                                'outline'
                              }
                            >
                              {run.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {run.runByName || run.runByEmail || run.runBy}
                        </TableCell>
                        <TableCell>
                          {format(new Date(run.startedAt), 'PPp')}
                        </TableCell>
                        <TableCell>
                          {run.completedAt ? format(new Date(run.completedAt), 'PPp') : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No migration runs recorded yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}