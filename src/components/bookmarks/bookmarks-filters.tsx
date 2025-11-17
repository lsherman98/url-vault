import { useState } from "react";
import { Check, ChevronsUpDown, FolderPlus, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useGetCategories, useGetTags } from "@/lib/api/queries";
import { useIsMobile } from "@/lib/hooks/use-mobile";

interface BookmarksFiltersProps {
  selectedCategories: string[];
  selectedTags: string[];
  filterStarred: boolean;
  filterOpenSource: boolean;
  searchQuery: string;
  selectedBookmarksCount: number;
  onCategoriesChange: (categories: string[]) => void;
  onTagsChange: (tags: string[]) => void;
  onStarredChange: (starred: boolean) => void;
  onOpenSourceChange: (openSource: boolean) => void;
  onSearchChange: (search: string) => void;
  onClearSelection: () => void;
  onAddToGroup: () => void;
}

export function BookmarksFilters({
  selectedCategories,
  selectedTags,
  filterStarred,
  filterOpenSource,
  searchQuery,
  selectedBookmarksCount,
  onCategoriesChange,
  onTagsChange,
  onStarredChange,
  onOpenSourceChange,
  onSearchChange,
  onClearSelection,
  onAddToGroup,
}: BookmarksFiltersProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const isMobile = useIsMobile();

  const { data: categories } = useGetCategories();
  const { data: tags } = useGetTags();

  const isSearching = searchQuery.length > 0;

  const handleClearAll = () => {
    onCategoriesChange([]);
    onTagsChange([]);
    onStarredChange(false);
    onOpenSourceChange(false);
    onSearchChange("");
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedTags.length > 0 ||
    filterStarred ||
    filterOpenSource ||
    searchQuery.length > 0;

  const filtersHeader = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
        {isMobile ? (
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
              <h2 className="text-base md:text-lg font-semibold flex items-center gap-1">
                Filters
                <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
              </h2>
            </Button>
          </CollapsibleTrigger>
        ) : (
          <h2 className="text-base md:text-lg font-semibold">Filters</h2>
        )}
        {selectedBookmarksCount > 0 && (
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-xs md:text-sm font-medium text-muted-foreground">
              {selectedBookmarksCount} selected
            </span>
            <Button variant="ghost" size="sm" onClick={onClearSelection} className="text-xs md:text-sm h-7 md:h-8">
              Clear
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        {selectedBookmarksCount > 0 && (
          <Button onClick={onAddToGroup} size="sm" className="text-xs md:text-sm h-7 md:h-9">
            <FolderPlus className="mr-0 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Add to Group</span>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearAll}
          disabled={!hasActiveFilters}
          className="text-xs md:text-sm h-7 md:h-9"
        >
          <span className="hidden sm:inline">Clear All</span>
          <span className="sm:hidden">Clear</span>
        </Button>
      </div>
    </div>
  );

  const filtersContent = (
    <div className="flex flex-wrap gap-2 md:gap-4 p-2 md:p-4 border rounded-lg bg-card">
      <div className="flex flex-col gap-1 md:gap-2 w-full md:w-auto">
        <Label className="font-medium text-xs md:text-sm">Search</Label>
        <div className="relative w-full md:w-[280px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-7 md:pl-8 h-8 md:h-10 text-xs md:text-sm"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1 md:gap-2">
        <Label className="font-medium text-xs md:text-sm">Categories</Label>
        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-between w-full md:w-[220px] h-8 md:h-10 text-xs md:text-sm"
              disabled={isSearching}
            >
              {selectedCategories.length > 0 ? `${selectedCategories.length} selected` : "Select"}
              <ChevronsUpDown className="ml-2 h-3 w-3 md:h-4 md:w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[220px]">
            <Command>
              <CommandInput placeholder="Search categories..." className="text-xs md:text-sm" />
              <CommandList>
                <CommandEmpty className="text-xs md:text-sm">No categories found.</CommandEmpty>
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
                      className="text-xs md:text-sm"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3 w-3 md:h-4 md:w-4",
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
      <div className="flex flex-col gap-1 md:gap-2 min-w-40 md:min-w-[200px]">
        <Label className="font-medium text-xs md:text-sm">Tags</Label>
        <Popover open={tagOpen} onOpenChange={setTagOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-between h-8 md:h-10 text-xs md:text-sm" disabled={isSearching}>
              {selectedTags.length > 0 ? `${selectedTags.length} selected` : "Select tags..."}
              <ChevronsUpDown className="ml-2 h-3 w-3 md:h-4 md:w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search tags..." className="text-xs md:text-sm" />
              <CommandList>
                <CommandEmpty className="text-xs md:text-sm">No tags found.</CommandEmpty>
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
                      className="text-xs md:text-sm"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3 w-3 md:h-4 md:w-4",
                          selectedTags.includes(tag.id) ? "opacity-100" : "opacity-0"
                        )}
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
      <div className="flex gap-3 md:gap-6 flex-wrap">
        <div className="flex flex-col gap-1 md:gap-2">
          <Label className="font-medium text-xs md:text-sm">Starred</Label>
          <div className="flex items-center h-8 md:h-10 space-x-2">
            <Switch
              id="starred-filter"
              checked={filterStarred}
              onCheckedChange={onStarredChange}
              disabled={isSearching}
            />
            <Label
              htmlFor="starred-filter"
              className={cn("text-xs md:text-sm text-muted-foreground cursor-pointer", isSearching && "opacity-50")}
            >
              {filterStarred ? "is starred" : "Show all"}
            </Label>
          </div>
        </div>
        <div className="flex flex-col gap-1 md:gap-2">
          <Label className="font-medium text-xs md:text-sm">Open Source</Label>
          <div className="flex items-center h-8 md:h-10 space-x-2">
            <Switch
              id="opensource-filter"
              checked={filterOpenSource}
              onCheckedChange={onOpenSourceChange}
              disabled={isSearching}
            />
            <Label
              htmlFor="opensource-filter"
              className={cn("text-xs md:text-sm text-muted-foreground cursor-pointer", isSearching && "opacity-50")}
            >
              {filterOpenSource ? "is open source" : "Show all"}
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
        {filtersHeader}
        <CollapsibleContent>{filtersContent}</CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className="space-y-2">
      {filtersHeader}
      {filtersContent}
    </div>
  );
}
