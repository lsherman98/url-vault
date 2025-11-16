import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import type { UseFormReturn } from "react-hook-form";

interface UrlInputProps {
  form: UseFormReturn<any>;
}

export function UrlInput({ form }: UrlInputProps) {
  return (
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
  );
}
