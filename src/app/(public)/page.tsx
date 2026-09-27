import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { DISCLAIMER, PRINCIPLES, modules } from "@/lib/content";

export default async function HomePage() {
  const user = await getSession();

  return (
    <div>
      <section className="mx-auto max-w-5xl px-4 pt-12 pb-8 md:pt-20">
        <p className="text-primary text-sm">משה קריסטל · אקדמיית שור</p>
        <h1 className="mt-3 max-w-3xl text-4xl leading-[1.2] font-medium md:text-6xl">
          המפסיד הטוב ביותר מנצח
        </h1>
        <p className="text-muted-foreground mt-5 max-w-xl text-lg leading-8">
          ללמוד איך להפסיד נכון לפני שלומדים איך להרוויח. קורס על מתמטיקת הסיכון: סטופ, יחידת R, גודל פוזיציה, ויומן.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {user ? (
            <Button nativeButton={false} render={<Link href="/app" />} className="h-11 px-5">
              המשך בלוח
            </Button>
          ) : (
            <>
              <Button nativeButton={false} render={<Link href="/register" />} className="h-11 px-5">
                הרשמה לקורס
              </Button>
              <Button
                nativeButton={false}
                variant="outline"
                render={<Link href="/login" />}
                className="h-11 px-5"
              >
                כניסה
              </Button>
            </>
          )}
        </div>
        <p className="text-muted-foreground mt-4 max-w-xl text-xs leading-5">{DISCLAIMER}</p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-8 md:grid-cols-2">
        <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <h2 className="text-xl font-medium">מה יש כאן</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            <li>שפה להפסד: סטופ, 1R, וגודל שנקבע מראש.</li>
            <li>מסלול מודולים. הבא נפתח אחרי מבחן קצר.</li>
            <li>מעבדה: גודל פוזיציה, תוחלת, התאוששות, רצף הפסדים.</li>
            <li>יומן משמעת. טרייד שלא תועד — לא קיים.</li>
          </ul>
        </div>
        <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <h2 className="text-xl font-medium">מה אין כאן</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            <li>איתותי קנייה ומכירה.</li>
            <li>הבטחת תשואה, «שיטה», או לוח זמנים לרווח.</li>
            <li>צילומי חשבון או רווח אישי.</li>
            <li>ייעוץ השקעות. זה שיעור, לא המלצה לעסקה.</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-6">
        <h2 className="text-2xl font-medium">כללי עבודה בקורס</h2>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {PRINCIPLES.map((principle, index) => (
            <li key={principle} className="flex gap-3 rounded-xl bg-muted/70 px-3 py-2 text-sm">
              <span className="text-muted-foreground w-6 tabular-nums" dir="ltr">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{principle}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="text-2xl font-medium">המסלול</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
          שבעה מודולים, לפי הסדר. בכל מודול שיעורים ומבחן קצר. ציון של 70% פותח את המודול הבא.
        </p>
        <ol className="mt-5 divide-y rounded-xl bg-card ring-1 ring-foreground/10">
          {modules.map((mod) => {
            const ready = mod.lessons.some((lesson) => lesson.status === "ready");
            return (
              <li key={mod.id} className="px-4 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-lg font-medium">
                    <span className="text-muted-foreground me-2 tabular-nums" dir="ltr">
                      {String(mod.id).padStart(2, "0")}
                    </span>
                    {mod.title}
                  </h3>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {ready ? "זמין" : "שלד"}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-sm leading-6">{mod.summary}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {mod.lessons.map((lesson) => (
                    <li key={lesson.id} className="text-foreground/80">
                      {lesson.title}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-xl bg-primary text-primary-foreground px-5 py-8">
          <h2 className="text-2xl font-medium">הגישה לקורס</h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-primary-foreground/80">
            בגרסה הזו אין תשלום. נרשמים, נכנסים, ומתחילים ממודול 1. המודול הבא נפתח רק אחרי ציון של 70% במבחן.
          </p>
          <div className="mt-5">
            <Button
              nativeButton={false}
              variant="secondary"
              render={<Link href={user ? "/app" : "/register"} />}
              className="h-11 px-5"
            >
              {user ? "אל הלוח" : "פתיחת חשבון לימוד"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
