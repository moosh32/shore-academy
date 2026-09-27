import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-4 py-16">
      <h1 className="text-3xl font-medium">העמוד לא נמצא</h1>
      <p className="text-muted-foreground mt-3 text-sm leading-6">
        הכתובת לא שייכת למסלול. אפשר לחזור להתחלה.
      </p>
      <div className="mt-6">
        <Button nativeButton={false} render={<Link href="/" />} className="h-11 px-4">
          לדף הבית
        </Button>
      </div>
    </div>
  );
}
