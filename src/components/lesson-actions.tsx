"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LessonActions({
  lessonId,
  completed,
  nextHref,
  nextLabel,
}: {
  lessonId: string;
  completed: boolean;
  nextHref: string;
  nextLabel: string;
}) {
  const router = useRouter();
  const [done, setDone] = useState(completed);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function complete() {
    setPending(true);
    setError(null);
    const response = await fetch("/api/progress/lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(body.error ?? "לא הצלחנו לסמן את השיעור.");
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="mt-8 space-y-3">
        <p className="text-sm">השיעור מסומן כהושלם.</p>
        <Button nativeButton={false} render={<Link href={nextHref} />} className="h-11 px-4">
          {nextLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-3">
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <Button type="button" className="h-11 px-4" onClick={complete} disabled={pending}>
        {pending ? "שומרים…" : "סיימתי את השיעור"}
      </Button>
    </div>
  );
}
