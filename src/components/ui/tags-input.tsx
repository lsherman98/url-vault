import { X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";

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
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTags = useMemo(() => {
    const selectedTagTexts = new Set(tags.map((tag) => tag.text.toLowerCase()));
    return availableTags.filter(
      (tag) =>
        !selectedTagTexts.has(tag.text.toLowerCase()) && tag.text.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [availableTags, tags, inputValue]);

  const showCreate =
    inputValue.trim() &&
    !availableTags.some((tag) => tag.text.toLowerCase() === inputValue.trim().toLowerCase()) &&
    !tags.some((tag) => tag.text.toLowerCase() === inputValue.trim().toLowerCase());

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && filteredTags.length > 0) {
        // Calculate effective index considering "Create" option
        const hasCreateOption = showCreate;

        if (hasCreateOption && selectedIndex === 0) {
          addTag();
        } else {
          const tagIndex = hasCreateOption ? selectedIndex - 1 : selectedIndex;
          if (tagIndex >= 0 && tagIndex < filteredTags.length) {
            selectExistingTag(filteredTags[tagIndex]);
          } else if (!hasCreateOption && filteredTags.length === 0) {
            addTag();
          }
        }
      } else {
        addTag();
      }
    } else if (e.key === "," && !open) {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1].id);
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const totalItems = filteredTags.length + (showCreate ? 1 : 0);
      if (totalItems > 0) {
        setSelectedIndex((prev) => (prev + 1) % totalItems);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const totalItems = filteredTags.length + (showCreate ? 1 : 0);
      if (totalItems > 0) {
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
      }
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
    setSelectedIndex(0);
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
        <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
          {!showCreate && filteredTags.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">No tags found.</div>
          )}
          {showCreate && (
            <div
              onClick={() => addTag()}
              className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                selectedIndex === 0 && "bg-accent text-accent-foreground"
              )}
            >
              Create "{inputValue.trim()}"
            </div>
          )}
          {filteredTags.length > 0 && (
            <>
              {showCreate && <div className="h-px bg-muted my-1" />}
              {filteredTags.map((tag, index) => {
                const effectiveIndex = showCreate ? index + 1 : index;
                return (
                  <div
                    key={tag.id}
                    onClick={() => selectExistingTag(tag)}
                    className={cn(
                      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                      selectedIndex === effectiveIndex && "bg-accent text-accent-foreground"
                    )}
                  >
                    {tag.text}
                    {tags.some((t) => t.id === tag.id) && <Check className="ml-auto h-4 w-4" />}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
