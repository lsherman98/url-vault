import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGetBookmarks } from "@/lib/api/queries";
import type { BookmarksResponse } from "@/lib/pocketbase-types";
import { BookmarksFilters } from "@/components/bookmarks/bookmarks-filters";
import { BookmarksTable } from "@/components/bookmarks/bookmarks-table";
import { EditBookmarkDialog } from "@/components/bookmarks/edit-bookmark-dialog";
import { DeleteBookmarkDialog } from "@/components/bookmarks/delete-bookmark-dialog";
import { AddToGroupDialog } from "@/components/bookmarks/add-to-group-dialog";

export const Route = createFileRoute("/_app/bookmarks/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterStarred, setFilterStarred] = useState(false);
  const [filterOpenSource, setFilterOpenSource] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarksResponse | null>(null);
  const [deletingBookmark, setDeletingBookmark] = useState<BookmarksResponse | null>(null);
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);
  const [addingToGroup, setAddingToGroup] = useState(false);

  const { data: bookmarksData } = useGetBookmarks(
    selectedCategories.length > 0 ? selectedCategories : undefined,
    selectedTags.length > 0 ? selectedTags : undefined,
    filterStarred || undefined,
    filterOpenSource || undefined
  );

  const handleToggleBookmark = (bookmarkId: string) => {
    setSelectedBookmarks((prev) =>
      prev.includes(bookmarkId) ? prev.filter((id) => id !== bookmarkId) : [...prev, bookmarkId]
    );
  };

  const handleToggleAll = () => {
    if (selectedBookmarks.length === bookmarksData?.length) {
      setSelectedBookmarks([]);
    } else {
      setSelectedBookmarks(bookmarksData?.map((b) => b.id) || []);
    }
  };

  const handleGroupSuccess = () => {
    setSelectedBookmarks([]);
    setAddingToGroup(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bookmarks</h1>
        <div className="text-sm text-muted-foreground">{bookmarksData?.length} bookmarks</div>
      </div>
      <BookmarksFilters
        selectedCategories={selectedCategories}
        selectedTags={selectedTags}
        filterStarred={filterStarred}
        filterOpenSource={filterOpenSource}
        selectedBookmarksCount={selectedBookmarks.length}
        onCategoriesChange={setSelectedCategories}
        onTagsChange={setSelectedTags}
        onStarredChange={setFilterStarred}
        onOpenSourceChange={setFilterOpenSource}
        onClearSelection={() => setSelectedBookmarks([])}
        onAddToGroup={() => setAddingToGroup(true)}
      />
      <BookmarksTable
        bookmarks={bookmarksData || []}
        selectedBookmarks={selectedBookmarks}
        onToggleBookmark={handleToggleBookmark}
        onToggleAll={handleToggleAll}
        onEdit={setEditingBookmark}
        onDelete={setDeletingBookmark}
      />
      <EditBookmarkDialog bookmark={editingBookmark} onClose={() => setEditingBookmark(null)} />
      <DeleteBookmarkDialog bookmark={deletingBookmark} onClose={() => setDeletingBookmark(null)} />
      <AddToGroupDialog
        isOpen={addingToGroup}
        selectedBookmarks={selectedBookmarks}
        onClose={() => setAddingToGroup(false)}
        onSuccess={handleGroupSuccess}
      />
    </div>
  );
}
