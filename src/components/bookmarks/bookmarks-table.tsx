import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">
              <Checkbox checked={allSelected} onCheckedChange={onToggleAll} />
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
          {bookmarks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
      </Table>
    </div>
  );
}
