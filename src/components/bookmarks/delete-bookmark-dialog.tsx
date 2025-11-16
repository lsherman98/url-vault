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
import { useDeleteBookmark } from "@/lib/api/mutations";
import type { BookmarksResponse } from "@/lib/pocketbase-types";

interface DeleteBookmarkDialogProps {
  bookmark: BookmarksResponse | null;
  onClose: () => void;
}

export function DeleteBookmarkDialog({ bookmark, onClose }: DeleteBookmarkDialogProps) {
  const deleteBookmark = useDeleteBookmark();

  const handleDelete = async () => {
    if (!bookmark) return;

    try {
      await deleteBookmark.mutateAsync(bookmark.id);
      toast.success("Bookmark deleted");
      onClose();
    } catch (error) {
      toast.error("Failed to delete bookmark");
      console.error(error);
    }
  };

  return (
    <Dialog open={!!bookmark} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Bookmark</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this bookmark? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {bookmark && (
          <div className="py-4">
            <p className="text-sm font-medium">URL:</p>
            <p className="text-sm text-muted-foreground break-all">{bookmark.url}</p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
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
