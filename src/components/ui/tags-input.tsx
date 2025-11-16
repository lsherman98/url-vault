import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
}

export function TagsInput({ tags, onTagsChange, placeholder = "Add tags...", className }: TagsInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Remove last tag if input is empty
      removeTag(tags[tags.length - 1].id);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.some((tag) => tag.text.toLowerCase() === trimmedValue.toLowerCase())) {
      const newTag: Tag = {
        id: `temp-${Date.now()}-${Math.random()}`,
        text: trimmedValue,
      };
      onTagsChange([...tags, newTag]);
      setInputValue("");
    }
  };

  const removeTag = (tagId: string) => {
    onTagsChange(tags.filter((tag) => tag.id !== tagId));
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
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
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
