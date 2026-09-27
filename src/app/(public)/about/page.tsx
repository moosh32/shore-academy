import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { DISCLAIMER } from "@/lib/content";

export const metadata: Metadata = { title: "אודות" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageIntro kicker="אקדמיית שור" title="מי מלמד">
        משה קריסטל מלמד כאן מתמטיקת סיכון. בלי סיפור אישי על רווחים, ובלי הבטחה שהשוק יתנהג בצורה מסוימת.
      </PageIntro>
      <div className="space-y-4 text-base leading-8">
        <p>
          הקורס לא מלמד «איך להרוויח». הוא מלמד איך מגדירים הפסד מראש, איך מודדים עסקה ביחידות R, ואיך נשארים עם תהליך שאפשר לחזור עליו.
        </p>
        <p>
          ברירות המחדל במסלול: 0.3% מההון לעסקה, ו-Heat פתוח עד 1.5%. אלה כללי עבודה ללימוד. הם לא תחזית ולא יעד תשואה.
        </p>
        <p>
          אין כאן איתותים, אין צילומי חשבון, ואין ציטוטים מספרים. השוק לא חייב כלום. גם עסקה מצוינת יכולה להפסיד.
        </p>
        <p>
          מי שנכנס מתחיל ממודול 1. המודול הבא נפתח רק אחרי מבחן קצר בציון של 70%. המסלול מגיע עד יומן ומשמעת.
        </p>
      </div>
      <p className="text-muted-foreground mt-8 text-sm leading-6">{DISCLAIMER}</p>
    </div>
  );
}
