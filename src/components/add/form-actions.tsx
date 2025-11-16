import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  onClear: () => void;
}

export function FormActions({ isSubmitting, onClear }: FormActionsProps) {
  return (
    <div className="flex justify-center gap-3 pt-4">
      <Button type="button" variant="outline" onClick={onClear} className="shadow-sm">
        Clear
      </Button>
      <Button type="submit" disabled={isSubmitting} size="lg" className="shadow-sm">
        {isSubmitting ? "Saving..." : "Save Bookmark"}
      </Button>
    </div>
  );
}
