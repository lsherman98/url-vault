import { useState } from "react";
import { Check, ChevronsUpDown, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useGetCategories, useGetTags } from "@/lib/api/queries";

interface BookmarksFiltersProps {
  selectedCategories: string[];
  selectedTags: string[];
  filterStarred: boolean;
  filterOpenSource: boolean;
  selectedBookmarksCount: number;
  onCategoriesChange: (categories: string[]) => void;
  onTagsChange: (tags: string[]) => void;
  onStarredChange: (starred: boolean) => void;
  onOpenSourceChange: (openSource: boolean) => void;
  onClearSelection: () => void;
  onAddToGroup: () => void;
}

export function BookmarksFilters({
  selectedCategories,
  selectedTags,
  filterStarred,
  filterOpenSource,
  selectedBookmarksCount,
  onCategoriesChange,
  onTagsChange,
  onStarredChange,
  onOpenSourceChange,
  onClearSelection,
  onAddToGroup,
}: BookmarksFiltersProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);

  const { data: categories } = useGetCategories();
  const { data: tags } = useGetTags();

  const handleClearAll = () => {
    onCategoriesChange([]);
    onTagsChange([]);
    onStarredChange(false);
    onOpenSourceChange(false);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedTags.length > 0 || filterStarred || filterOpenSource;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          {selectedBookmarksCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">{selectedBookmarksCount} selected</span>
              <Button variant="ghost" size="sm" onClick={onClearSelection}>
                Clear selection
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedBookmarksCount > 0 && (
            <Button onClick={onAddToGroup} size="sm">
              <FolderPlus className="mr-2 h-4 w-4" />
              Add to Group
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleClearAll} disabled={!hasActiveFilters}>
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
                  <CommandEmpty>No categories found.</CommandEmpty>
                  <CommandGroup>
                    {categories?.map((category) => (
                      <CommandItem
                        key={category.id}
                        value={category.category}
                        onSelect={() => {
                          onCategoriesChange(
                            selectedCategories.includes(category.id)
                              ? selectedCategories.filter((id) => id !== category.id)
                              : [...selectedCategories, category.id]
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
                  <CommandEmpty>No tags found.</CommandEmpty>
                  <CommandGroup>
                    {tags?.map((tag) => (
                      <CommandItem
                        key={tag.id}
                        value={tag.tag}
                        onSelect={() => {
                          onTagsChange(
                            selectedTags.includes(tag.id)
                              ? selectedTags.filter((id) => id !== tag.id)
                              : [...selectedTags, tag.id]
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
              <Switch id="starred-filter" checked={filterStarred} onCheckedChange={onStarredChange} />
              <Label htmlFor="starred-filter" className="text-sm text-muted-foreground cursor-pointer">
                {filterStarred ? "Show starred only" : "Show all"}
              </Label>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-medium">Open Source</Label>
            <div className="flex items-center h-10 space-x-2">
              <Switch id="opensource-filter" checked={filterOpenSource} onCheckedChange={onOpenSourceChange} />
              <Label htmlFor="opensource-filter" className="text-sm text-muted-foreground cursor-pointer">
                {filterOpenSource ? "Show open source only" : "Show all"}
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
