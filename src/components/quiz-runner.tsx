"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PASS_THRESHOLD } from "@/lib/constants";

type PublicQuestion = {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
};
import { cn } from "cn";

type Feedback = {
  correct: boolean;
  correctOptionId: string;
  explanation: string;
};

type FinalResult = {
  score: number;
  passed: boolean;
  best: number;
  correctCount: number;
  total: number;
  results: { id: string; explanation: string; correct: boolean }[];
};

export function QuizRunner({
  moduleId,
  questions,
  bestScore,
  nextHref,
}: {
  moduleId: number;
  questions: PublicQuestion[];
  bestScore: number | null;
  nextHref: string | null;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);

  const question = questions[index];
  const percent = (score: number) => `${Math.round(score * 100)}%`;

  async function check() {
    if (!selected || !question) return;
    setPending(true);
    setError(null);
    const response = await fetch(`/api/quiz/${moduleId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "check", questionId: question.id, optionId: selected }),
    });
    const body = (await response.json().catch(() => ({}))) as Feedback & { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(body.error ?? "לא הצלחנו לבדוק את התשובה.");
      return;
    }
    setFeedback(body);
    setAnswers((prev) => ({ ...prev, [question.id]: selected }));
  }

  async function finish(nextAnswers: Record<string, string>) {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/quiz/${moduleId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "submit", answers: nextAnswers }),
    });
    const body = (await response.json().catch(() => ({}))) as FinalResult & { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(body.error ?? "לא הצלחנו לשמור את הציון.");
      return;
    }
    setFinalResult(body);
    router.refresh();
  }

  if (finalResult) {
    return (
      <section className="space-y-5">
        <p className="text-muted-foreground text-sm">הציון במבחן הזה</p>
        <p className="text-5xl font-medium tabular-nums" dir="ltr">
          {percent(finalResult.score)}
        </p>
        <p className="leading-7">
          {finalResult.correctCount} תשובות נכונות מתוך {finalResult.total}. סף המעבר הוא{" "}
          {percent(PASS_THRESHOLD)}.
        </p>
        <p className="leading-7">
          {finalResult.passed
            ? "עברת. המודול הבא נפתח."
            : "עוד לא עברת. השיעורים נשארים פתוחים, ואפשר לגשת שוב."}
        </p>
        {finalResult.best > finalResult.score ? (
          <p className="text-muted-foreground text-sm">
            הציון הגבוה שנשמר: {percent(finalResult.best)}.
          </p>
        ) : null}
        <ol className="space-y-3">
          {finalResult.results.map((result, i) => (
            <li key={result.id} className="rounded-xl bg-card px-4 py-3 text-sm leading-6 ring-1 ring-foreground/10">
              <span className="text-muted-foreground">שאלה {i + 1}. </span>
              {result.correct ? "נכון. " : "לא נכון. "}
              {result.explanation}
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-2 sm:flex-row">
          {finalResult.passed && nextHref ? (
            <Button nativeButton={false} render={<Link href={nextHref} />} className="h-11 px-4">
              אל המודול הבא
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="h-11 px-4"
            onClick={() => {
              setIndex(0);
              setSelected(null);
              setFeedback(null);
              setAnswers({});
              setFinalResult(null);
            }}
          >
            ניסיון נוסף
          </Button>
        </div>
      </section>
    );
  }

  if (!question) return null;

  return (
    <section>
      {bestScore != null ? (
        <p className="text-muted-foreground mb-4 text-sm">
          הציון הגבוה עד עכשיו: {percent(bestScore)}
          {bestScore >= PASS_THRESHOLD ? ". המודול הבא כבר פתוח." : "."}
        </p>
      ) : null}
      <p className="text-muted-foreground text-sm">
        שאלה {index + 1} מתוך {questions.length}
      </p>
      <h2 className="mt-2 text-2xl leading-snug font-medium">{question.prompt}</h2>
      <div className="mt-5 space-y-2" role="radiogroup" aria-label={question.prompt}>
        {question.options.map((option) => {
          const isSelected = selected === option.id;
          const showCorrect = feedback && option.id === feedback.correctOptionId;
          const showWrong = feedback && isSelected && !feedback.correct;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={Boolean(feedback)}
              onClick={() => setSelected(option.id)}
              className={cn(
                "w-full rounded-xl px-4 py-3 text-start text-sm leading-6 ring-1 ring-foreground/10",
                isSelected && !feedback && "bg-primary text-primary-foreground ring-primary",
                showCorrect && "bg-primary/10 ring-primary",
                showWrong && "bg-destructive/10 ring-destructive",
              )}
            >
              {option.text}
            </button>
          );
        })}
      </div>
      {feedback ? (
        <div className="bg-muted mt-4 rounded-xl px-4 py-3 text-sm leading-6">
          <p className="font-medium">{feedback.correct ? "נכון." : "לא נכון."}</p>
          <p className="mt-1">{feedback.explanation}</p>
        </div>
      ) : null}
      {error ? <p className="text-destructive mt-3 text-sm">{error}</p> : null}
      <div className="mt-5">
        {!feedback ? (
          <Button type="button" className="h-11 px-4" disabled={!selected || pending} onClick={check}>
            {pending ? "בודקים…" : "בדיקת תשובה"}
          </Button>
        ) : index < questions.length - 1 ? (
          <Button
            type="button"
            className="h-11 px-4"
            onClick={() => {
              setIndex((value) => value + 1);
              setSelected(null);
              setFeedback(null);
            }}
          >
            לשאלה הבאה
          </Button>
        ) : (
          <Button type="button" className="h-11 px-4" disabled={pending} onClick={() => finish(answers)}>
            {pending ? "שומרים…" : "סיום ושמירת ציון"}
          </Button>
        )}
      </div>
    </section>
  );
}
