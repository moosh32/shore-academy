import {
  DEFAULT_RISK_PCT,
  MAX_HEAT,
  RECOVERY_TABLE,
  expectancy,
  losingStreak,
  positionSize,
  recovery,
  recoveryNeeded,
  riskReward,
} from "@/lib/calc";
import { formatFlexible, formatNumber, formatPct, formatR } from "@/lib/format";

export type ToolId = "position" | "rr" | "expectancy" | "recovery" | "streak";

export type FieldSpec = {
  key: string;
  label: string;
  hint?: string;
  defaultValue: string;
  step: string;
  /** User types a percent (0.3) and we divide by 100 before the formula. */
  percent?: boolean;
};

export type ToolTable = {
  caption: string;
  columns: [string, string];
  rows: [string, string][];
};

export type ToolView = {
  headline: string;
  headlineLabel: string;
  rows: { label: string; value: string }[];
  warnings: string[];
  note: string;
  formula: string;
  table?: ToolTable;
};

export type ToolSpec = {
  id: ToolId;
  title: string;
  blurb: string;
  fields: FieldSpec[];
  formula: string;
};

export const tools: ToolSpec[] = [
  {
    id: "position",
    title: "גודל פוזיציה",
    blurb: "סיכון בכסף חלקי מרחק הסטופ. ברירת מחדל: 0.3% לעסקה.",
    formula: "סיכון = הון × אחוז סיכון. יחידות = ⌊סיכון ÷ מרחק סטופ⌋.",
    fields: [
      { key: "equity", label: "הון החשבון", hint: "במטבע החשבון", defaultValue: "100000", step: "1" },
      {
        key: "riskPercent",
        label: "סיכון לעסקה (%)",
        hint: "ברירת מחדל 0.3",
        defaultValue: "0.3",
        step: "0.1",
        percent: true,
      },
      { key: "entry", label: "מחיר כניסה", defaultValue: "50", step: "0.01" },
      { key: "stop", label: "מחיר סטופ", defaultValue: "48", step: "0.01" },
      {
        key: "openHeatPercent",
        label: "Heat פתוח כרגע (%)",
        hint: "סיכון שכבר פתוח. תקרה במסלול: 1.5",
        defaultValue: "0",
        step: "0.1",
        percent: true,
      },
    ],
  },
  {
    id: "rr",
    title: "יחס סיכון–סיכוי",
    blurb: "כמה R מתוכננים בין הסטופ ליעד.",
    formula: "R מתוכנן = מרחק היעד ÷ מרחק הסטופ.",
    fields: [
      { key: "entry", label: "מחיר כניסה", defaultValue: "100", step: "0.01" },
      { key: "stop", label: "מחיר סטופ", defaultValue: "96", step: "0.01" },
      { key: "target", label: "מחיר יעד", defaultValue: "108", step: "0.01" },
    ],
  },
  {
    id: "expectancy",
    title: "תוחלת",
    blurb: "תוחלת בסדרת עסקאות, ביחידות R. לא תחזית לעסקה הבאה.",
    formula: "תוחלת = (אחוז הצלחה × ממוצע רווח) − ((1 − אחוז הצלחה) × ממוצע הפסד).",
    fields: [
      {
        key: "winPercent",
        label: "אחוז הצלחה (%)",
        defaultValue: "40",
        step: "1",
        percent: true,
      },
      { key: "avgWinR", label: "ממוצע רווח (R)", defaultValue: "2", step: "0.1" },
      {
        key: "avgLossR",
        label: "ממוצע הפסד (R)",
        hint: "גודל חיובי. הפסד של 1R נרשם כ-1",
        defaultValue: "1",
        step: "0.1",
      },
    ],
  },
  {
    id: "recovery",
    title: "התאוששות מדרוודאון",
    blurb: "איזו תשואה צריך כדי לחזור להון שהיה לפני הירידה.",
    formula: "תשואה נדרשת = ירידה ÷ (1 − ירידה).",
    fields: [
      {
        key: "drawdownPercent",
        label: "דרוודאון (%)",
        hint: "ירידה של 10 נרשמת כ-10",
        defaultValue: "10",
        step: "0.1",
        percent: true,
      },
    ],
  },
  {
    id: "streak",
    title: "רצף הפסדים",
    blurb: "הסתברות לרצף, ומה נשאר מההון אם כל הפסד הוא בדיוק 1R.",
    formula: "הסתברות = (אחוז הפסד) בחזקת האורך. הון שנותר ≈ (1 − סיכון) בחזקת האורך.",
    fields: [
      {
        key: "lossPercent",
        label: "אחוז עסקאות שמפסידות (%)",
        defaultValue: "60",
        step: "1",
        percent: true,
      },
      { key: "length", label: "אורך הרצף", defaultValue: "5", step: "1" },
      {
        key: "riskPercent",
        label: "סיכון לעסקה (%)",
        hint: "ברירת מחדל 0.3",
        defaultValue: "0.3",
        step: "0.1",
        percent: true,
      },
    ],
  },
];

export function getTool(id: string) {
  return tools.find((tool) => tool.id === id) ?? null;
}

