import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useGenerateDescription } from "@/lib/api/mutations";
import type { UseFormReturn } from "react-hook-form";

interface DescriptionFieldProps {
  form: UseFormReturn<any>;
}

export function DescriptionField({ form }: DescriptionFieldProps) {
  const generateDescriptionMutation = useGenerateDescription();

  const generateAIDescription = async () => {
    const url = form.getValues("url");
    if (!url) {
      toast.error("Please enter a URL first");
      return;
    }

    try {
      toast.info("Generating AI description...");
      const result = await generateDescriptionMutation.mutateAsync(url);
      form.setValue("description", result.trim());
    } catch (error) {
      toast.error("Failed to generate description");
      console.error(error);
    }
  };

  return (
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
            <Textarea {...field} placeholder="Add a description..." className="min-h-24 resize-y text-sm shadow-sm" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
