import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Edit, Trash2, Pin, Plus, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { useGetGroups, useGetBookmarks, useGetGroup } from "@/lib/api/queries";
import { useCreateGroup, useUpdateGroup, useDeleteGroup } from "@/lib/api/mutations";
import type { GroupsResponse, BookmarksResponse } from "@/lib/pocketbase-types";
import { getUserRecord } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/_app/groups/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      groupId: (search.groupId as string) || undefined,
    };
  },
});

function RouteComponent() {
  const { groupId } = Route.useSearch();

  const [creatingGroup, setCreatingGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupsResponse | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<GroupsResponse | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(groupId);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [newGroupPinned, setNewGroupPinned] = useState(false);
  const [editGroupTitle, setEditGroupTitle] = useState("");
  const [editGroupPinned, setEditGroupPinned] = useState(false);
  const [editGroupBookmarks, setEditGroupBookmarks] = useState<string[]>([]);
  const [bookmarkSearch, setBookmarkSearch] = useState("");
  const [bookmarkPopoverOpen, setBookmarkPopoverOpen] = useState(false);

  const { data: groups = [] } = useGetGroups();
  const { data: allBookmarks = [] } = useGetBookmarks();
  const { data: selectedGroup } = useGetGroup(selectedGroupId);
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();

  // Update selectedGroupId when URL search param changes
  useEffect(() => {
    if (groupId) {
      setSelectedGroupId(groupId);
    }
  }, [groupId]);

  const handleCreateGroup = async () => {
    if (!newGroupTitle.trim()) {
      toast.error("Please enter a group title");
      return;
    }

    try {
      const user = getUserRecord();
      await createGroup.mutateAsync({
        title: newGroupTitle,
        pinned: newGroupPinned,
        bookmarks: [],
        user: user.id,
      });
      toast.success("Group created successfully");
      setCreatingGroup(false);
      setNewGroupTitle("");
      setNewGroupPinned(false);
    } catch (error) {
      toast.error("Failed to create group");
      console.error(error);
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;
    if (!editGroupTitle.trim()) {
      toast.error("Please enter a group title");
      return;
    }

    try {
      await updateGroup.mutateAsync({
        id: editingGroup.id,
        data: {
          title: editGroupTitle,
          pinned: editGroupPinned,
          bookmarks: editGroupBookmarks,
        },
      });
      toast.success("Group updated successfully");
      setEditingGroup(null);
    } catch (error) {
      toast.error("Failed to update group");
      console.error(error);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;

    try {
      await deleteGroup.mutateAsync(deletingGroup.id);
      toast.success("Group deleted successfully");
      setDeletingGroup(null);
    } catch (error) {
      toast.error("Failed to delete group");
      console.error(error);
    }
  };

  const handleTogglePin = async (group: GroupsResponse) => {
    try {
      await updateGroup.mutateAsync({
        id: group.id,
        data: { pinned: !group.pinned },
      });
      toast.success(group.pinned ? "Group unpinned" : "Group pinned");
    } catch (error) {
      toast.error("Failed to update group");
      console.error(error);
    }
  };

  const handleAddBookmarkToEditGroup = async (bookmarkId: string) => {
    if (editGroupBookmarks.includes(bookmarkId)) {
      toast.info("Bookmark already in group");
      return;
    }

    setEditGroupBookmarks([...editGroupBookmarks, bookmarkId]);
    setBookmarkPopoverOpen(false);
    setBookmarkSearch("");
  };

  const handleRemoveBookmarkFromEditGroup = (bookmarkId: string) => {
    setEditGroupBookmarks(editGroupBookmarks.filter((id) => id !== bookmarkId));
  };

  const getEditGroupBookmarks = (): BookmarksResponse[] => {
    return allBookmarks.filter((b) => editGroupBookmarks.includes(b.id));
  };

  const getAvailableBookmarks = (): BookmarksResponse[] => {
    return allBookmarks.filter((b) => !editGroupBookmarks.includes(b.id));
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Groups</h1>
        <Button onClick={() => setCreatingGroup(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Groups Table */}
        <div className={`${selectedGroupId ? "flex-1" : "w-full"} transition-all`}>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Bookmarks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No groups yet. Create one to get started!
                    </TableCell>
                  </TableRow>
                ) : (
                  groups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.title}</TableCell>
                      <TableCell>
                        <Button variant="link" className="p-0 h-auto" onClick={() => setSelectedGroupId(group.id)}>
                          {group.bookmarks?.length || 0} bookmarks
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleTogglePin(group)}>
                            {group.pinned ? <Pin className="h-4 w-4 fill-current" /> : <Pin className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingGroup(group);
                              setEditGroupTitle(group.title || "");
                              setEditGroupPinned(group.pinned || false);
                              setEditGroupBookmarks(group.bookmarks || []);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeletingGroup(group)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* View Group Bookmarks Card */}
        {selectedGroupId && selectedGroup && (
          <div className="w-[400px] h-[calc(100vh-210px)] max-h-[calc(100vh-210px)]">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{selectedGroup?.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {(selectedGroup as any)?.expand?.bookmarks?.length || 0} bookmark
                      {((selectedGroup as any)?.expand?.bookmarks?.length || 0) !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 h-8"
                      onClick={() => {
                        if (selectedGroup) {
                          setEditingGroup(selectedGroup);
                          setEditGroupTitle(selectedGroup.title || "");
                          setEditGroupPinned(selectedGroup.pinned || false);
                          setEditGroupBookmarks(selectedGroup.bookmarks || []);
                        }
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => setSelectedGroupId(undefined)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 h-full">
                <ScrollArea className="h-full">
                  {(selectedGroup as any)?.expand?.bookmarks && (selectedGroup as any)?.expand?.bookmarks.length > 0 ? (
                    <div className="space-y-3">
                      {((selectedGroup as any)?.expand?.bookmarks as BookmarksResponse[]).map(
                        (bookmark: BookmarksResponse) => (
                          <div key={bookmark.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-sm text-primary hover:underline break-all line-clamp-2"
                              >
                                {bookmark.url}
                              </a>
                              <Button variant="ghost" size="icon" className="shrink-0 h-6 w-6" asChild>
                                <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            </div>
                            {bookmark.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{bookmark.description}</p>
                            )}
                            {(bookmark as any)?.expand?.category && (
                              <Badge variant="secondary" className="text-xs">
                                {(bookmark as any).expand.category.title}
                              </Badge>
                            )}
                            {(bookmark as any)?.expand?.tags && (bookmark as any).expand.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {((bookmark as any).expand.tags as any[]).map((tag: any) => (
                                  <Badge key={tag.id} variant="outline" className="text-xs">
                                    {tag.title}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
                      <p className="text-sm">No bookmarks in this group yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (selectedGroup) {
                            setEditingGroup(selectedGroup);
                            setEditGroupTitle(selectedGroup.title || "");
                            setEditGroupPinned(selectedGroup.pinned || false);
                            setEditGroupBookmarks(selectedGroup.bookmarks || []);
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bookmarks
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={creatingGroup} onOpenChange={setCreatingGroup}>
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
                  value={newGroupTitle}
                  onChange={(e) => setNewGroupTitle(e.target.value)}
                  placeholder="Enter group title"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => setNewGroupPinned(!newGroupPinned)}>
                  {newGroupPinned ? <Pin className="h-4 w-4 fill-current" /> : <Pin className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatingGroup(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGroup}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={!!editingGroup} onOpenChange={(open) => !open && setEditingGroup(null)}>
        <DialogContent className="min-w-6xl max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>Update group details and manage bookmarks</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-8 py-4">
            {/* Left Column - Group Details */}
            <div className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-title"
                    value={editGroupTitle}
                    onChange={(e) => setEditGroupTitle(e.target.value)}
                    placeholder="Enter group title"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditGroupPinned(!editGroupPinned)}
                  >
                    {editGroupPinned ? <Pin className="h-4 w-4 fill-current" /> : <Pin className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Add Bookmark */}
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
                              <CommandItem key={bookmark.id} onSelect={() => handleAddBookmarkToEditGroup(bookmark.id)}>
                                <div className="flex flex-col min-w-0 w-full">
                                  <span className="font-medium truncate">{bookmark.url}</span>
                                  {bookmark.description && (
                                    <span className="text-xs text-muted-foreground truncate">
                                      {bookmark.description}
                                    </span>
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

            {/* Right Column - Current Bookmarks */}
            <div className="flex flex-col gap-2">
              <Label>Current Bookmarks ({editGroupBookmarks.length})</Label>
              <ScrollArea className="h-[calc(90vh-300px)] border rounded-md">
                {editGroupBookmarks.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground text-sm">No bookmarks in this group yet</div>
                ) : (
                  <div className="divide-y p-2">
                    {getEditGroupBookmarks().map((bookmark) => (
                      <div key={bookmark.id} className="p-1 py-2 flex items-start gap-3 hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm break-all line-clamp-2">{bookmark.url}</div>
                          {bookmark.description && (
                            <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {bookmark.description}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-8 w-8"
                          onClick={() => handleRemoveBookmarkFromEditGroup(bookmark.id)}
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
            <Button variant="outline" onClick={() => setEditingGroup(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateGroup}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Dialog */}
      <Dialog open={!!deletingGroup} onOpenChange={(open) => !open && setDeletingGroup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingGroup?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingGroup(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGroup}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
