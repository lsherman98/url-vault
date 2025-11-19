import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { BookmarkRow } from "./bookmark-row";
import type { BookmarksResponse } from "@/lib/pocketbase-types";

interface BookmarksTableProps {
  bookmarks: BookmarksResponse[];
  selectedBookmarks: string[];
  onToggleBookmark: (bookmarkId: string) => void;
  onToggleAll: () => void;
  onEdit: (bookmark: BookmarksResponse) => void;
  onDelete: (bookmark: BookmarksResponse) => void;
}

export function BookmarksTable({
  bookmarks,
  selectedBookmarks,
  onToggleBookmark,
  onToggleAll,
  onEdit,
  onDelete,
}: BookmarksTableProps) {
  const allSelected = bookmarks.length > 0 && selectedBookmarks.length === bookmarks.length;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="max-h-[calc(100vh-24rem)] overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <TableHeader className="sticky top-0 bg-background z-10 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-border">
            <TableRow>
              <TableHead className="w-8 bg-background">
                <Checkbox checked={allSelected} onCheckedChange={onToggleAll} />
              </TableHead>
              <TableHead className="w-8 bg-background"></TableHead>
              <TableHead className="text-xs md:text-sm bg-background truncate">URL</TableHead>
              <TableHead className="text-xs md:text-sm hidden md:table-cell bg-background">Category</TableHead>
              <TableHead className="text-xs md:text-sm hidden lg:table-cell bg-background">Tags</TableHead>
              <TableHead className="text-xs md:text-sm hidden xl:table-cell bg-background">Description</TableHead>
              <TableHead className="text-right text-xs md:text-sm bg-background">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookmarks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8 text-xs md:text-sm">
                  No bookmarks found
                </TableCell>
              </TableRow>
            ) : (
              bookmarks.map((bookmark) => (
                <BookmarkRow
                  key={bookmark.id}
                  bookmark={bookmark}
                  isSelected={selectedBookmarks.includes(bookmark.id)}
                  onToggleSelection={onToggleBookmark}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </TableBody>
        </table>
      </div>
    </div>
  );
}
