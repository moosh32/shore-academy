import { DISCLAIMER } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-5xl space-y-3 px-4 py-8 text-sm leading-6">
        <p className="font-heading text-base">אקדמיית שור · משה קריסטל</p>
        <p className="text-muted-foreground max-w-3xl">{DISCLAIMER}</p>
      </div>
    </footer>
  );
}
