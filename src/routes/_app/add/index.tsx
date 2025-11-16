import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Star, Sparkles, Github, ChevronsUpDown, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TagsInput, type Tag } from "@/components/ui/tags-input";
import { cn, getUserRecord } from "@/lib/utils";
import { useGetCategories, useGetTags } from "@/lib/api/queries";
import { useCreateBookmark, useCreateCategory, useCreateTag, useGenerateDescription } from "@/lib/api/mutations";

const bookmarkSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
  tags: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .optional(),
  category: z.string().optional(),
  starred: z.boolean(),
  open_source: z.boolean(),
  description: z.string().optional(),
});

type BookmarkFormValues = z.infer<typeof bookmarkSchema>;

export const Route = createFileRoute("/_app/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const { data: categories = [], isLoading: categoriesLoading } = useGetCategories();
  const { data: existingTags = [] } = useGetTags();
  const createBookmark = useCreateBookmark();
  const createCategory = useCreateCategory();
  const createTag = useCreateTag();
  const generateDescriptionMutation = useGenerateDescription();

  const form = useForm<BookmarkFormValues>({
    resolver: zodResolver(bookmarkSchema),
    defaultValues: {
      url: "",
      tags: [],
      category: "",
      starred: false,
      open_source: false,
      description: "",
    },
  });

  const handleTagsChange = async (newTags: Tag[]) => {
    // Find newly added tags (those with temp IDs)
    const addedTags = newTags.filter((tag) => tag.id.startsWith("temp-"));

    if (addedTags.length > 0) {
      const user = getUserRecord();
      const updatedTags = [...newTags];

      // Create each new tag and replace its temp ID with the real ID
      for (const addedTag of addedTags) {
        // Check if tag already exists
        const existingTag = existingTags.find((t) => t.tag?.toLowerCase() === addedTag.text.toLowerCase());

        if (existingTag) {
          // Replace temp tag with existing tag
          const index = updatedTags.findIndex((t) => t.id === addedTag.id);
          updatedTags[index] = { id: existingTag.id, text: existingTag.tag || addedTag.text };
        } else {
          try {
            const newTag = await createTag.mutateAsync({
              tag: addedTag.text,
              user: user.id,
            });

            // Replace temp ID with real ID
            const index = updatedTags.findIndex((t) => t.id === addedTag.id);
            updatedTags[index] = { id: newTag.id, text: addedTag.text };
            toast.success(`Tag "${addedTag.text}" created`);
          } catch (error) {
            toast.error(`Failed to create tag "${addedTag.text}"`);
            console.error(error);
            // Remove the failed tag
            const index = updatedTags.findIndex((t) => t.id === addedTag.id);
            updatedTags.splice(index, 1);
          }
        }
      }

      setTags(updatedTags);
      form.setValue("tags", updatedTags);
    } else {
      // Just a removal or no change
      setTags(newTags);
      form.setValue("tags", newTags);
    }
  };

  const handleCreateCategory = async (categoryName: string) => {
    try {
      const user = getUserRecord();
      const newCategory = await createCategory.mutateAsync({
        category: categoryName,
        custom: true,
        user: user.id,
      });

      // Set the form value to the new category ID
      form.setValue("category", newCategory.id);
      setCategorySearch(categoryName);
      setCategoryOpen(false);
      toast.success(`Category "${categoryName}" created`);
    } catch (error) {
      toast.error("Failed to create category");
      console.error(error);
    }
  };

  const onSubmit = async (data: BookmarkFormValues) => {
    try {
      const user = getUserRecord();

      // Category should already be an ID at this point (created immediately when selected)
      const categoryId = data.category;

      // Tags should already be IDs at this point (created immediately when added)
      const tagIds = data.tags?.map((tag) => tag.id) || [];

      // Create bookmark
      await createBookmark.mutateAsync({
        url: data.url,
        category: categoryId,
        tags: tagIds,
        starred: data.starred,
        open_source: data.open_source,
        description: data.description,
        user: user.id,
      });

      toast.success("Bookmark created successfully!");

      // Reset form
      form.reset();
      setTags([]);
      setCategorySearch("");
    } catch (error) {
      toast.error("Failed to create bookmark");
      console.error(error);
    }
  };

  const generateAIDescription = async () => {
    const url = form.getValues("url");
    if (!url) {
      toast.error("Please enter a URL first");
      return;
    }

    try {
      toast.info("Generating AI description...");
      const result = await generateDescriptionMutation.mutateAsync(url);
      form.setValue("description", result);
      toast.success("Description generated!");
    } catch (error) {
      toast.error("Failed to generate description");
      console.error(error);
    }
  };

  const showCreateCategory =
    categorySearch && !categories.find((c) => c.category?.toLowerCase() === categorySearch.toLowerCase());

  // Get display text for category button
  const categoryDisplayText = () => {
    const categoryValue = form.watch("category");
    if (!categoryValue) return "Category";

    // Check if it's an existing category (by ID)
    const existing = categories.find((c) => c.id === categoryValue);
    if (existing) return existing.category;

    // Otherwise it's a new category name (the string itself)
    return categoryValue;
  };

  return (
    <div className="container mx-auto max-w-4xl min-h-[calc(100vh-6rem)] px-4 flex items-center justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-3xl">
          {/* URL Input - Centered and Main Focus */}
          <div className="flex flex-col items-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">Add Bookmark</h1>

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Paste URL here..."
                      className="h-16 text-xl px-6 shadow-sm border-2 text-center"
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />

            {/* Inline Options: Category, Tags, Starred */}
            <div className="flex items-center gap-3 w-full flex-wrap">
              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[200px]">
                    <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={categoryOpen}
                            className={cn(
                              "w-full justify-between h-10 shadow-sm",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {categoryDisplayText()}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search or create category..."
                            value={categorySearch}
                            onValueChange={setCategorySearch}
                          />
                          <CommandList>
                            <CommandEmpty>{categoriesLoading ? "Loading..." : "No category found."}</CommandEmpty>
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
                            {categories.length > 0 && (
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
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        field.value === category.id ? "opacity-100" : "opacity-0"
                                      )}
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

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={() => (
                  <FormItem className="flex-1 min-w-[300px]">
                    <FormControl>
                      <TagsInput
                        tags={tags}
                        onTagsChange={handleTagsChange}
                        placeholder="Add tags..."
                        className="shadow-sm"
                        availableTags={existingTags.map((t) => ({ id: t.id, text: t.tag || "" }))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Starred Icon Button */}
              <FormField
                control={form.control}
                name="starred"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Button
                        type="button"
                        variant={field.value ? "default" : "outline"}
                        size="icon"
                        onClick={() => field.onChange(!field.value)}
                        className="h-10 w-10 shadow-sm"
                        title={field.value ? "Remove star" : "Star bookmark"}
                      >
                        <Star className={cn("h-5 w-5", field.value && "fill-current")} />
                      </Button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Open Source Icon Button */}
              <FormField
                control={form.control}
                name="open_source"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Button
                        type="button"
                        variant={field.value ? "default" : "outline"}
                        size="icon"
                        onClick={() => field.onChange(!field.value)}
                        className="h-10 w-10 shadow-sm"
                        title={field.value ? "Open source" : "Mark as open source"}
                      >
                        <Github className={cn("h-5 w-5", field.value && "fill-current")} />
                      </Button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Description with AI Generator */}
          <div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm">Description</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generateAIDescription}
                      disabled={!form.watch("url")}
                      className="gap-2 h-7 text-xs"
                    >
                      <Sparkles className="h-3 w-3" />
                      Generate with AI
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add a description..."
                      className="min-h-24 resize-y text-sm shadow-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setTags([]);
                setCategorySearch("");
              }}
              className="shadow-sm"
            >
              Clear
            </Button>
            <Button type="submit" disabled={createBookmark.isPending} size="lg" className="shadow-sm">
              {createBookmark.isPending ? "Saving..." : "Save Bookmark"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
