import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Play, RotateCcw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Migration } from '@/api/migrations';

interface MigrationCardProps {
  migration: Migration;
  onRun: (filename: string) => Promise<any>;
  onRollback: (filename: string) => Promise<any>;
  isRunning?: boolean;
}

export function MigrationCard({ migration, onRun, onRollback, isRunning }: MigrationCardProps) {
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');

  const getStatusBadge = () => {
    if (!migration.lastRun) {
      return <Badge variant="outline">Never Run</Badge>;
    }

    switch (migration.lastRun.status) {
      case 'completed':
        return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'rolled_back':
        return <Badge className="bg-yellow-600"><RotateCcw className="w-3 h-3 mr-1" />Rolled Back</Badge>;
      case 'running':
        return <Badge className="bg-blue-600"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Running</Badge>;
      default:
        return <Badge variant="outline">{migration.lastRun.status}</Badge>;
    }
  };

  const handleRun = async () => {
    setError('');
    setOutput('');
    try {
      const result = await onRun(migration.filename);
      setOutput(result.output || 'Migration completed successfully');
      setShowRunDialog(false);
    } catch (err: any) {
      setError(err.message || 'Failed to run migration');
    }
  };

  const handleRollback = async () => {
    setError('');
    setOutput('');
    try {
      const result = await onRollback(migration.filename);
      setOutput(result.output || 'Rollback completed successfully');
      setShowRollbackDialog(false);
    } catch (err: any) {
      setError(err.message || 'Failed to rollback migration');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {migration.sequence}. {migration.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {migration.filename}
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          {migration.lastRun && (
            <div className="mb-4 text-sm text-muted-foreground space-y-1">
              <div>Last run: {format(new Date(migration.lastRun.startedAt), 'PPp')}</div>
              {migration.lastRun.completedAt && (
                <div>Completed: {format(new Date(migration.lastRun.completedAt), 'PPp')}</div>
              )}
              {migration.lastRun.error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{migration.lastRun.error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setShowRunDialog(true)}
              disabled={isRunning || migration.lastRun?.status === 'running'}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Migration
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRollbackDialog(true)}
              disabled={isRunning || migration.lastRun?.status === 'running' || !migration.lastRun}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Rollback
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Run Confirmation Dialog */}
      <Dialog open={showRunDialog} onOpenChange={setShowRunDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Migration</DialogTitle>
            <DialogDescription>
              Are you sure you want to run this migration?
              <br />
              <strong className="text-foreground">{migration.filename}</strong>
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {output && (
            <Alert>
              <AlertDescription>
                <pre className="whitespace-pre-wrap text-xs">{output}</pre>
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRunDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRun} disabled={isRunning}>
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                'Run Migration'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rollback Confirmation Dialog */}
      <Dialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rollback Migration</DialogTitle>
            <DialogDescription>
              Are you sure you want to rollback this migration?
              <br />
              <strong className="text-foreground">{migration.filename}</strong>
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {output && (
            <Alert>
              <AlertDescription>
                <pre className="whitespace-pre-wrap text-xs">{output}</pre>
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRollbackDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRollback} disabled={isRunning}>
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rolling back...
                </>
              ) : (
                'Rollback Migration'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}