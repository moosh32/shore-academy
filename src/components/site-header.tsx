import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import type { SessionUser } from "@/lib/session";

export function SiteHeader({ user }: { user: SessionUser | null }) {
  return (
    <header className="border-primary/80 sticky top-0 z-30 border-t-4 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <Brand />
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/about" className="text-muted-foreground hover:text-foreground px-2 py-2">
            אודות
          </Link>
          {user ? (
            <Button nativeButton={false} render={<Link href="/app" />} className="h-10 px-3">
              אל הלוח
            </Button>
          ) : (
            <>
              <Link href="/login" className="hover:text-foreground px-2 py-2">
                כניסה
              </Link>
              <Button nativeButton={false} render={<Link href="/register" />} className="h-10 px-3">
                הרשמה
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
