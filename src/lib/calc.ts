/** Canonical course defaults from Moshe's materials. Fractions, not percents. */
export const DEFAULT_RISK_PCT = 0.003;
export const MAX_HEAT = 0.015;

export type CalcFail = { ok: false; error: string };
export type CalcOk<T> = { ok: true; data: T };
export type CalcResult<T> = CalcOk<T> | CalcFail;

const EPS = 1e-9;

export type PositionInput = {
  equity: number;
  /** Fraction of equity risked on this trade, e.g. 0.003 for 0.3%. */
  riskPct: number;
  entry: number;
  stop: number;
  /** Risk already open, as a fraction of equity. */
  openHeatPct?: number;
};

export type PositionData = {
  riskMoney: number;
  stopDistance: number;
  shares: number;
  actualRisk: number;
  unusedRisk: number;
  heatAfter: number;
  warnings: string[];
};

export function positionSize(input: PositionInput): CalcResult<PositionData> {
  const openHeatPct = input.openHeatPct ?? 0;

  if (!(input.equity > 0) || !Number.isFinite(input.equity)) {
    return { ok: false, error: "ההון חייב להיות מספר גדול מאפס." };
  }
  if (
    !(input.riskPct > 0) ||
    input.riskPct >= 1 ||
    !Number.isFinite(input.riskPct)
  ) {
    return { ok: false, error: "אחוז הסיכון לעסקה חייב להיות גדול מ-0 וקטן מ-100." };
  }
  if (!(input.entry > 0) || !(input.stop > 0)) {
    return { ok: false, error: "מחיר הכניסה ומחיר הסטופ חייבים להיות גדולים מאפס." };
  }
  if (!Number.isFinite(openHeatPct) || openHeatPct < 0 || openHeatPct >= 1) {
    return { ok: false, error: "Heat פתוח חייב להיות בין 0 ל-100 אחוז." };
  }

  const stopDistance = Math.abs(input.entry - input.stop);
  if (!(stopDistance > 0)) {
    return { ok: false, error: "מרחק הסטופ חייב להיות גדול מאפס." };
  }

  const riskMoney = input.equity * input.riskPct;
  const shares = Math.floor(riskMoney / stopDistance);
  const actualRisk = shares * stopDistance;
  const heatAfter = openHeatPct + input.riskPct;
  const warnings: string[] = [];

  if (input.riskPct > DEFAULT_RISK_PCT + EPS) {
    warnings.push("הסיכון לעסקה גבוה מ-0.3%, ברירת המחדל במסלול.");
  }
  if (heatAfter > MAX_HEAT + EPS) {
    warnings.push("Heat כולל יעבור 1.5%. במסלול זה התקרה היא 1.5% סיכון פתוח.");
  }
  if (shares === 0) {
    warnings.push("מרחק הסטופ גדול מדי ביחס לסכום הסיכון — לפי הנוסחה לא קונים יחידה.");
  }

  return {
    ok: true,
    data: {
      riskMoney,
      stopDistance,
      shares,
      actualRisk,
      unusedRisk: riskMoney - actualRisk,
      heatAfter,
      warnings,
    },
  };
}

export type ExpectancyInput = {
  /** 0–1 */
  winRate: number;
  avgWinR: number;
  /** Positive magnitude of the average loss, in R. */
  avgLossR: number;
};

/** EV = (WR * avgWinR) - ((1 - WR) * avgLossR) */
export function expectancy(input: ExpectancyInput): CalcResult<{ ev: number }> {
  if (!Number.isFinite(input.winRate) || input.winRate < 0 || input.winRate > 1) {
    return { ok: false, error: "אחוז הצלחה חייב להיות בין 0 ל-100." };
  }
  if (!Number.isFinite(input.avgWinR) || input.avgWinR < 0) {
    return { ok: false, error: "ממוצע רווח ב-R לא יכול להיות שלילי." };
  }
  if (!Number.isFinite(input.avgLossR) || input.avgLossR < 0) {
    return { ok: false, error: "ממוצע הפסד נרשם כגודל חיובי, לא כמספר שלילי." };
  }

  const ev = input.winRate * input.avgWinR - (1 - input.winRate) * input.avgLossR;
  return { ok: true, data: { ev } };
}

/** Return needed to get back to the starting equity after a drawdown dd (0–1). */
export function recoveryNeeded(dd: number): number {
  return dd / (1 - dd);
}

export function recovery(dd: number): CalcResult<{ needed: number }> {
  if (!Number.isFinite(dd) || !(dd > 0) || dd >= 1) {
    return {
      ok: false,
      error: "דרוודאון חייב להיות גדול מ-0 וקטן מ-100 אחוז.",
    };
  }
  return { ok: true, data: { needed: recoveryNeeded(dd) } };
}

export const RECOVERY_TABLE = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5] as const;

export type RiskRewardInput = {
  entry: number;
  stop: number;
  target: number;
};

export function riskReward(
  input: RiskRewardInput,
): CalcResult<{
  riskDist: number;
  rewardDist: number;
  ratio: number;
  isLong: boolean;
  directionOk: boolean;
}> {
  if (!(input.entry > 0) || !(input.stop > 0) || !(input.target > 0)) {
    return { ok: false, error: "כניסה, סטופ ויעד חייבים להיות מחירים גדולים מאפס." };
  }
  const riskDist = Math.abs(input.entry - input.stop);
  if (!(riskDist > 0)) {
    return { ok: false, error: "מרחק הסטופ חייב להיות גדול מאפס." };
  }
  const rewardDist = Math.abs(input.target - input.entry);
  const isLong = input.stop < input.entry;
  const directionOk = isLong ? input.target > input.entry : input.target < input.entry;
  return {
    ok: true,
    data: {
      riskDist,
      rewardDist,
      ratio: rewardDist / riskDist,
      isLong,
      directionOk,
    },
  };
}

export type StreakInput = {
  /** Probability a single trade loses, 0–1. */
  lossRate: number;
  length: number;
  /** Fractional risk per trade, e.g. 0.003. */
  riskPct: number;
};

/**
 * Probability of `length` losses in a row, and equity left if each loss is
 * exactly 1R at a fixed percent of the then-current equity.
 */
export function losingStreak(
  input: StreakInput,
): CalcResult<{ probability: number; equityLeft: number; drawdown: number }> {
  if (!Number.isFinite(input.lossRate) || input.lossRate < 0 || input.lossRate > 1) {
    return { ok: false, error: "אחוז ההפסד לעסקה חייב להיות בין 0 ל-100." };
  }
  if (!Number.isInteger(input.length) || input.length < 1 || input.length > 40) {
    return { ok: false, error: "אורך הרצף הוא מספר שלם בין 1 ל-40." };
  }
  if (!Number.isFinite(input.riskPct) || !(input.riskPct > 0) || input.riskPct >= 1) {
    return { ok: false, error: "סיכון לעסקה חייב להיות גדול מ-0 וקטן מ-100 אחוז." };
  }

  const probability = input.lossRate ** input.length;
  const equityLeft = (1 - input.riskPct) ** input.length;
  return {
    ok: true,
    data: { probability, equityLeft, drawdown: 1 - equityLeft },
  };
}

/** Actual R for a long: (exit - entry) / (entry - stop). */
export function actualRLong(entry: number, stop: number, exit: number): number {
  return (exit - entry) / (entry - stop);
}
