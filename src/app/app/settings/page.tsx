import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { SettingsForm } from "@/components/settings-form";
import { getSession } from "@/lib/auth";
import { DISCLAIMER } from "@/lib/content";
import { prisma } from "@/lib/db";

export const metadata = { title: "חשבון" };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) redirect("/login");

  const createdLabel = new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(user.createdAt);

  return (
    <div>
      <PageIntro title="חשבון">הפרופיל והיציאה. האימייל לא משתנה מכאן.</PageIntro>
      <SettingsForm name={user.name} email={user.email} createdLabel={createdLabel} />
      <p className="text-muted-foreground mt-8 text-xs leading-5">{DISCLAIMER}</p>
    </div>
  );
}
