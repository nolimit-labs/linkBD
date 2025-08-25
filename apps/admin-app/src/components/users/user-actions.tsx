import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Ban, 
  UserCheck,
  Edit,
  Trash2 
} from "lucide-react";
import { admin } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { UpdateUserDialog } from "./update-user-dialog";

interface UserActionsProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role?: string | null;
    banned?: boolean;
  };
}

export function UserActions({ user }: UserActionsProps) {
  const queryClient = useQueryClient();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBanUser = async () => {
    if (!confirm(`Are you sure you want to ban ${user.email}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      // Ban the user
      await admin.banUser({
        userId: user.id,
        banReason: "Banned by admin",
        // banExpiresIn: 86400000, // Optional: 24 hours in milliseconds
      });

      // Refresh the users list
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      alert(`User ${user.email} has been banned successfully.`);
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnbanUser = async () => {
    if (!confirm(`Are you sure you want to unban ${user.email}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      // Unban the user
      await admin.unbanUser({
        userId: user.id,
      });

      // Refresh the users list
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      alert(`User ${user.email} has been unbanned successfully.`);
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Failed to unban user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImpersonateUser = async () => {
    if (!confirm(`Are you sure you want to impersonate ${user.email}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      // Impersonate the user
      const result = await admin.impersonateUser({
        userId: user.id,
      });

      if (result.data) {
        // Store the impersonation token or handle the impersonation
        console.log('Impersonation started:', result.data);
        
        // Redirect to the main app or handle impersonation UI
        // For now, we'll just show an alert
        alert(`Now impersonating ${user.email}. Refresh the page to see changes.`);
        
        // Optionally redirect to the main app
        // window.location.href = '/';
      }
    } catch (error) {
      console.error('Error impersonating user:', error);
      alert('Failed to impersonate user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            disabled={isLoading}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => setIsUpdateDialogOpen(true)}
            className="cursor-pointer"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleImpersonateUser}
            className="cursor-pointer"
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Impersonate
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {user.banned ? (
            <DropdownMenuItem 
              onClick={handleUnbanUser}
              className="cursor-pointer text-green-600 focus:text-green-600"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Unban User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={handleBanUser}
              className="cursor-pointer text-orange-600 focus:text-orange-600"
            >
              <Ban className="mr-2 h-4 w-4" />
              Ban User
            </DropdownMenuItem>
          )}

          <DropdownMenuItem 
            className="cursor-pointer text-destructive focus:text-destructive"
            disabled
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User (Disabled)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Update User Dialog */}
      {isUpdateDialogOpen && (
        <UpdateUserDialog 
          user={user} 
          open={isUpdateDialogOpen}
          onOpenChange={setIsUpdateDialogOpen}
        />
      )}
    </>
  );
}