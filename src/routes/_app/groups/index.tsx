import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GroupsTable } from "@/components/groups/groups-table";
import { GroupDetailsCard } from "@/components/groups/group-details-card";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { EditGroupDialog } from "@/components/groups/edit-group-dialog";
import { DeleteGroupDialog } from "@/components/groups/delete-group-dialog";
import { useIsMobile } from "@/lib/hooks/use-mobile";
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
  const isMobile = useIsMobile();

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
    <div className="container mx-auto p-2 md:p-6 space-y-3 md:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-3xl font-bold">Groups</h1>
        <Button onClick={() => setCreatingGroup(true)} className="text-xs md:text-sm">
          <Plus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Create </span>Group
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-3 md:gap-6">
        <div className={`${selectedGroupId && !isMobile ? "flex-1" : "w-full"} transition-all`}>
          <GroupsTable
            onSelectGroup={setSelectedGroupId}
            onEditGroup={handleEditGroup}
            onDeleteGroup={setDeletingGroup}
          />
        </div>
        {selectedGroupId && !isMobile && (
          <GroupDetailsCard
            groupId={selectedGroupId}
            onClose={() => setSelectedGroupId(undefined)}
            onEdit={() => {
              setEditingGroup({ id: selectedGroupId } as GroupsResponse);
            }}
          />
        )}
      </div>
      {selectedGroupId && isMobile && (
        <GroupDetailsCard
          groupId={selectedGroupId}
          onClose={() => setSelectedGroupId(undefined)}
          onEdit={() => {
            setEditingGroup({ id: selectedGroupId } as GroupsResponse);
          }}
        />
      )}
      <CreateGroupDialog open={creatingGroup} onOpenChange={setCreatingGroup} />
      <EditGroupDialog group={editingGroup} onOpenChange={(open) => !open && setEditingGroup(null)} />
      <DeleteGroupDialog group={deletingGroup} onOpenChange={(open) => !open && setDeletingGroup(null)} />
    </div>
  );
}
