import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteGroup } from "@/lib/api/mutations";
import type { GroupsResponse } from "@/lib/pocketbase-types";

interface DeleteGroupDialogProps {
  group: GroupsResponse | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteGroupDialog({ group, onOpenChange }: DeleteGroupDialogProps) {
  const deleteGroup = useDeleteGroup();

  const handleDelete = async () => {
    if (!group) return;

    try {
      await deleteGroup.mutateAsync(group.id);
      toast.success("Group deleted successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to delete group");
      console.error(error);
    }
  };

  return (
    <Dialog open={!!group} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Group</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{group?.title}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
