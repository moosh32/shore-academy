export const DISCIPLINE_TAGS = [
  { id: "stop", label: "עמדתי בסטופ" },
  { id: "size", label: "גודל לפי תוכנית" },
  { id: "no-revenge", label: "לא הגדלתי אחרי הפסד" },
  { id: "logged", label: "תועד בזמן" },
  { id: "green", label: "רמזור ירוק" },
  { id: "yellow", label: "רמזור צהוב" },
  { id: "red", label: "רמזור אדום" },
] as const;

export type TagId = (typeof DISCIPLINE_TAGS)[number]["id"];

const allowed = new Set<string>(DISCIPLINE_TAGS.map((t) => t.id));

export function parseTags(raw: string): TagId[] {
  try {
    const value = JSON.parse(raw) as unknown;
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is TagId => typeof item === "string" && allowed.has(item));
  } catch {
    return [];
  }
}

export function tagLabel(id: string) {
  return DISCIPLINE_TAGS.find((t) => t.id === id)?.label ?? id;
}
