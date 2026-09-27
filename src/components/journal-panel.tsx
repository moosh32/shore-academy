"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatR } from "@/lib/format";
import { DISCIPLINE_TAGS, tagLabel } from "@/lib/journal";

export type JournalItem = {
  id: string;
  date: string;
  ticker: string | null;
  plannedR: number;
  actualR: number;
  notes: string;
  tags: string[];
};

function today() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function JournalPanel({ entries }: { entries: JournalItem[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [date, setDate] = useState(today);

  const sum = entries.reduce((total, entry) => total + entry.actualR, 0);
  const average = entries.length ? sum / entries.length : 0;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    const planned = Number(String(data.get("plannedR") ?? "").replace(",", "."));
    const actual = Number(String(data.get("actualR") ?? "").replace(",", "."));
    const response = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        ticker: String(data.get("ticker") ?? ""),
        plannedR: planned,
        actualR: actual,
        notes: String(data.get("notes") ?? ""),
        tags,
      }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(body.error ?? "לא הצלחנו לשמור את הרשומה.");
      return;
    }
    setTags([]);
    (event.target as HTMLFormElement).reset();
    setDate(today());
    router.refresh();
  }

  async function remove(id: string) {
    if (!window.confirm("למחוק את הרשומה?")) return;
    const response = await fetch(`/api/journal/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("לא הצלחנו למחוק את הרשומה.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form method="post" onSubmit={onSubmit} className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date">תאריך</Label>
            <Input
              id="date"
              name="date"
              type="date"
              dir="ltr"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-11 text-end text-base md:text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticker">טיקר (לא חובה)</Label>
            <Input id="ticker" name="ticker" dir="ltr" className="h-11 text-end text-base md:text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plannedR">R מתוכנן</Label>
            <Input
              id="plannedR"
              name="plannedR"
              inputMode="decimal"
              dir="ltr"
              required
              className="h-11 text-end text-base tabular-nums md:text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="actualR">R בפועל</Label>
            <Input
              id="actualR"
              name="actualR"
              inputMode="decimal"
              dir="ltr"
              required
              className="h-11 text-end text-base tabular-nums md:text-base"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">הערות</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="מה קרה ביחס לתוכנית? בלי סיפור על השוק — רק התהליך."
            className="min-h-24 text-base md:text-base"
          />
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">תגיות משמעת</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {DISCIPLINE_TAGS.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={tags.includes(tag.id)}
                  onCheckedChange={(checked) =>
                    setTags((prev) =>
                      checked ? [...prev, tag.id] : prev.filter((id) => id !== tag.id),
                    )
                  }
                />
                {tag.label}
              </label>
            ))}
          </div>
        </fieldset>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <Button type="submit" className="h-11 px-4" disabled={pending}>
          {pending ? "שומרים…" : "הוספת רשומה"}
        </Button>
      </form>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-8 text-sm leading-7">
          אין עדיין רשומות. טרייד שלא תועד — לא קיים.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-muted px-2 py-3">
              <p className="text-muted-foreground text-xs">רשומות</p>
              <p className="mt-1 text-xl tabular-nums" dir="ltr">
                {entries.length}
              </p>
            </div>
            <div className="rounded-xl bg-muted px-2 py-3">
              <p className="text-muted-foreground text-xs">סכום R</p>
              <p className="mt-1 text-xl tabular-nums" dir="ltr">
                {formatR(sum)}
              </p>
            </div>
            <div className="rounded-xl bg-muted px-2 py-3">
              <p className="text-muted-foreground text-xs">ממוצע R</p>
              <p className="mt-1 text-xl tabular-nums" dir="ltr">
                {formatR(average)}
              </p>
            </div>
          </div>
          <p className="text-muted-foreground text-xs leading-5">
            הסיכום הוא של הרשומות שלך, ביחידות R. זה לא רווח כספי ולא מדד להצלחה של יום אחד.
          </p>
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li key={entry.id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm">
                      {formatDate(entry.date)}
                      {entry.ticker ? (
                        <span className="text-muted-foreground" dir="ltr">
                          {" "}
                          · {entry.ticker}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-sm tabular-nums" dir="ltr">
                      <span className="text-muted-foreground">מתוכנן </span>
                      {formatR(entry.plannedR)}
                      <span className="text-muted-foreground"> · בפועל </span>
                      <span className={entry.actualR < 0 ? "text-destructive" : "text-primary"}>
                        {formatR(entry.actualR)}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-muted-foreground text-xs underline underline-offset-4"
                    onClick={() => remove(entry.id)}
                  >
                    מחיקה
                  </button>
                </div>
                {entry.tags.length > 0 ? (
                  <p className="text-muted-foreground mt-2 text-xs">
                    {entry.tags.map((tag) => tagLabel(tag)).join(" · ")}
                  </p>
                ) : null}
                {entry.notes ? <p className="mt-2 text-sm leading-6">{entry.notes}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
