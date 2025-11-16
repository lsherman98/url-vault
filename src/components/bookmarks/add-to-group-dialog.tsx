import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { getUserRecord } from "@/lib/utils";
import { useGetGroups } from "@/lib/api/queries";
import { useCreateGroup, useUpdateGroup } from "@/lib/api/mutations";

interface AddToGroupDialogProps {
  isOpen: boolean;
  selectedBookmarks: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export function AddToGroupDialog({ isOpen, selectedBookmarks, onClose, onSuccess }: AddToGroupDialogProps) {
  const [groupSearch, setGroupSearch] = useState("");
  const [groupPopoverOpen, setGroupPopoverOpen] = useState(false);

  const { data: groups } = useGetGroups();
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();

  const handleAddToGroup = async (groupId: string) => {
    if (selectedBookmarks.length === 0) {
      toast.error("No bookmarks selected");
      return;
    }

    const group = groups?.find((g) => g.id === groupId);
    if (!group) return;

    const currentBookmarks = group.bookmarks || [];
    const newBookmarks = [...new Set([...currentBookmarks, ...selectedBookmarks])];

    try {
      await updateGroup.mutateAsync({
        id: groupId,
        data: { bookmarks: newBookmarks },
      });
      toast.success(`Added ${selectedBookmarks.length} bookmark(s) to ${group.title}`);
      setGroupPopoverOpen(false);
      setGroupSearch("");
      onSuccess();
    } catch (error) {
      toast.error("Failed to add bookmarks to group");
      console.error(error);
    }
  };

  const handleCreateGroupWithBookmarks = async (groupTitle: string) => {
    if (selectedBookmarks.length === 0) {
      toast.error("No bookmarks selected");
      return;
    }

    try {
      const user = getUserRecord();
      await createGroup.mutateAsync({
        title: groupTitle,
        bookmarks: selectedBookmarks,
        pinned: false,
        user: user.id,
      });
      toast.success(`Created group "${groupTitle}" with ${selectedBookmarks.length} bookmark(s)`);
      setGroupPopoverOpen(false);
      setGroupSearch("");
      onSuccess();
    } catch (error) {
      toast.error("Failed to create group");
      console.error(error);
    }
  };

  const handleClose = () => {
    setGroupSearch("");
    setGroupPopoverOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Group</DialogTitle>
          <DialogDescription>
            Add {selectedBookmarks.length} bookmark(s) to an existing group or create a new one
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label>Select or Create Group</Label>
          <Popover open={groupPopoverOpen} onOpenChange={setGroupPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between mt-2">
                Select group...
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search or create group..."
                  value={groupSearch}
                  onValueChange={setGroupSearch}
                />
                <CommandList>
                  <CommandEmpty>No group found.</CommandEmpty>
                  {groupSearch && !groups?.find((g) => g.title?.toLowerCase() === groupSearch.toLowerCase()) && (
                    <CommandGroup>
                      <CommandItem onSelect={() => handleCreateGroupWithBookmarks(groupSearch)}>
                        Create "{groupSearch}"
                      </CommandItem>
                    </CommandGroup>
                  )}
                  {groups && groups.length > 0 && (
                    <CommandGroup>
                      {groups.map((group) => (
                        <CommandItem key={group.id} value={group.title} onSelect={() => handleAddToGroup(group.id)}>
                          {group.title}
                          <span className="ml-auto text-xs text-muted-foreground">
                            {group.bookmarks?.length || 0} bookmarks
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
