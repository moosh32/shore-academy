import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { Brand } from "@/components/brand";
import { getSession } from "@/lib/auth";
import { DISCLAIMER_SHORT } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function CourseLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-full">
      <header className="border-primary sticky top-0 z-30 border-t-4 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <Brand href="/app" />
          <div className="flex items-center gap-4">
            <AppNav variant="desktop" />
            <span className="text-muted-foreground hidden text-sm md:inline">{session.name}</span>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 pt-6 pb-28 md:pb-16">
        {children}
        <p className="text-muted-foreground mt-12 text-xs leading-5">{DISCLAIMER_SHORT}</p>
      </main>
      <AppNav variant="mobile" />
    </div>
  );
}
