import { useState } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, getUserRecord } from "@/lib/utils";
import { useGetCategories } from "@/lib/api/queries";
import { useCreateCategory } from "@/lib/api/mutations";
import type { UseFormReturn } from "react-hook-form";

interface CategorySelectProps {
  form: UseFormReturn<any>;
}

export function CategorySelect({ form }: CategorySelectProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const { data: categories } = useGetCategories();
  const createCategory = useCreateCategory();

  const handleCreateCategory = async (categoryName: string) => {
    try {
      const user = getUserRecord();
      const newCategory = await createCategory.mutateAsync({
        category: categoryName,
        custom: true,
        user: user.id,
      });

      form.setValue("category", newCategory.id);
      setCategorySearch(categoryName);
      setCategoryOpen(false);
      toast.success(`Category "${categoryName}" created`);
    } catch (error) {
      toast.error("Failed to create category");
      console.error(error);
    }
  };

  const showCreateCategory =
    categorySearch && !categories?.find((c) => c.category?.toLowerCase() === categorySearch.toLowerCase());

  const categoryDisplayText = () => {
    const categoryValue = form.watch("category");
    if (!categoryValue) return "Category";

    const existing = categories?.find((c) => c.id === categoryValue);
    if (existing) return existing.category;

    return categoryValue;
  };

  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem className="flex-1">
          <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={categoryOpen}
                  className={cn("w-full justify-between h-10 shadow-sm", !field.value && "text-muted-foreground")}
                >
                  {categoryDisplayText()}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search or create..."
                  value={categorySearch}
                  onValueChange={setCategorySearch}
                />
                <CommandList>
                  <CommandEmpty>{"No categories found."}</CommandEmpty>
                  {showCreateCategory && (
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          handleCreateCategory(categorySearch);
                        }}
                      >
                        Create "{categorySearch}"
                      </CommandItem>
                    </CommandGroup>
                  )}
                  {categories && categories.length > 0 && (
                    <CommandGroup>
                      {categories.map((category) => (
                        <CommandItem
                          key={category.id}
                          value={category.category}
                          onSelect={() => {
                            form.setValue("category", category.id);
                            setCategorySearch(category.category || "");
                            setCategoryOpen(false);
                          }}
                        >
                          {category.category}
                          <Check
                            className={cn("ml-auto h-4 w-4", field.value === category.id ? "opacity-100" : "opacity-0")}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
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
