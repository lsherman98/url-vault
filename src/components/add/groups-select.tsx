import { useState } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useGetGroups } from "@/lib/api/queries";
import type { UseFormReturn } from "react-hook-form";

interface GroupsSelectProps {
  form: UseFormReturn<any>;
}

export function GroupsSelect({ form }: GroupsSelectProps) {
  const [groupsOpen, setGroupsOpen] = useState(false);

  const { data: groups } = useGetGroups();

  return (
    <FormField
      control={form.control}
      name="groups"
      render={({ field }) => (
        <FormItem className="flex-1 min-w-[200px]">
          <Popover open={groupsOpen} onOpenChange={setGroupsOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={groupsOpen}
                  className={cn(
                    "w-full justify-between h-10 shadow-sm",
                    (!field.value || field.value.length === 0) && "text-muted-foreground"
                  )}
                >
                  {field.value && field.value.length > 0
                    ? `${field.value.length} group(s) selected`
                    : "Add to group..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
              <Command>
                <CommandInput placeholder="Search groups..." />
                <CommandList>
                  <CommandEmpty>No groups found.</CommandEmpty>
                  <CommandGroup>
                    {groups?.map((group) => (
                      <CommandItem
                        key={group.id}
                        value={group.title}
                        onSelect={() => {
                          const currentGroups = field.value || [];
                          const newGroups = currentGroups.includes(group.id)
                            ? currentGroups.filter((id: string) => id !== group.id)
                            : [...currentGroups, group.id];
                          form.setValue("groups", newGroups);
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", field.value?.includes(group.id) ? "opacity-100" : "opacity-0")}
                        />
                        {group.title}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
