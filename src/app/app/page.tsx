import Link from "next/link";
import { Lock } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { courseSnapshot, nextStep } from "@/lib/course";
import { prisma } from "@/lib/db";
import { formatDate, formatR } from "@/lib/format";
import { parseTags, tagLabel } from "@/lib/journal";
import { loadRecords } from "@/lib/progress-store";
import { getTool } from "@/lib/tools";

export const metadata = { title: "לוח" };

const statusLabel = {
  locked: "נעול",
  open: "פתוח",
  done: "הושלם",
  skeleton: "שלד",
} as const;

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [records, journal, saves] = await Promise.all([
    loadRecords(session.id),
    prisma.journalEntry.findMany({
      where: { userId: session.id },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.labSave.findMany({ where: { userId: session.id } }),
  ]);

  const snapshot = courseSnapshot(records);
  const step = nextStep(records);
  const doneCount = snapshot.filter((item) => item.status === "done").length;
  const shortcuts = ["position", "expectancy", "recovery"]
    .map((id) => getTool(id))
    .filter((tool) => tool != null);

  return (
    <div>
      <PageIntro kicker={`שלום, ${session.name}`} title="לוח המסלול">
        {doneCount} מודולים הושלמו. מודול נפתח רק אחרי ציון של 70% במבחן של הקודם.
      </PageIntro>

      {step ? (
        <Link
          href={step.href}
          className="mb-8 block rounded-xl bg-primary text-primary-foreground px-4 py-4"
        >
          <p className="text-primary-foreground/75 text-xs">{step.kicker}</p>
          <p className="mt-1 text-lg font-medium">המשך: {step.label}</p>
        </Link>
      ) : (
        <p className="bg-muted mb-8 rounded-xl px-4 py-4 text-sm leading-6">
          המסלול הושלם: שבעת המודולים והמבחנים. המעבדה והיומן נשארים לתרגול השוטף.
        </p>
      )}

      <h2 className="mb-3 text-lg font-medium">מודולים</h2>
      <ol className="space-y-3">
        {snapshot.map(({ module, status, fraction, quizScore }) => {
          const label = status === "open" && fraction > 0 ? "בתהליך" : statusLabel[status];
          return (
            <li key={module.id}>
              <Link
                href={`/app/modules/${module.id}`}
                className="block rounded-xl bg-card px-4 py-4 ring-1 ring-foreground/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-muted-foreground text-xs tabular-nums" dir="ltr">
                      {String(module.id).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 text-base font-medium">{module.title}</h3>
                  </div>
                  <Badge variant={status === "locked" ? "outline" : status === "done" ? "default" : "secondary"}>
                    {status === "locked" ? <Lock className="size-3" aria-hidden /> : null}
                    {label}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-2 text-sm leading-6">{module.summary}</p>
                <p className="text-muted-foreground mt-3 text-xs tabular-nums" dir="ltr">
                  {Math.round(fraction * 100)}%
                  {quizScore != null ? ` · מבחן ${Math.round(quizScore * 100)}%` : ""}
                </p>
                <Progress value={Math.round(fraction * 100)} className="mt-1" />
              </Link>
            </li>
          );
        })}
      </ol>

      <h2 className="mt-10 mb-3 text-lg font-medium">קיצורי מעבדה</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {shortcuts.map((tool) => {
          const saved = saves.some((item) => item.toolId === tool.id);
          return (
            <Link
              key={tool.id}
              href={`/app/lab/${tool.id}`}
              className="rounded-xl bg-card px-3 py-3 ring-1 ring-foreground/10"
            >
              <p className="text-sm font-medium">{tool.title}</p>
              <p className="text-muted-foreground mt-1 text-xs">{saved ? "יש חישוב שמור" : "עדיין אין חישוב שמור"}</p>
            </Link>
          );
        })}
      </div>

      <h2 className="mt-10 mb-3 text-lg font-medium">יומן אחרון</h2>
      {journal.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-6 text-sm leading-6">
          אין עדיין רשומות.{" "}
          <Link href="/app/journal" className="underline underline-offset-4">
            לפתוח יומן
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {journal.map((entry) => (
            <li key={entry.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
              <div className="flex items-baseline justify-between gap-3">
                <span>
                  {formatDate(entry.date)}
                  {entry.ticker ? (
                    <span className="text-muted-foreground" dir="ltr">
                      {" "}
                      · {entry.ticker}
                    </span>
                  ) : null}
                </span>
                <span className="tabular-nums" dir="ltr">
                  {formatR(entry.actualR)}
                </span>
              </div>
              {parseTags(entry.tags).length > 0 ? (
                <p className="text-muted-foreground mt-1 text-xs">
                  {parseTags(entry.tags).map((tag) => tagLabel(tag)).join(" · ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
