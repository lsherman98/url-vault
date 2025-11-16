import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BookmarkPlus, Bookmark, Settings, FolderOpen, Pin } from "lucide-react";
import { pb } from "@/lib/pocketbase";
import { useGetGroups } from "@/lib/api/queries";
import { Link } from "@tanstack/react-router";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: groups = [] } = useGetGroups();
  const pinnedGroups = groups.filter((group) => group.pinned);

  const data = {
    navMain: [
      {
        title: "Add Bookmark",
        url: "/add",
        icon: BookmarkPlus,
      },
      {
        title: "Bookmarks",
        url: "/bookmarks",
        icon: Bookmark,
      },
      {
        title: "Groups",
        url: "/groups",
        icon: FolderOpen,
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  };

  const user = pb.authStore.model;
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <Link to="/" className="text-lg font-bold">
          URL Vault
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {pinnedGroups.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Pin className="h-4 w-4" />
              Pinned Groups
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {pinnedGroups.map((group) => (
                  <SidebarMenuItem key={group.id}>
                    <SidebarMenuButton asChild>
                      <Link to="/groups" search={{ groupId: group.id }}>
                        <span>{group.title}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{group.bookmarks?.length || 0}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        <div className="flex-1"></div>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser email={user?.email} />
      </SidebarFooter>
    </Sidebar>
  );
}
