export interface TradeCategory {
  name: string;
  slug?: string | null;
}

const GENERIC_SLUGS = new Set(["general-fundi", "general", "general-service", "general-services"]);
const GENERIC_NAMES = new Set([
  "general fundi",
  "general service",
  "general services",
  "general",
  "fundi",
]);

export function isGenericCategory(category: TradeCategory | null | undefined): boolean {
  if (!category) return false;
  const slug = (category.slug || "").toLowerCase().trim();
  if (slug && GENERIC_SLUGS.has(slug)) return true;
  return GENERIC_NAMES.has(category.name.toLowerCase().trim());
}

/** "General Fundi Ceiling Works Services by Stephen" → "Ceiling Works". Null when nothing specific remains. */
export function tradeLabelFromTitle(title: string | null | undefined): string | null {
  if (!title || !title.trim()) return null;
  let base = title.trim();
  const dashParts = base.split(/\s+[—–-]\s+/);
  if (dashParts.length > 1) {
    const last = dashParts[dashParts.length - 1].trim();
    if (/services?\b/i.test(last) || /\bin\b/i.test(last)) base = last;
  }
  const cutPatterns = [
    /\s+services?\s+by\s+.+$/i,
    /\s+services?\s+in\s+.+$/i,
    /\s+by\s+.+$/i,
    /\s+in\s+.+$/i,
  ];
  for (const pat of cutPatterns) {
    const next = base.replace(pat, "").trim();
    if (next !== base && next.length >= 2) {
      base = next;
      break;
    }
  }
  base = base
    .replace(/^(general\s+fundi|general\s+service|general\s+services|general|fundi)\s+/i, "")
    .replace(/\s+services?$/i, "")
    .trim();
  if (!base || base.length < 2) return null;
  if (/^(in|at|of|near)\s+/i.test(base)) return null;
  if (GENERIC_NAMES.has(base.toLowerCase())) return null;
  return base;
}

/** Homepage rule: generic categories show the real trade from the title, falling back to "Handyman". */
export function getTradeLabel(
  category: TradeCategory | null | undefined,
  title: string | null | undefined,
  fallback = "Handyman"
): string | null {
  if (isGenericCategory(category)) return tradeLabelFromTitle(title) || fallback;
  return category?.name || tradeLabelFromTitle(title) || fallback;
}
