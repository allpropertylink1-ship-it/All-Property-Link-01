export interface SubTypeOption {
  value: string
  label: string
}

/**
 * Optional sub-type per physical property structure.
 * A subType is only valid for its own propertyType
 * (e.g. PENTHOUSE is an APARTMENT, never LAND).
 */
export const PROPERTY_SUB_TYPES: Record<string, SubTypeOption[]> = {
  HOUSE: [
    { value: "BUNGALOW", label: "Bungalow" },
    { value: "MAISONETTE", label: "Maisonette" },
    { value: "VILLA", label: "Villa" },
    { value: "TOWNHOUSE", label: "Townhouse" },
    { value: "MANSION", label: "Mansion" },
  ],
  APARTMENT: [
    { value: "BEDSITTER", label: "Bedsitter" },
    { value: "STUDIO", label: "Studio" },
    { value: "1_BEDROOM", label: "1 Bedroom" },
    { value: "2_BEDROOM", label: "2 Bedroom" },
    { value: "3_BEDROOM", label: "3 Bedroom" },
    { value: "PENTHOUSE", label: "Penthouse" },
  ],
  LAND: [
    { value: "EMPTY_PLOT", label: "Empty Plot" },
    { value: "AGRICULTURAL", label: "Agricultural" },
    { value: "COMMERCIAL_PLOT", label: "Commercial Plot" },
  ],
  COMMERCIAL: [
    { value: "OFFICE", label: "Office" },
    { value: "SHOP", label: "Shop" },
    { value: "WAREHOUSE", label: "Warehouse" },
    { value: "FACTORY", label: "Factory" },
    { value: "RESTAURANT", label: "Restaurant" },
  ],
}

export function subTypeOptionsFor(propertyType: string | null | undefined): SubTypeOption[] {
  if (!propertyType) return []
  return PROPERTY_SUB_TYPES[propertyType] ?? []
}

export function subTypeLabel(propertyType: string | null | undefined, subType: string | null | undefined): string | null {
  if (!propertyType || !subType) return null
  return PROPERTY_SUB_TYPES[propertyType]?.find((s) => s.value === subType)?.label ?? null
}