export function runTool(
  toolId: string,
  raw: Record<string, number>,
): { ok: true; view: ToolView } | { ok: false; error: string } {
  if (toolId === "position") {
    const result = positionSize({
      equity: raw.equity,
      riskPct: raw.riskPercent / 100,
      entry: raw.entry,
      stop: raw.stop,
      openHeatPct: raw.openHeatPercent / 100,
    });
    if (!result.ok) return result;
    const data = result.data;
    return {
      ok: true,
      view: {
        headline: formatNumber(data.shares, 0),
        headlineLabel: "יחידות (מעוגל למטה)",
        formula: tools[0].formula,
        warnings: data.warnings,
        note: "הסכום בסיכון בפועל יכול להיות נמוך מעט מהאחוז, בגלל העיגול למטה. המטבע לא משנה — ובלבד שכל השדות באותו מטבע.",
        rows: [
          { label: "סכום סיכון לפי האחוז", value: formatNumber(data.riskMoney, 2) },
          { label: "מרחק סטופ", value: formatFlexible(data.stopDistance) },
          { label: "סכום בסיכון בפועל", value: formatNumber(data.actualRisk, 2) },
          { label: "Heat אחרי העסקה", value: formatPct(data.heatAfter, 2) },
          { label: "תקרת Heat במסלול", value: formatPct(MAX_HEAT, 1) },
          { label: "ברירת מחדל לעסקה", value: formatPct(DEFAULT_RISK_PCT, 1) },
        ],
      },
    };
  }

  if (toolId === "rr") {
    const result = riskReward({
      entry: raw.entry,
      stop: raw.stop,
      target: raw.target,
    });
    if (!result.ok) return result;
    const data = result.data;
    const warnings = data.directionOk
      ? []
      : ["היעד לא נמצא בצד הרווח של הכניסה. היחס מחושב, אבל זו לא עסקה עם כיוון תקין."];
    return {
      ok: true,
      view: {
        headline: formatR(data.ratio),
        headlineLabel: data.isLong ? "R מתוכנן בלונג" : "R מתוכנן בשורט",
        formula: "R מתוכנן = מרחק היעד ÷ מרחק הסטופ.",
        warnings,
        note: "זה היחס לפני הכניסה. R בפועל נקבע רק לפי מחיר היציאה.",
        rows: [
          { label: "מרחק סטופ", value: formatFlexible(data.riskDist) },
          { label: "מרחק יעד", value: formatFlexible(data.rewardDist) },
          { label: "יחס", value: `1 : ${formatFlexible(data.ratio)}` },
        ],
      },
    };
  }

  if (toolId === "expectancy") {
    const result = expectancy({
      winRate: raw.winPercent / 100,
      avgWinR: raw.avgWinR,
      avgLossR: raw.avgLossR,
    });
    if (!result.ok) return result;
    const ev = result.data.ev;
    return {
      ok: true,
      view: {
        headline: formatR(ev),
        headlineLabel: "תוחלת לעסקה",
        formula: "תוחלת = (WR × ממוצע רווח) − ((1 − WR) × ממוצע הפסד).",
        warnings:
          ev < 0
            ? ["התוחלת שלילית: בסדרה ארוכה התהליך הזה מפסיד ביחידות R, גם אם יש עסקאות מרוויחות."]
            : ev === 0
              ? ["התוחלת אפס. אין כאן יתרון מדיד ב-R."]
              : [],
        note: "תוחלת חיובית לא אומרת שהעסקה הבאה תרוויח. היא מתארת ממוצע של סדרה, אם המספרים שהוזנו נשארים יציבים.",
        rows: [
          { label: "ל-100 עסקאות, בקירוב", value: formatR(ev * 100) },
          { label: "אחוז הצלחה שהוזן", value: formatPct(raw.winPercent / 100, 1) },
        ],
      },
    };
  }

  if (toolId === "recovery") {
    const dd = raw.drawdownPercent / 100;
    const result = recovery(dd);
    if (!result.ok) return result;
    return {
      ok: true,
      view: {
        headline: formatPct(result.data.needed, 2),
        headlineLabel: "תשואה נדרשת כדי לחזור",
        formula: "תשואה נדרשת = ירידה ÷ (1 − ירידה).",
        warnings:
          dd >= 0.2
            ? ["ירידה עמוקה דורשת תשואה גבוהה יותר מהאחוז שירד. הגדלת סיכון כדי «להחזיר» מעמיקה את הבור אם ההפסד הבא מגיע."]
            : [],
        note: "החשבון הוא על ההון, לא על מניה בודדת. הוא לא מציע להגדיל סיכון כדי לסגור את הפער.",
        rows: [
          { label: "ירידה שהוזנה", value: formatPct(dd, 2) },
          { label: "הון שנשאר מתוך 100", value: formatNumber((1 - dd) * 100, 2) },
        ],
        table: {
          caption: "טבלת התאוששות",
          columns: ["ירידה", "תשואה נדרשת"],
          rows: RECOVERY_TABLE.map((row) => [
            formatPct(row, 0),
            formatPct(recoveryNeeded(row), 1),
          ]),
        },
      },
    };
  }

  if (toolId === "streak") {
    const length = raw.length;
    const result = losingStreak({
      lossRate: raw.lossPercent / 100,
      length,
      riskPct: raw.riskPercent / 100,
    });
    if (!result.ok) return result;
    return {
      ok: true,
      view: {
        headline: formatPct(result.data.probability, 2),
        headlineLabel: `הסתברות ל-${formatNumber(length, 0)} הפסדים ברצף`,
        formula: "הסתברות = (אחוז הפסד)ⁿ. הון שנותר = (1 − סיכון לעסקה)ⁿ.",
        warnings: [],
        note: "ההון שנותר מניח שכל הפסד הוא בדיוק 1R, והסיכון הוא אחוז קבוע מההון העדכני. זה אינטואיציה, לא תחזית מסלול.",
        rows: [
          { label: "הון שנותר", value: formatPct(result.data.equityLeft, 2) },
          { label: "ירידה מצטברת", value: formatPct(result.data.drawdown, 2) },
          { label: "סיכון לעסקה", value: formatPct(raw.riskPercent / 100, 2) },
        ],
      },
    };
  }

  return { ok: false, error: "מחשבון לא מוכר." };
}
