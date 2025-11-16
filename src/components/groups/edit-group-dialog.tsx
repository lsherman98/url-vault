import { useState, useEffect } from "react";
import { Pin, Plus, X } from "lucide-react";
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetBookmarks } from "@/lib/api/queries";
import { useUpdateGroup } from "@/lib/api/mutations";
import type { GroupsResponse, BookmarksResponse } from "@/lib/pocketbase-types";

interface EditGroupDialogProps {
  group: GroupsResponse | null;
  onOpenChange: (open: boolean) => void;
}

export function EditGroupDialog({ group, onOpenChange }: EditGroupDialogProps) {
  const [title, setTitle] = useState("");
  const [pinned, setPinned] = useState(false);
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
  const [bookmarkSearch, setBookmarkSearch] = useState("");
  const [bookmarkPopoverOpen, setBookmarkPopoverOpen] = useState(false);

  const { data: allBookmarks } = useGetBookmarks();
  const updateGroup = useUpdateGroup();

  useEffect(() => {
    if (group) {
      setTitle(group.title || "");
      setPinned(group.pinned || false);
      setBookmarkIds(group.bookmarks || []);
    }
  }, [group]);

  const handleUpdate = async () => {
    if (!group) return;
    if (!title.trim()) {
      toast.error("Please enter a group title");
      return;
    }

    try {
      await updateGroup.mutateAsync({
        id: group.id,
        data: {
          title,
          pinned,
          bookmarks: bookmarkIds,
        },
      });
      toast.success("Group updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update group");
      console.error(error);
    }
  };

  const handleAddBookmark = (bookmarkId: string) => {
    if (bookmarkIds.includes(bookmarkId)) {
      toast.info("Bookmark already in group");
      return;
    }

    setBookmarkIds([...bookmarkIds, bookmarkId]);
    setBookmarkPopoverOpen(false);
    setBookmarkSearch("");
  };

  const handleRemoveBookmark = (bookmarkId: string) => {
    setBookmarkIds(bookmarkIds.filter((id) => id !== bookmarkId));
  };

  const getCurrentBookmarks = (): BookmarksResponse[] => {
    return allBookmarks?.filter((b) => bookmarkIds.includes(b.id)) || [];
  };

  const getAvailableBookmarks = (): BookmarksResponse[] => {
    return allBookmarks?.filter((b) => !bookmarkIds.includes(b.id)) || [];
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setBookmarkSearch("");
      setBookmarkPopoverOpen(false);
    }
  };

  return (
    <Dialog open={!!group} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-6xl max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>Update group details and manage bookmarks</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-8 py-4">
          <div className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter group title"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => setPinned(!pinned)}>
                  {pinned ? <Pin className="h-4 w-4 fill-current" /> : <Pin className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Add Bookmark</Label>
              <Popover open={bookmarkPopoverOpen} onOpenChange={setBookmarkPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Add bookmark to group
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-(--radix-popover-trigger-width)" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search bookmarks..."
                      value={bookmarkSearch}
                      onValueChange={setBookmarkSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No bookmarks found.</CommandEmpty>
                      <CommandGroup>
                        {getAvailableBookmarks()
                          .filter((b) =>
                            bookmarkSearch
                              ? b.url?.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
                                b.description?.toLowerCase().includes(bookmarkSearch.toLowerCase())
                              : true
                          )
                          .slice(0, 10)
                          .map((bookmark) => (
                            <CommandItem key={bookmark.id} onSelect={() => handleAddBookmark(bookmark.id)}>
                              <div className="flex flex-col min-w-0 w-full">
                                <span className="font-medium truncate">{bookmark.url}</span>
                                {bookmark.description && (
                                  <span className="text-xs text-muted-foreground truncate">{bookmark.description}</span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Current Bookmarks ({bookmarkIds.length})</Label>
            <ScrollArea className="h-[calc(90vh-300px)] border rounded-md">
              {bookmarkIds.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-sm">No bookmarks in this group yet</div>
              ) : (
                <div className="divide-y p-2">
                  {getCurrentBookmarks().map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="p-1 py-2 flex items-start gap-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm break-all line-clamp-2">{bookmark.url}</div>
                        {bookmark.description && (
                          <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{bookmark.description}</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8"
                        onClick={() => handleRemoveBookmark(bookmark.id)}
                        title="Remove bookmark from group"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
