import { Edit, Trash2, Pin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetGroups } from "@/lib/api/queries";
import { useUpdateGroup } from "@/lib/api/mutations";
import type { GroupsResponse } from "@/lib/pocketbase-types";

interface GroupsTableProps {
  onSelectGroup: (groupId: string) => void;
  onEditGroup: (group: GroupsResponse) => void;
  onDeleteGroup: (group: GroupsResponse) => void;
}

export function GroupsTable({ onSelectGroup, onEditGroup, onDeleteGroup }: GroupsTableProps) {
  const { data: groups } = useGetGroups();
  const updateGroup = useUpdateGroup();

  const handleTogglePin = async (group: GroupsResponse) => {
    try {
      await updateGroup.mutateAsync({
        id: group.id,
        data: { pinned: !group.pinned },
      });
      toast.success(group.pinned ? "Group unpinned" : "Group pinned");
    } catch (error) {
      toast.error("Failed to update group");
      console.error(error);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Bookmarks</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No groups yet. Create one to get started!
              </TableCell>
            </TableRow>
          ) : (
            groups?.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.title}</TableCell>
                <TableCell>
                  <Button variant="link" className="p-0 h-auto" onClick={() => onSelectGroup(group.id)}>
                    {group.bookmarks?.length || 0} bookmarks
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleTogglePin(group)}>
                      {group.pinned ? <Pin className="h-4 w-4 fill-current" /> : <Pin className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEditGroup(group)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteGroup(group)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
