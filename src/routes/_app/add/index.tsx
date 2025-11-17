import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { getUserRecord } from "@/lib/utils";
import { useGetGroups } from "@/lib/api/queries";
import { useCreateBookmark, useUpdateGroup } from "@/lib/api/mutations";
import { BookmarkFormHeader } from "@/components/add/bookmark-form-header";
import { UrlInput } from "@/components/add/url-input";
import { CategorySelect } from "@/components/add/category-select";
import { TagsField } from "@/components/add/tags-field";
import { GroupsSelect } from "@/components/add/groups-select";
import { DescriptionField } from "@/components/add/description-field";
import { FormActions } from "@/components/add/form-actions";

const bookmarkSchema = z.object({
  url: z
    .string()
    .min(1, { message: "Please enter a URL" })
    .transform((val) => {
      if (!/^https?:\/\//i.test(val)) {
        return `https://${val}`;
      }
      return val;
    })
    .pipe(z.string().url({ message: "Please enter a valid URL" })),
  tags: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .optional(),
  category: z.string().optional(),
  groups: z.array(z.string()).optional(),
  starred: z.boolean(),
  open_source: z.boolean(),
  description: z.string().optional(),
});

type BookmarkFormValues = z.infer<typeof bookmarkSchema>;

export const Route = createFileRoute("/_app/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: groups } = useGetGroups();
  const createBookmark = useCreateBookmark();
  const updateGroup = useUpdateGroup();

  const form = useForm<BookmarkFormValues>({
    resolver: zodResolver(bookmarkSchema),
    defaultValues: {
      url: "",
      tags: [],
      category: "",
      groups: [],
      starred: false,
      open_source: false,
      description: "",
    },
  });

  const onSubmit = async (data: BookmarkFormValues) => {
    try {
      const user = getUserRecord();
      const categoryId = data.category;
      const tagIds = data.tags?.map((tag) => tag.id) || [];

      // Strip protocol and trailing slashes from URL
      const processedUrl = data.url
        .replace(/^https?:\/\//, "") // Remove http:// or https://
        .replace(/\/+$/, ""); // Remove trailing slashes

      const newBookmark = await createBookmark.mutateAsync({
        url: processedUrl,
        category: categoryId,
        tags: tagIds,
        starred: data.starred,
        open_source: data.open_source,
        description: data.description,
        user: user.id,
      });

      if (data.groups && data.groups.length > 0) {
        for (const groupId of data.groups) {
          const group = groups?.find((g) => g.id === groupId);
          if (group) {
            const currentBookmarks = group.bookmarks || [];
            await updateGroup.mutateAsync({
              id: groupId,
              data: {
                bookmarks: [...currentBookmarks, newBookmark.id],
              },
            });
          }
        }
      }

      toast.success("Bookmark created successfully!");
      handleClear();
    } catch (error) {
      toast.error("Failed to create bookmark");
      console.error(error);
    }
  };

  const handleClear = () => {
    form.reset();
  };

  return (
    <div className="container mx-auto max-w-4xl min-h-[calc(100vh-6rem)] px-4 flex items-center justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-3xl">
          <BookmarkFormHeader form={form} />
          <UrlInput form={form} />
          <div className="flex items-center gap-3 w-full flex-wrap">
            <CategorySelect form={form} />
            <TagsField form={form} />
            <GroupsSelect form={form} />
          </div>
          <DescriptionField form={form} />
          <FormActions isSubmitting={createBookmark.isPending} onClear={handleClear} />
        </form>
      </Form>
    </div>
  );
}
