import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { tools } from "@/lib/tools";

export const metadata = { title: "מעבדה" };

export default async function LabPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const saves = await prisma.labSave.findMany({ where: { userId: session.id } });

  return (
    <div>
      <PageIntro title="מעבדה">
        מחשבונים לתרגול. הם לא אומרים אם להיכנס לעסקה. ברירת המחדל במסלול: 0.3% לעסקה, Heat עד 1.5%.
      </PageIntro>
      <ul className="space-y-3">
        {tools.map((tool) => {
          const saved = saves.find((item) => item.toolId === tool.id);
          return (
            <li key={tool.id}>
              <Link
                href={`/app/lab/${tool.id}`}
                className="block rounded-xl bg-card px-4 py-4 ring-1 ring-foreground/10"
              >
                <h2 className="text-base font-medium">{tool.title}</h2>
                <p className="text-muted-foreground mt-1 text-sm leading-6">{tool.blurb}</p>
                <p className="text-muted-foreground mt-2 text-xs">
                  {saved ? `נשמר ${formatDateTime(saved.savedAt.toISOString())}` : "עדיין אין חישוב שמור"}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
