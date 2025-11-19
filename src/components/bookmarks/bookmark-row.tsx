import { Edit, ExternalLink, Star, Trash2, Github } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useUpdateBookmark } from "@/lib/api/mutations";
import { useGetCategories, useGetTags } from "@/lib/api/queries";
import type { BookmarksResponse } from "@/lib/pocketbase-types";

interface BookmarkRowProps {
  bookmark: BookmarksResponse;
  isSelected: boolean;
  onToggleSelection: (bookmarkId: string) => void;
  onEdit: (bookmark: BookmarksResponse) => void;
  onDelete: (bookmark: BookmarksResponse) => void;
}

export function BookmarkRow({ bookmark, isSelected, onToggleSelection, onEdit, onDelete }: BookmarkRowProps) {
  const { data: categories } = useGetCategories();
  const { data: tags } = useGetTags();
  const updateBookmark = useUpdateBookmark();

  const handleToggleStar = async () => {
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

  const getFullUrl = (url: string) => {
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <TableRow>
      <TableCell>
        <Checkbox checked={isSelected} onCheckedChange={() => onToggleSelection(bookmark.id)} />
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon" onClick={handleToggleStar} className="h-7 w-7 md:h-8 md:w-8">
          <Star
            className={cn(
              "h-3 w-3 md:h-4 md:w-4",
              bookmark.starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            )}
          />
        </Button>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 md:gap-2">
          <a
            href={getFullUrl(bookmark.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-1 max-w-[72px] md:max-w-xs truncate text-xs md:text-sm"
          >
            {bookmark.url}
            <ExternalLink className="h-2.5 w-2.5 md:h-3 md:w-3 shrink-0" />
          </a>
          {bookmark.open_source && (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <Github className="h-2.5 w-2.5 md:h-3 md:w-3" />
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant="outline" className="text-xs">
          {getCategoryName(bookmark.category)}
        </Badge>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-wrap gap-1 max-h-[52px] overflow-hidden relative">
              {getTagNames(bookmark.tags).map((tagName) => (
                <Badge key={tagName} variant="secondary" className="text-xs">
                  {tagName}
                </Badge>
              ))}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <div className="flex flex-wrap gap-1">
              {getTagNames(bookmark.tags).map((tagName) => (
                <Badge key={tagName} variant="secondary" className="text-xs">
                  {tagName}
                </Badge>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell className="max-w-md hidden xl:table-cell">
        {bookmark.description ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-xs md:text-sm text-muted-foreground truncate cursor-help">{bookmark.description}</p>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>{bookmark.description}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <p className="text-xs md:text-sm text-muted-foreground">—</p>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1 md:gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(bookmark)} className="h-7 w-7 md:h-8 md:w-8">
            <Edit className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(bookmark)}
            className="h-7 w-7 md:h-8 md:w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
