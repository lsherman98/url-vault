import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GroupsTable } from "@/components/groups/groups-table";
import { GroupDetailsCard } from "@/components/groups/group-details-card";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { EditGroupDialog } from "@/components/groups/edit-group-dialog";
import { DeleteGroupDialog } from "@/components/groups/delete-group-dialog";
import type { GroupsResponse } from "@/lib/pocketbase-types";

export const Route = createFileRoute("/_app/groups/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      groupId: (search.groupId as string) || undefined,
    };
  },
});

function RouteComponent() {
  const { groupId } = Route.useSearch();

  const [creatingGroup, setCreatingGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupsResponse | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<GroupsResponse | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(groupId);

  useEffect(() => {
    if (groupId) {
      setSelectedGroupId(groupId);
    }
  }, [groupId]);

  const handleEditGroup = (group: GroupsResponse) => {
    setEditingGroup(group);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Groups</h1>
        <Button onClick={() => setCreatingGroup(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>
      <div className="flex gap-6">
        <div className={`${selectedGroupId ? "flex-1" : "w-full"} transition-all`}>
          <GroupsTable
            onSelectGroup={setSelectedGroupId}
            onEditGroup={handleEditGroup}
            onDeleteGroup={setDeletingGroup}
          />
        </div>
        {selectedGroupId && (
          <GroupDetailsCard
            groupId={selectedGroupId}
            onClose={() => setSelectedGroupId(undefined)}
            onEdit={() => {
              setEditingGroup({ id: selectedGroupId } as GroupsResponse);
            }}
          />
        )}
      </div>
      <CreateGroupDialog open={creatingGroup} onOpenChange={setCreatingGroup} />
      <EditGroupDialog group={editingGroup} onOpenChange={(open) => !open && setEditingGroup(null)} />
      <DeleteGroupDialog group={deletingGroup} onOpenChange={(open) => !open && setDeletingGroup(null)} />
    </div>
  );
}
