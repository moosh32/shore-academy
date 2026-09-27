"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fieldClass = "h-11 text-base md:text-base";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.get("email"),
        password: data.get("password"),
      }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(body.error ?? "הכניסה נכשלה.");
      return;
    }
    router.refresh();
    router.push(nextPath);
  }

  return (
    <form method="post" onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">אימייל</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required className={fieldClass} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">סיסמה</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={fieldClass}
        />
      </div>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <Button type="submit" className="h-11 w-full" disabled={pending}>
        {pending ? "נכנסים…" : "כניסה"}
      </Button>
      <p className="text-muted-foreground text-sm">
        אין חשבון?{" "}
        <Link href="/register" className="text-foreground underline underline-offset-4">
          הרשמה
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        password: data.get("password"),
        confirm: data.get("confirm"),
      }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(body.error ?? "ההרשמה נכשלה.");
      return;
    }
    router.refresh();
    router.push("/app");
  }

  return (
    <form method="post" onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">שם</Label>
        <Input id="name" name="name" autoComplete="name" required className={fieldClass} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">אימייל</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required className={fieldClass} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">סיסמה</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={fieldClass}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">אימות סיסמה</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={fieldClass}
        />
      </div>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <Button type="submit" className="h-11 w-full" disabled={pending}>
        {pending ? "פותחים חשבון…" : "פתיחת חשבון לימוד"}
      </Button>
      <p className="text-muted-foreground text-sm">
        יש כבר חשבון?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          כניסה
        </Link>
      </p>
    </form>
  );
}
