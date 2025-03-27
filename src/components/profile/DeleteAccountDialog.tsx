
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteAccountDialog = ({ open, onOpenChange }: DeleteAccountDialogProps) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      // Get the current session for the authorization token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No active session found");
      }

      // First, try to use the admin edge function to delete the user
      try {
        const response = await supabase.functions.invoke('admin-actions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: {
            action: 'deleteUser',
            userId: user.id
          }
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        console.log('Account deleted successfully through admin-actions function');
        toast.success("Your account has been permanently deleted");
        navigate("/");
        return;
      } catch (adminError: any) {
        console.warn("Admin deletion failed, falling back to manual cleanup:", adminError.message);
        
        // Fallback: If admin function fails, try to clean up user data and sign out
        try {
          // Delete profile data if you have a profiles table
          await supabase
            .from('profiles')
            .delete()
            .eq('id', user.id);
        } catch (dataError) {
          console.log("Note: Some user data might remain in the database");
        }
        
        // Sign out the user
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
        
        toast.success("Your account has been signed out. For permanent deletion, please contact support.");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Error during account deletion process:", error);
      toast.error(error.message || "Failed to process account deletion");
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm font-medium text-destructive">
            Are you absolutely sure you want to delete your account?
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                Processing...
              </>
            ) : (
              "Delete Account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog;
