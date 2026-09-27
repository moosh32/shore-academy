"use client";

import { Button } from "@/components/ui/button";

export default function CourseError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4 py-8">
      <h1 className="text-2xl font-medium">משהו השתבש בטעינה</h1>
      <p className="text-muted-foreground text-sm leading-6">אפשר לנסות שוב. אם זה חוזר, רעננו את העמוד.</p>
      <Button type="button" className="h-11 px-4" onClick={() => reset()}>
        נסו שוב
      </Button>
    </div>
  );
}
