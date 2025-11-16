import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { BookmarkPlus, Settings } from "lucide-react";
import { pb } from "@/lib/pocketbase";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = {
    navMain: [
      {
        title: "Add Bookmark",
        url: "/add",
        icon: BookmarkPlus,
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
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <div className="flex-1"></div>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser email={user?.email} />
      </SidebarFooter>
    </Sidebar>
  );
}
