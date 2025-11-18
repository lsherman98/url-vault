import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { TagsInput, type Tag } from "@/components/ui/tags-input";
import { getUserRecord } from "@/lib/utils";
import { useGetTags } from "@/lib/api/queries";
import { useCreateTag } from "@/lib/api/mutations";
import type { UseFormReturn } from "react-hook-form";

interface TagsFieldProps {
  form: UseFormReturn<any>;
}

export function TagsField({ form }: TagsFieldProps) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const formTags = form.watch("tags");
    if (!formTags || formTags.length === 0) {
      setTags([]);
    }
  }, [form.watch("tags")]);

  const { data: existingTags } = useGetTags();
  const createTag = useCreateTag();

  const handleTagsChange = async (newTags: Tag[]) => {
    const addedTags = newTags.filter((tag) => tag.id.startsWith("temp-"));

    if (addedTags.length > 0) {
      const user = getUserRecord();
      const updatedTags = [...newTags];

      for (const addedTag of addedTags) {
        const existingTag = existingTags?.find((t) => t.tag?.toLowerCase() === addedTag.text.toLowerCase());

        if (existingTag) {
          const index = updatedTags.findIndex((t) => t.id === addedTag.id);
          updatedTags[index] = { id: existingTag.id, text: existingTag.tag || addedTag.text };
        } else {
          try {
            const newTag = await createTag.mutateAsync({
              tag: addedTag.text,
              user: user.id,
            });

            const index = updatedTags.findIndex((t) => t.id === addedTag.id);
            updatedTags[index] = { id: newTag.id, text: addedTag.text };
            toast.success(`Tag "${addedTag.text}" created`);
          } catch (error) {
            toast.error(`Failed to create tag "${addedTag.text}"`);
            console.error(error);
            const index = updatedTags.findIndex((t) => t.id === addedTag.id);
            updatedTags.splice(index, 1);
          }
        }
      }

      setTags(updatedTags);
      form.setValue("tags", updatedTags);
    } else {
      setTags(newTags);
      form.setValue("tags", newTags);
    }
  };

  return (
    <FormField
      control={form.control}
      name="tags"
      render={() => (
        <FormItem className="flex-1">
          <FormControl>
            <TagsInput
              tags={tags}
              onTagsChange={handleTagsChange}
              placeholder="Add tags..."
              className="shadow-sm"
              availableTags={existingTags?.map((t) => ({ id: t.id, text: t.tag }))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
