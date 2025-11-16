import * as React from "react";
import { X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface Tag {
  id: string;
  text: string;
}

interface TagsInputProps {
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  placeholder?: string;
  className?: string;
  availableTags?: Tag[];
}

export function TagsInput({
  tags,
  onTagsChange,
  placeholder = "Add tags...",
  className,
  availableTags = [],
}: TagsInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Filter available tags based on input and exclude already selected tags
  const filteredTags = React.useMemo(() => {
    const selectedTagTexts = new Set(tags.map((tag) => tag.text.toLowerCase()));
    return availableTags.filter(
      (tag) =>
        !selectedTagTexts.has(tag.text.toLowerCase()) && tag.text.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [availableTags, tags, inputValue]);

  // Check if we should show "Create" option
  const showCreate =
    inputValue.trim() &&
    !availableTags.some((tag) => tag.text.toLowerCase() === inputValue.trim().toLowerCase()) &&
    !tags.some((tag) => tag.text.toLowerCase() === inputValue.trim().toLowerCase());

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Remove last tag if input is empty
      removeTag(tags[tags.length - 1].id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const addTag = (tagText?: string) => {
    const trimmedValue = (tagText || inputValue).trim();
    if (trimmedValue && !tags.some((tag) => tag.text.toLowerCase() === trimmedValue.toLowerCase())) {
      const newTag: Tag = {
        id: `temp-${Date.now()}-${Math.random()}`,
        text: trimmedValue,
      };
      onTagsChange([...tags, newTag]);
      setInputValue("");
      setOpen(false);
    }
  };

  const selectExistingTag = (tag: Tag) => {
    if (!tags.some((t) => t.id === tag.id)) {
      onTagsChange([...tags, tag]);
      setInputValue("");
      setOpen(false);
    }
  };

  const removeTag = (tagId: string) => {
    onTagsChange(tags.filter((tag) => tag.id !== tagId));
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    // Open popover if there's input
    if (value.trim()) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "flex min-h-10 w-full flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            className
          )}
          onClick={handleContainerClick}
        >
          {tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
              {tag.text}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag.id);
                }}
                className="ml-1 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (inputValue.trim()) setOpen(true);
            }}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        style={{ width: "var(--radix-popover-trigger-width)" }}
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            {!showCreate && filteredTags.length === 0 && <CommandEmpty>No tags found.</CommandEmpty>}
            {showCreate && (
              <CommandGroup>
                <CommandItem onSelect={() => addTag()} className="cursor-pointer">
                  Create "{inputValue.trim()}"
                </CommandItem>
              </CommandGroup>
            )}
            {filteredTags.length > 0 && (
              <CommandGroup heading="Existing Tags">
                {filteredTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.text}
                    onSelect={() => selectExistingTag(tag)}
                    className="cursor-pointer"
                  >
                    {tag.text}
                    <Check className="ml-auto h-4 w-4 opacity-0" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
