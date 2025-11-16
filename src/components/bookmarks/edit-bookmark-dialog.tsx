import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Star, Github } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { TagsInput, type Tag } from "@/components/ui/tags-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useGetCategories, useGetTags } from "@/lib/api/queries";
import { useUpdateBookmark, useCreateTag } from "@/lib/api/mutations";
import type { BookmarksResponse } from "@/lib/pocketbase-types";

interface EditBookmarkDialogProps {
  bookmark: BookmarksResponse | null;
  onClose: () => void;
}

export function EditBookmarkDialog({ bookmark, onClose }: EditBookmarkDialogProps) {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [starred, setStarred] = useState(false);
  const [openSource, setOpenSource] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const { data: categories } = useGetCategories();
  const { data: allTags } = useGetTags();
  const updateBookmark = useUpdateBookmark();
  const createTag = useCreateTag();

  useEffect(() => {
    if (bookmark) {
      setUrl(bookmark.url || "");
      setDescription(bookmark.description || "");
      setCategory(bookmark.category || "");
      setStarred(bookmark.starred || false);
      setOpenSource(bookmark.open_source || false);

      const tagObjects: Tag[] = (bookmark.tags || [])
        .map((tagId) => {
          const tag = allTags?.find((t) => t.id === tagId);
          return tag ? { id: tag.id, text: tag.tag || "" } : null;
        })
        .filter(Boolean) as Tag[];
      setSelectedTags(tagObjects);
    }
  }, [bookmark, allTags]);

  const handleSave = async () => {
    if (!bookmark) return;

    const tagIds: string[] = [];
    for (const tag of selectedTags) {
      const existingTag = allTags?.find((t) => t.tag?.toLowerCase() === tag.text.toLowerCase());
      if (existingTag) {
        tagIds.push(existingTag.id);
      } else {
        const newTag = await createTag.mutateAsync({
          tag: tag.text,
          user: bookmark.user,
        });
        tagIds.push(newTag.id);
      }
    }

    try {
      await updateBookmark.mutateAsync({
        id: bookmark.id,
        data: {
          url,
          description,
          category: category || undefined,
          tags: tagIds,
          starred,
          open_source: openSource,
        },
      });
      toast.success("Bookmark updated");
      onClose();
    } catch (error) {
      toast.error("Failed to update bookmark");
      console.error(error);
    }
  };

  if (!bookmark) return null;

  const selectedCategory = categories?.find((c) => c.id === category);

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
                      {categories?.map((cat) => (
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
