import { z } from "zod";
import { DISCIPLINE_TAGS } from "@/lib/journal";

const tagIds = DISCIPLINE_TAGS.map((t) => t.id) as [string, ...string[]];

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "השם קצר מדי").max(40, "השם ארוך מדי"),
    email: z.email("אימייל לא תקין"),
    password: z
      .string()
      .min(8, "סיסמה של 8 תווים לפחות")
      .max(72, "סיסמה ארוכה מדי"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "הסיסמאות לא תואמות",
    path: ["confirm"],
  });

export const loginSchema = z.object({
  email: z.email("אימייל לא תקין"),
  password: z.string().min(1, "חסרה סיסמה"),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "השם קצר מדי").max(40, "השם ארוך מדי"),
});

export const lessonSchema = z.object({
  lessonId: z.string().min(1),
});

export const journalSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "תאריך לא תקין"),
  ticker: z
    .string()
    .trim()
    .max(12, "טיקר ארוך מדי")
    .optional()
    .transform((value) => (value ? value.toUpperCase() : null)),
  plannedR: z.number().finite("R מתוכנן חייב להיות מספר"),
  actualR: z.number().finite("R בפועל חייב להיות מספר"),
  notes: z.string().trim().max(2000, "ההערה ארוכה מדי"),
  tags: z.array(z.enum(tagIds)).max(8),
});

export function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "הפרטים לא תקינים.";
}
