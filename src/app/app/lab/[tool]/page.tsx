import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { ToolWorkspace } from "@/components/tool-workspace";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getTool } from "@/lib/tools";

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { tool: toolId } = await params;
  const tool = getTool(toolId);
  if (!tool) notFound();

  const saved = await prisma.labSave.findUnique({
    where: { userId_toolId: { userId: session.id, toolId: tool.id } },
  });
  const initialInputs = saved ? (JSON.parse(saved.inputs) as Record<string, number>) : null;

  return (
    <div>
      <p className="text-muted-foreground mb-4 text-sm">
        <Link href="/app/lab" className="underline underline-offset-4">
          מעבדה
        </Link>
      </p>
      <PageIntro title={tool.title}>{tool.blurb}</PageIntro>
      <ToolWorkspace
        toolId={tool.id}
        initialInputs={initialInputs}
        savedAt={saved ? saved.savedAt.toISOString() : null}
      />
    </div>
  );
}
