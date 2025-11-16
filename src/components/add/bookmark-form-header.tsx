import { Star, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { UseFormReturn } from "react-hook-form";

interface BookmarkFormHeaderProps {
  form: UseFormReturn<any>;
}

export function BookmarkFormHeader({ form }: BookmarkFormHeaderProps) {
  return (
    <div className="flex flex-col items-center space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Add Bookmark</h1>
      <div className="flex items-center gap-3">
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
  );
}
