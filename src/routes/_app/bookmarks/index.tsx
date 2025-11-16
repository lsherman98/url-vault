import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Edit, ExternalLink, Star, Trash2, Code2, FolderPlus, Github } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { Textarea } from "@/components/ui/textarea";
import { TagsInput, type Tag } from "@/components/ui/tags-input";
import { cn, getUserRecord } from "@/lib/utils";
import { useGetBookmarks, useGetCategories, useGetTags, useGetGroups } from "@/lib/api/queries";
import {
  useUpdateBookmark,
  useDeleteBookmark,
  useCreateTag,
  useCreateGroup,
  useUpdateGroup,
} from "@/lib/api/mutations";
import type { BookmarksResponse, CategoriesResponse, TagsResponse } from "@/lib/pocketbase-types";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_app/bookmarks/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterStarred, setFilterStarred] = useState(false);
  const [filterOpenSource, setFilterOpenSource] = useState(false);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarksResponse | null>(null);
  const [deletingBookmark, setDeletingBookmark] = useState<BookmarksResponse | null>(null);
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);
  const [addingToGroup, setAddingToGroup] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");
  const [groupPopoverOpen, setGroupPopoverOpen] = useState(false);

  const { data: bookmarksData } = useGetBookmarks(
    selectedCategories.length > 0 ? selectedCategories : undefined,
    selectedTags.length > 0 ? selectedTags : undefined,
    filterStarred || undefined,
    filterOpenSource || undefined
  );
  const { data: categories } = useGetCategories();
  const { data: tags } = useGetTags();
  const { data: groups } = useGetGroups();

  const updateBookmark = useUpdateBookmark();
  const deleteBookmark = useDeleteBookmark();
  const createTag = useCreateTag();
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();

  const handleToggleStar = async (bookmark: BookmarksResponse) => {
    try {
      await updateBookmark.mutateAsync({
        id: bookmark.id,
        data: { starred: !bookmark.starred },
      });
    } catch (error) {
      toast.error("Failed to update bookmark");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deletingBookmark) return;

    try {
      await deleteBookmark.mutateAsync(deletingBookmark.id);
      toast.success("Bookmark deleted");
      setDeletingBookmark(null);
    } catch (error) {
      toast.error("Failed to delete bookmark");
      console.error(error);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find((c) => c.id === categoryId);
    return category?.category;
  };

  const getTagNames = (tagIds: string[]) => {
    return tagIds
      .map((tagId) => {
        const tag = tags?.find((t) => t.id === tagId);
        return tag?.tag || null;
      })
      .filter(Boolean) as string[];
  };

  const handleToggleBookmarkSelection = (bookmarkId: string) => {
    setSelectedBookmarks((prev) =>
      prev.includes(bookmarkId) ? prev.filter((id) => id !== bookmarkId) : [...prev, bookmarkId]
    );
  };

  const handleToggleAllBookmarks = () => {
    if (selectedBookmarks.length === bookmarksData?.length) {
      setSelectedBookmarks([]);
    } else {
      setSelectedBookmarks(bookmarksData?.map((b) => b.id) || []);
    }
  };

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
      setSelectedBookmarks([]);
      setGroupPopoverOpen(false);
      setGroupSearch("");
      setAddingToGroup(false);
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
      setSelectedBookmarks([]);
      setGroupPopoverOpen(false);
      setGroupSearch("");
      setAddingToGroup(false);
    } catch (error) {
      toast.error("Failed to create group");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bookmarks</h1>
        <div className="text-sm text-muted-foreground">{bookmarksData?.length} bookmarks</div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            {selectedBookmarks.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">{selectedBookmarks.length} selected</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedBookmarks([])}>
                  Clear selection
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedBookmarks.length > 0 && (
              <Button onClick={() => setAddingToGroup(true)} size="sm">
                <FolderPlus className="mr-2 h-4 w-4" />
                Add to Group
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategories([]);
                setSelectedTags([]);
                setFilterStarred(false);
                setFilterOpenSource(false);
              }}
              disabled={
                selectedCategories.length === 0 && selectedTags.length === 0 && !filterStarred && !filterOpenSource
              }
            >
              Clear All Filters
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-card">
          <div className="flex flex-col gap-2">
            <Label className="font-medium">Categories</Label>
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between w-[220px]">
                  {selectedCategories.length > 0 ? `${selectedCategories.length} selected` : "Select"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[220px]">
                <Command>
                  <CommandInput placeholder="Search categories..." />
                  <CommandList>
                    <CommandEmpty>No category found.</CommandEmpty>
                    <CommandGroup>
                      {categories?.map((category) => (
                        <CommandItem
                          key={category.id}
                          value={category.category}
                          onSelect={() => {
                            setSelectedCategories((prev) =>
                              prev.includes(category.id)
                                ? prev.filter((id) => id !== category.id)
                                : [...prev, category.id]
                            );
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCategories.includes(category.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {category.category}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-2 min-w-[200px]">
            <Label className="font-medium">Tags</Label>
            <Popover open={tagOpen} onOpenChange={setTagOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between">
                  {selectedTags.length > 0 ? `${selectedTags.length} selected` : "Select tags..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search tags..." />
                  <CommandList>
                    <CommandEmpty>No tag found.</CommandEmpty>
                    <CommandGroup>
                      {tags?.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          value={tag.tag}
                          onSelect={() => {
                            setSelectedTags((prev) =>
                              prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                            );
                          }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", selectedTags.includes(tag.id) ? "opacity-100" : "opacity-0")}
                          />
                          {tag.tag}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex gap-6">
            <div className="flex flex-col gap-2">
              <Label className="font-medium">Starred</Label>
              <div className="flex items-center h-10 space-x-2">
                <Switch id="starred-filter" checked={filterStarred} onCheckedChange={setFilterStarred} />
                <Label htmlFor="starred-filter" className="text-sm text-muted-foreground cursor-pointer">
                  {filterStarred ? "Show starred only" : "Show all"}
                </Label>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="font-medium">Open Source</Label>
              <div className="flex items-center h-10 space-x-2">
                <Switch id="opensource-filter" checked={filterOpenSource} onCheckedChange={setFilterOpenSource} />
                <Label htmlFor="opensource-filter" className="text-sm text-muted-foreground cursor-pointer">
                  {filterOpenSource ? "Show open source only" : "Show all"}
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  checked={
                    bookmarksData && bookmarksData.length > 0 && selectedBookmarks.length === bookmarksData.length
                  }
                  onCheckedChange={handleToggleAllBookmarks}
                />
              </TableHead>
              <TableHead className="w-8"></TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookmarksData?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No bookmarks found
                </TableCell>
              </TableRow>
            ) : (
              bookmarksData?.map((bookmark) => (
                <TableRow key={bookmark.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedBookmarks.includes(bookmark.id)}
                      onCheckedChange={() => handleToggleBookmarkSelection(bookmark.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleToggleStar(bookmark)} className="h-8 w-8">
                      <Star
                        className={cn(
                          "h-4 w-4",
                          bookmark.starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                        )}
                      />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 max-w-md truncate"
                      >
                        {bookmark.url}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                      {bookmark.open_source && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Code2 className="h-3 w-3" />
                          Open Source
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getCategoryName(bookmark.category)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getTagNames(bookmark.tags).map((tagName) => (
                        <Badge key={tagName} variant="secondary">
                          {tagName}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    {bookmark.description ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-sm text-muted-foreground truncate cursor-help">{bookmark.description}</p>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>{bookmark.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <p className="text-sm text-muted-foreground">—</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingBookmark(bookmark)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingBookmark(bookmark)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
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
      <EditBookmarkDialog
        bookmark={editingBookmark}
        categories={categories || []}
        tags={tags || []}
        onClose={() => setEditingBookmark(null)}
        onSave={async (data) => {
          if (!editingBookmark) return;
          try {
            await updateBookmark.mutateAsync({ id: editingBookmark.id, data });
            toast.success("Bookmark updated");
            setEditingBookmark(null);
          } catch (error) {
            toast.error("Failed to update bookmark");
            console.error(error);
          }
        }}
        createTag={createTag}
      />
      <Dialog open={!!deletingBookmark} onOpenChange={() => setDeletingBookmark(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bookmark</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bookmark? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingBookmark && (
            <div className="py-4">
              <p className="text-sm font-medium">URL:</p>
              <p className="text-sm text-muted-foreground break-all">{deletingBookmark.url}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingBookmark(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={addingToGroup} onOpenChange={setAddingToGroup}>
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
            <Button variant="outline" onClick={() => setAddingToGroup(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface EditBookmarkDialogProps {
  bookmark: BookmarksResponse | null;
  categories: CategoriesResponse[];
  tags: TagsResponse[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  createTag: any;
}

function EditBookmarkDialog({
  bookmark,
  categories,
  tags: allTags,
  onClose,
  onSave,
  createTag,
}: EditBookmarkDialogProps) {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [starred, setStarred] = useState(false);
  const [openSource, setOpenSource] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    if (bookmark) {
      setUrl(bookmark.url || "");
      setDescription(bookmark.description || "");
      setCategory(bookmark.category || "");
      setStarred(bookmark.starred || false);
      setOpenSource(bookmark.open_source || false);

      const tagObjects: Tag[] = (bookmark.tags || [])
        .map((tagId) => {
          const tag = allTags.find((t) => t.id === tagId);
          return tag ? { id: tag.id, text: tag.tag || "" } : null;
        })
        .filter(Boolean) as Tag[];
      setSelectedTags(tagObjects);
    }
  }, [bookmark, allTags]);

  const handleSave = async () => {
    const tagIds: string[] = [];
    for (const tag of selectedTags) {
      const existingTag = allTags.find((t) => t.tag?.toLowerCase() === tag.text.toLowerCase());
      if (existingTag) {
        tagIds.push(existingTag.id);
      } else {
        const newTag = await createTag.mutateAsync({
          tag: tag.text,
          user: bookmark?.user,
        });
        tagIds.push(newTag.id);
      }
    }

    await onSave({
      url,
      description,
      category: category || undefined,
      tags: tagIds,
      starred,
      open_source: openSource,
    });
  };

  if (!bookmark) return null;

  const selectedCategory = categories.find((c) => c.id === category);

  return (
    <Dialog open={!!bookmark} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
          <DialogDescription>Make changes to your bookmark.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-url">URL</Label>
            <Input id="edit-url" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedCategory?.category || "Select category..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search category..." />
                  <CommandList>
                    <CommandEmpty>No category found.</CommandEmpty>
                    <CommandGroup>
                      {categories.map((cat) => (
                        <CommandItem
                          key={cat.id}
                          value={cat.category}
                          onSelect={() => {
                            setCategory(cat.id);
                            setCategoryOpen(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", category === cat.id ? "opacity-100" : "opacity-0")} />
                          {cat.category}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <TagsInput tags={selectedTags} onTagsChange={setSelectedTags} />
          </div>
          <div className="space-y-2">
            <Label>Options</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant={starred ? "default" : "outline"}
                size="icon"
                onClick={() => setStarred(!starred)}
                className="h-10 w-10 shadow-sm"
                title={starred ? "Remove star" : "Star bookmark"}
              >
                <Star className={cn("h-5 w-5", starred && "fill-current")} />
              </Button>
              <Button
                type="button"
                variant={openSource ? "default" : "outline"}
                size="icon"
                onClick={() => setOpenSource(!openSource)}
                className="h-10 w-10 shadow-sm"
                title={openSource ? "Open source" : "Mark as open source"}
              >
                <Github className={cn("h-5 w-5", openSource && "fill-current")} />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
