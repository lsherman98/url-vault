import { Edit, X, ExternalLink, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetGroup } from "@/lib/api/queries";
import type { BookmarksResponse } from "@/lib/pocketbase-types";

interface GroupDetailsCardProps {
  groupId: string;
  onClose: () => void;
  onEdit: () => void;
}

export function GroupDetailsCard({ groupId, onClose, onEdit }: GroupDetailsCardProps) {
  const { data: selectedGroup } = useGetGroup(groupId);

  if (!selectedGroup) return null;

  const bookmarks = (selectedGroup as any)?.expand?.bookmarks as BookmarksResponse[] | undefined;
  const bookmarkCount = bookmarks?.length || 0;

  const getFullUrl = (url: string) => {
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <div className="w-full md:w-[400px] h-[500px] md:h-[calc(100vh-210px)] max-h-[500px] md:max-h-[calc(100vh-210px)]">
      <Card className="flex flex-col h-full">
        <CardHeader className="shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">{selectedGroup?.title}</CardTitle>
              <CardDescription className="text-xs">
                {bookmarkCount} bookmark{bookmarkCount !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="shrink-0 h-8" onClick={onEdit}>
                <Edit className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={onClose}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {bookmarks && bookmarks.length > 0 ? (
              <div className="space-y-3 pr-4">
                {bookmarks.map((bookmark: BookmarksResponse) => (
                  <div key={bookmark.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={getFullUrl(bookmark.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm text-primary hover:underline break-all line-clamp-2"
                      >
                        {bookmark.url}
                      </a>
                      <Button variant="ghost" size="icon" className="shrink-0 h-6 w-6" asChild>
                        <a href={getFullUrl(bookmark.url)} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                    {bookmark.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{bookmark.description}</p>
                    )}
                    {(bookmark as any)?.expand?.category && (
                      <Badge variant="secondary" className="text-xs">
                        {(bookmark as any).expand.category.title}
                      </Badge>
                    )}
                    {(bookmark as any)?.expand?.tags && (bookmark as any).expand.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {((bookmark as any).expand.tags as any[]).map((tag: any) => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            {tag.title}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
                <p className="text-sm">No bookmarks in this group yet</p>
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bookmarks
                </Button>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
