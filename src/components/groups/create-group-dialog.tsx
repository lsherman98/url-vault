import { useState } from "react";
import { Pin } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateGroup } from "@/lib/api/mutations";
import { getUserRecord } from "@/lib/utils";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const [title, setTitle] = useState("");
  const [pinned, setPinned] = useState(false);
  const createGroup = useCreateGroup();

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a group title");
      return;
    }

    try {
      const user = getUserRecord();
      await createGroup.mutateAsync({
        title,
        pinned,
        bookmarks: [],
        user: user.id,
      });
      toast.success("Group created successfully");
      onOpenChange(false);
      setTitle("");
      setPinned(false);
    } catch (error) {
      toast.error("Failed to create group");
      console.error(error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setTitle("");
      setPinned(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>Create a new bookmark group</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <div className="flex items-center gap-2">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter group title"
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => setPinned(!pinned)}>
                {pinned ? <Pin className="h-4 w-4 fill-current" /> : <Pin className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
