const num = new Intl.NumberFormat("he-IL", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const numFixed = (digits: number) =>
  new Intl.NumberFormat("he-IL", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });

export function formatNumber(value: number, digits = 2) {
  if (digits === 0) {
    return new Intl.NumberFormat("he-IL", { maximumFractionDigits: 0 }).format(value);
  }
  return numFixed(digits).format(value);
}

export function formatFlexible(value: number) {
  return num.format(value);
}

export function formatPct(ratio: number, digits = 2) {
  return new Intl.NumberFormat("he-IL", {
    style: "percent",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits === 0 ? 0 : Math.min(digits, 1),
  }).format(ratio);
}

export function formatR(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value, 2)}R`;
}

export function formatDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
