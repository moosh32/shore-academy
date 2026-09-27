import { redirect } from "next/navigation";
import { JournalPanel, type JournalItem } from "@/components/journal-panel";
import { PageIntro } from "@/components/page-intro";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseTags } from "@/lib/journal";

export const metadata = { title: "יומן" };

export default async function JournalPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const rows = await prisma.journalEntry.findMany({
    where: { userId: session.id },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  const entries: JournalItem[] = rows.map((row) => ({
    id: row.id,
    date: row.date,
    ticker: row.ticker,
    plannedR: row.plannedR,
    actualR: row.actualR,
    notes: row.notes,
    tags: parseTags(row.tags),
  }));

  return (
    <div>
      <PageIntro title="יומן">
        תאריך, טיקר אם יש, R מתוכנן, R בפועל, הערה ותגיות משמעת. טרייד שלא תועד — לא קיים.
      </PageIntro>
      <JournalPanel entries={entries} />
    </div>
  );
}
