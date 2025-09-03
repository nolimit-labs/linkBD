import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2, CheckCircle2, Building2, FileText, Users } from "lucide-react";
import { useDeleteUser } from "@/api/user";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteUserDialogProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteUserDialog({ user, open, onOpenChange }: DeleteUserDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [deleteResult, setDeleteResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const deleteUser = useDeleteUser();
  const queryClient = useQueryClient();
  
  const isConfirmed = confirmationText === user.email;
  const isDeleted = deleteResult !== null;
  const hasError = error !== null;

  const handleDelete = async () => {
    if (!isConfirmed) return;

    try {
      const result = await deleteUser.mutateAsync(user.id);
      setDeleteResult(result);
      setError(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setDeleteResult(null);
    }
  };

  const handleClose = () => {
    // If we successfully deleted a user, invalidate the users query to refresh the list
    if (deleteResult) {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    }
    
    onOpenChange(false);
    setConfirmationText("");
    setDeleteResult(null);
    setError(null);
  };

  // Success State
  if (isDeleted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <DialogTitle className="text-lg">User Deleted Successfully</DialogTitle>
                <DialogDescription>
                  The user and all associated data have been removed
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Deleted User</span>
                </div>
                <div className="text-sm text-green-700">
                  <p><strong>Email:</strong> {deleteResult.deletedUser.email}</p>
                  {deleteResult.deletedUser.name && (
                    <p><strong>Name:</strong> {deleteResult.deletedUser.name}</p>
                  )}
                  <p><strong>ID:</strong> {deleteResult.deletedUser.id}</p>
                </div>
              </div>
            </div>

            {deleteResult.deletedOrganizations > 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Organizations Deleted</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {deleteResult.deletedOrganizations} organization(s) owned by this user were also permanently deleted along with all their content.
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-800">Additional Data Removed</span>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• All posts and social content</li>
                  <li>• All uploaded files and media</li>
                  <li>• All organization memberships</li>
                  <li>• All likes and interactions</li>
                  <li>• All authentication sessions</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Error State
  if (hasError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle className="text-lg">Deletion Failed</DialogTitle>
                <DialogDescription>
                  An error occurred while deleting the user
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm text-destructive font-medium">Error Details:</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                setError(null);
                setConfirmationText("");
              }}
            >
              Try Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Default Confirmation State
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-lg">Delete User</DialogTitle>
              <DialogDescription>
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive">
                This will permanently delete:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• The user account for {user.email}</li>
                <li>• All organizations they own</li>
                <li>• All their posts and content</li>
                <li>• All their uploaded files</li>
                <li>• All their memberships and relationships</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Type <span className="font-mono font-medium">{user.email}</span> to confirm:
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Enter the user's email"
              className="font-mono"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={deleteUser.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || deleteUser.isPending}
          >
            {deleteUser.isPending ? (
              "Deleting..."
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}