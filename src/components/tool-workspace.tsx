"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/format";
import { getTool, runTool } from "@/lib/tools";

function parseField(raw: string) {
  const text = raw.trim().replace(",", ".");
  if (!text) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

function readInputs(
  tool: NonNullable<ReturnType<typeof getTool>>,
  values: Record<string, string>,
) {
  const raw: Record<string, number> = {};
  for (const field of tool.fields) {
    const value = parseField(values[field.key] ?? "");
    if (value == null) return { ok: false as const, error: "ממלאים את כל השדות במספר." };
    raw[field.key] = value;
  }
  return { ok: true as const, raw };
}

export function ToolWorkspace({
  toolId,
  initialInputs,
  savedAt,
}: {
  toolId: string;
  initialInputs: Record<string, number> | null;
  savedAt: string | null;
}) {
  const tool = getTool(toolId);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const start: Record<string, string> = {};
    if (!tool) return start;
    for (const field of tool.fields) {
      const saved = initialInputs?.[field.key];
      start[field.key] = saved != null ? String(saved) : field.defaultValue;
    }
    return start;
  });
  const [savedStamp, setSavedStamp] = useState(savedAt);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!tool) return null;
  const current = tool;
  const parsed = readInputs(current, values);
  const result = parsed.ok ? runTool(current.id, parsed.raw) : parsed;

  async function save() {
    if (!parsed.ok || !result.ok) return;
    const raw = parsed.raw;
    setPending(true);
    setError(null);
    const response = await fetch("/api/lab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId: current.id, inputs: raw }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string; savedAt?: string };
    setPending(false);
    if (!response.ok) {
      setError(body.error ?? "השמירה נכשלה.");
      return;
    }
    setSavedStamp(body.savedAt ?? new Date().toISOString());
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form
        method="post"
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        {tool.fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              inputMode="decimal"
              dir="ltr"
              className="h-11 text-end text-base tabular-nums md:text-base"
              value={values[field.key] ?? ""}
              step={field.step}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, [field.key]: event.target.value }))
              }
            />
            {field.hint ? <p className="text-muted-foreground text-xs">{field.hint}</p> : null}
          </div>
        ))}
        <Button type="submit" className="h-11 px-4" disabled={!result.ok || pending}>
          {pending ? "שומרים…" : "שמירת התוצאה"}
        </Button>
        {savedStamp ? (
          <p className="text-muted-foreground text-xs">נשמר לאחרונה {formatDateTime(savedStamp)}</p>
        ) : (
          <p className="text-muted-foreground text-xs">עדיין לא נשמר חישוב במחשבון הזה.</p>
        )}
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </form>

      <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        {result.ok ? (
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground text-sm">{result.view.headlineLabel}</p>
              <p className="mt-1 text-5xl font-medium tabular-nums" dir="ltr">
                {result.view.headline}
              </p>
              <p className="text-muted-foreground mt-3 text-xs leading-5">{result.view.formula}</p>
            </div>
            <dl className="space-y-2 text-sm">
              {result.view.rows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-4">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="tabular-nums" dir="ltr">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
            {result.view.warnings.length > 0 ? (
              <ul className="text-destructive space-y-1 text-sm leading-6">
                {result.view.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}
            <p className="text-sm leading-6">{result.view.note}</p>
            {result.view.table ? (
              <div>
                <p className="mb-2 text-sm font-medium">{result.view.table.caption}</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground border-b text-start">
                      <th className="py-1 font-medium">{result.view.table.columns[0]}</th>
                      <th className="py-1 font-medium">{result.view.table.columns[1]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.view.table.rows.map((row) => (
                      <tr key={row[0]} className="border-b border-foreground/5">
                        <td className="py-1.5 tabular-nums" dir="ltr">
                          {row[0]}
                        </td>
                        <td className="py-1.5 tabular-nums" dir="ltr">
                          {row[1]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm leading-6">{result.error}</p>
        )}
      </div>
    </div>
  );
}
