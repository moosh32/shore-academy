import type { Metadata } from "next";
import { Frank_Ruhl_Libre, Heebo } from "next/font/google";
import { DirectionProvider } from "@/components/ui/direction";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-sans",
  display: "swap",
});

const frank = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["500", "700"],
  variable: "--font-frank",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "אקדמיית שור",
    template: "%s · אקדמיית שור",
  },
  description:
    "קורס מתמטיקת סיכון של משה קריסטל. המפסיד הטוב ביותר מנצח — ללמוד איך להפסיד נכון לפני שלומדים איך להרוויח.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} ${frank.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <DirectionProvider direction="rtl">{children}</DirectionProvider>
      </body>
    </html>
  );
}
