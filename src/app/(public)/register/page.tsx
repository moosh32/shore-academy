import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth-forms";
import { PageIntro } from "@/components/page-intro";
import { DISCLAIMER } from "@/lib/content";

export const metadata: Metadata = { title: "הרשמה" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <PageIntro title="הרשמה">
        פתיחת חשבון לימוד. אין תשלום בגרסה הזו — הגישה לקורס היא ללמידה.
      </PageIntro>
      <RegisterForm />
      <p className="text-muted-foreground mt-6 text-xs leading-5">{DISCLAIMER}</p>
    </div>
  );
}
