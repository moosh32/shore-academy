"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsForm({
  name,
  email,
  createdLabel,
}: {
  name: string;
  email: string;
  createdLabel: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(body.error ?? "לא הצלחנו לעדכן את השם.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/");
  }

  return (
    <div className="space-y-8">
      <form method="post" onSubmit={save} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">שם</Label>
          <Input
            id="name"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="h-11 text-base md:text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">אימייל</Label>
          <Input id="email" value={email} readOnly dir="ltr" className="h-11 text-end text-base md:text-base" />
        </div>
        <p className="text-muted-foreground text-sm">חשבון נפתח ב-{createdLabel}.</p>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {saved ? <p className="text-sm">השם עודכן.</p> : null}
        <Button type="submit" className="h-11 px-4" disabled={pending}>
          {pending ? "שומרים…" : "שמירת שם"}
        </Button>
      </form>
      <div className="border-t pt-6">
        <Button type="button" variant="outline" className="h-11 px-4" onClick={logout}>
          יציאה
        </Button>
      </div>
    </div>
  );
}
