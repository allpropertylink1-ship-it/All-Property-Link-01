/**
 * Service taxonomy — single source of truth (Phase 1).
 * Sectors (A-Z, Other last) -> Specialties (A-Z, Other last).
 * Specialty code == listing Category slug mapping (slugify label).
 * Backward compatible: all 87 legacy UPPER_SNAKE codes preserved.
 */

export interface Specialty {
  code: string;
  label: string;
  isOther?: boolean;
}

export interface Sector {
  id: string;
  name: string;
  persona: "FUNDI" | "SERVICE_PROVIDER" | "BOTH";
  specialties: Specialty[];
}

export const OTHER_SECTOR_ID = "OTHER";

/** Taxonomy revision — bump when sectors/specialties change. Clients use
 *  it to invalidate localStorage drafts saved under an older revision. */
export const TAXONOMY_VERSION = 1;

/** Total + per-sector selection caps (existing API already caps 20 total). */
export const MAX_SPECIALTIES_TOTAL = 20;
export const MAX_SPECIALTIES_PER_SECTOR = 8;

function other(codePrefix: string): Specialty {
  return { code: `${codePrefix}_OTHER`, label: "Other", isOther: true };
}

/**
 * Alias map — duplicate/legacy ticks that share ONE listing shelf.
 * Key = alias code, value = canonical code. categorySlugForSpecialty()
 * resolves through this map so PLUMBING + PLUMBING_SERVICES both land
 * on slug "plumbing" instead of two near-identical categories.
 * Admin MUST merge the duplicate child categories via POST /api/admin/categories/merge.
 */
export const SPECIALTY_ALIASES: Record<string, string> = {
  PLUMBING_SERVICES: "PLUMBING",
  ELECTRICAL_INSTALLATION: "ELECTRICAL",
  FLOORING_TILING: "TILING",
  AC_SERVICING: "AC_REFRIGERATION",
  POOL_MAINTENANCE: "POOL_SERVICES",
  BEAUTIFICATION_LANDSCAPING: "LANDSCAPING",
  EXECUTIVE_BARBER: "BARBER",
};

/** Canonical code after alias resolution. Unknown customs pass through. */
export function canonicalCode(code: string): string {
  return SPECIALTY_ALIASES[code] ?? code;
}

/**
 * Licensed / regulated trades — surfaced in UI as "license may be checked
 * at KYC/moderation" and usable by admin review queues. Does NOT block
 * selection (verification happens offline); kept as data, not a gate.
 */
export const LICENSED_SPECIALTIES: ReadonlySet<string> = new Set([
  "ELECTRICAL",
  "GAS_FITTING",
  "SOLAR_BATTERIES",
  "BOREHOLE_DRILLING",
  "SEPTIC_TANKS",
  "GENERATOR_INSTALL",
  "EV_CHARGER",
  "FIRE_ALARM_INSTALL",
  "FIRE_SAFETY",
  "PEST_CONTROL",
  "VETERINARY_MOBILE",
  "SECURITY",
  "LOCKSMITH",
  "CONVEYANCING_LAWYER",
  "REAL_ESTATE_VALUATION",
  "LAND_SURVEYOR",
  "ARCHITECTURAL_DRAWINGS",
  "QUANTITY_SURVEYOR",
]);

export function requiresLicense(code: string): boolean {
  return LICENSED_SPECIALTIES.has(canonicalCode(code));
}

export const SECTORS: Sector[] = [
  {
    id: "APPLIANCES_ELECTRONICS",
    name: "Appliances & Electronics",
    persona: "BOTH",
    specialties: [
      { code: "APPLIANCE_REPAIR", label: "Appliance Repair" },
      { code: "COMPUTER_REPAIR", label: "Computer Repair" },
      { code: "ELECTRONICS_REPAIR", label: "Electronics Repair" },
      { code: "HOME_THEATER_INSTALL", label: "Home Theater Install" },
      { code: "MOBILE_PHONE_REPAIR", label: "Mobile Phone Repair" },
      { code: "SMART_HOME_INSTALL", label: "Smart Home Install" },
      other("APPLIANCES_ELECTRONICS"),
    ],
  },
  {
    id: "AUTOMOTIVE_TRANSPORT",
    name: "Automotive, Bikes & Transport",
    persona: "BOTH",
    specialties: [
      { code: "AUTO_MECHANIC_GENERAL", label: "Auto Mechanic General" },
      { code: "BIKE_SALES_REPAIR", label: "Bike Sales & Repair" },
      { code: "CAR_ACCESSORIES", label: "Car Accessories" },
      { code: "CAR_ELECTRICIAN", label: "Car Electrician" },
      { code: "CAR_WASH_MOBILE", label: "Car Wash Mobile" },
      { code: "DRIVING_SCHOOL", label: "Driving School" },
      { code: "GOODS_TRANSPORT", label: "Goods Transport Services" },
      { code: "JUNK_REMOVAL", label: "Junk Removal" },
      { code: "MERCEDES_SPECIALIST", label: "Mercedes Specialist" },
      { code: "MOTOR_VEHICLE_BODY", label: "Motor Vehicle Body Repair" },
      { code: "MOTOR_VEHICLE_SPRAY", label: "Motor Vehicle Spray Painting" },
      { code: "MOVING", label: "Moving" },
      { code: "PACKING_UNPACKING", label: "Packing & Unpacking" },
      { code: "TRUCK_HIRE", label: "Truck Hire" },
      { code: "TYRE_BATTERY", label: "Tyre & Battery" },
      other("AUTOMOTIVE_TRANSPORT"),
    ],
  },
  {
    id: "BEAUTY_WELLNESS",
    name: "Beauty, Fashion & Wellness",
    persona: "SERVICE_PROVIDER",
    specialties: [
      { code: "BARBER", label: "Barber" },
      { code: "CLOTHING_FOOTWEAR", label: "Clothing & Footwear" },
      { code: "EXECUTIVE_BARBER", label: "Executive Barber" },
      { code: "GYM_FITNESS", label: "Gym & Fitness" },
      { code: "HAIR_BEAUTY_THERAPY", label: "Hair & Beauty Therapy" },
      { code: "NAIL_SALON", label: "Nail Salon" },
      { code: "PERFUMES_SCENTS", label: "Perfumes & Scents" },
      { code: "PERSONAL_TRAINER", label: "Personal Trainer" },
      { code: "TAILORING", label: "Tailoring" },
      { code: "YOGA_MASSAGE", label: "Yoga & Massage" },
      other("BEAUTY_WELLNESS"),
    ],
  },
  {
    id: "BUILDING_FINISHES",
    name: "Building, Masonry & Finishes",
    persona: "FUNDI",
    specialties: [
      { code: "BRICKLAYING", label: "Bricklaying" },
      { code: "CABRO_PAVING", label: "Cabro Paving" },
      { code: "CEILING_WORKS", label: "Ceiling Works" },
      { code: "DRYWALL_PARTITION", label: "Drywall & Partition" },
      { code: "FENCE_GATE", label: "Fence & Gate" },
      { code: "FLOORING", label: "Flooring" },
      { code: "FLOORING_TILING", label: "Flooring & Tiling" },
      { code: "GENERAL_REPAIR", label: "General Repair" },
      { code: "GLAZING_WINDOWS", label: "Glazing & Windows" },
      { code: "MASONRY", label: "Masonry" },
      { code: "PAINTING", label: "Painting" },
      { code: "PLASTERING", label: "Plastering" },
      { code: "RENOVATION_CONTRACTOR", label: "Renovation Contractor" },
      { code: "ROOFING", label: "Roofing" },
      { code: "SCAFFOLDING", label: "Scaffolding" },
      { code: "TILING", label: "Tiling" },
      { code: "WALLPAPERING", label: "Wallpapering" },
      { code: "WATERPROOFING", label: "Waterproofing" },
      other("BUILDING_FINISHES"),
    ],
  },
  {
    id: "CARPENTRY_METALWORK",
    name: "Carpentry, Furniture & Metalwork",
    persona: "FUNDI",
    specialties: [
      { code: "CAR_SEATS_UPHOLSTERY", label: "Car Seats Upholstery" },
      { code: "CARPENTRY", label: "Carpentry" },
      { code: "DOORS_WINDOWS_FIT", label: "Doors & Windows Fit" },
      { code: "FABRICATION_METAL", label: "Fabrication & Metal" },
      { code: "FURNITURE_ASSEMBLY", label: "Furniture Assembly" },
      { code: "HOME_DECOR", label: "Home Decor" },
      { code: "INTERIOR_DESIGN", label: "Interior Design" },
      { code: "KITCHEN_CABINETS", label: "Kitchen Cabinets" },
      { code: "STEEL_FIXING", label: "Steel Fixing" },
      { code: "UPHOLSTERY_GENERAL", label: "Upholstery General" },
      { code: "WELDING", label: "Welding" },
      other("CARPENTRY_METALWORK"),
    ],
  },
  {
    id: "CLEANING_HOMECARE",
    name: "Cleaning, Laundry & Home Care",
    persona: "SERVICE_PROVIDER",
    specialties: [
      { code: "BABY_PROOFING", label: "Baby Proofing" },
      { code: "CARPET_UPHOLSTERY_CLEAN", label: "Carpet & Upholstery Clean" },
      { code: "CHILDCARE_NANNY", label: "Childcare & Nanny" },
      { code: "CLEANING", label: "Cleaning" },
      { code: "ELDERLY_HOME_CARE", label: "Elderly Home Care" },
      { code: "HOUSE_GIRLS_BUREAU", label: "House Girls Bureau" },
      { code: "LAUNDRY_SERVICES", label: "Laundry Services" },
      { code: "MAMA_FUA", label: "Mama Fua" },
      { code: "PEST_CONTROL", label: "Pest Control" },
      { code: "POOL_MAINTENANCE", label: "Pool Maintenance" },
      { code: "POOL_SERVICES", label: "Pool Services" },
      { code: "POST_CONSTRUCTION_CLEAN", label: "Post Construction Clean" },
      { code: "PRESSURE_WASHING", label: "Pressure Washing" },
      { code: "RECYCLING", label: "Recycling" },
      { code: "WASTE_COLLECTION", label: "Waste Collection" },
      { code: "WINDOW_CLEANING", label: "Window Cleaning" },
      other("CLEANING_HOMECARE"),
    ],
  },
  {
    id: "EDUCATION_OFFICE",
    name: "Education, Office & Errands",
    persona: "SERVICE_PROVIDER",
    specialties: [
      { code: "ART_CRAFTS_LESSONS", label: "Art & Crafts Lessons" },
      { code: "BOOKSHOP", label: "Bookshop" },
      { code: "DATA_ENTRY", label: "Data Entry" },
      { code: "ERRANDS_QUEUEING", label: "Errands & Queueing" },
      { code: "OFFICE_ADMIN_VA", label: "Office Admin & VA" },
      { code: "SEWING_ALTERATIONS", label: "Sewing & Alterations" },
      { code: "TRANSLATION_TRANSCRIPTION", label: "Translation & Transcription" },
      other("EDUCATION_OFFICE"),
    ],
  },
  {
    id: "ELECTRICAL_ENERGY",
    name: "Electrical, Energy & Automation",
    persona: "FUNDI",
    specialties: [
      { code: "DSTV_INTERNET_WIRING", label: "DSTV & Internet Wiring" },
      { code: "EV_CHARGER", label: "EV Charger" },
      { code: "ELECTRICAL", label: "Electrical" },
      { code: "ELECTRICAL_INSTALLATION", label: "Electrical Installation" },
      { code: "FIRE_ALARM_INSTALL", label: "Fire Alarm Install" },
      { code: "GENERATOR_INSTALL", label: "Generator Install" },
      { code: "HOME_AUTOMATION", label: "Home Automation" },
      { code: "LIGHTING_DESIGN", label: "Lighting Design" },
      { code: "SOLAR_BATTERIES", label: "Solar & Batteries" },
      other("ELECTRICAL_ENERGY"),
    ],
  },
  {
    id: "EVENTS_HOSPITALITY",
    name: "Events, Food & Hospitality",
    persona: "SERVICE_PROVIDER",
    specialties: [
      { code: "BAKING_COOKING", label: "Baking & Cooking" },
      { code: "BOUNCING_CASTLE", label: "Bouncing Castle" },
      { code: "BUTCHERY", label: "Butchery" },
      { code: "CAKES_PASTERIES", label: "Cakes & Pastries" },
      { code: "CATERING_SERVICES", label: "Catering Services" },
      { code: "EVENT_SETUP", label: "Event Setup" },
      { code: "FLORIST", label: "Florist" },
      { code: "SOUND_LIGHTING_HIRE", label: "Sound & Lighting Hire" },
      { code: "TENTS_CHAIRS_HIRE", label: "Tents & Chairs Hire" },
      { code: "WEDDING_PLANNING", label: "Wedding Planning" },
      { code: "WINES_SPIRITS", label: "Wines & Spirits" },
      other("EVENTS_HOSPITALITY"),
    ],
  },
  {
    id: "HVAC_REFRIGERATION",
    name: "HVAC & Refrigeration",
    persona: "FUNDI",
    specialties: [
      { code: "AC_REFRIGERATION", label: "AC Refrigeration" },
      { code: "AC_SERVICING", label: "AC Servicing" },
      { code: "COLD_ROOMS", label: "Cold Rooms" },
      { code: "HEATING_FURNACE", label: "Heating & Furnace" },
      { code: "VENTILATION_DUCTING", label: "Ventilation & Ducting" },
      other("HVAC_REFRIGERATION"),
    ],
  },
  {
    id: "ICT_CREATIVE",
    name: "ICT, Media & Creative",
    persona: "SERVICE_PROVIDER",
    specialties: [
      { code: "APP_DEVELOPMENT", label: "App Development" },
      { code: "CYBER_CAFE_PRINTING", label: "Cyber Cafe & Printing" },
      { code: "DJ", label: "DJ" },
      { code: "GRAPHIC_DESIGN", label: "Graphic Design" },
      { code: "IT_NETWORKING", label: "IT & Networking" },
      { code: "MC", label: "MC - Master of Ceremony" },
      { code: "ONLINE_PAYMENT", label: "Online Payment Systems" },
      { code: "PHOTOGRAPHY", label: "Photography" },
      { code: "SEO_CONTENT_WRITING", label: "SEO & Content Writing" },
      { code: "SOCIAL_MEDIA_MGMT", label: "Social Media Mgmt" },
      { code: "VIDEOGRAPHY", label: "Videography" },
      { code: "WEB_HOSTING", label: "Web Hosting" },
      { code: "WEBSITE_DESIGN", label: "Website Design & Development" },
      other("ICT_CREATIVE"),
    ],
  },
  {
    id: "LANDSCAPING_OUTDOOR",
    name: "Landscaping, Outdoor & Environment",
    persona: "BOTH",
    specialties: [
      { code: "BEAUTIFICATION_LANDSCAPING", label: "Beautification & Landscaping" },
      { code: "DECK_RESTORATION", label: "Deck Restoration" },
      { code: "FENCE_INSTALL", label: "Fence Install" },
      { code: "GARDENING", label: "Gardening" },
      { code: "IRRIGATION", label: "Irrigation" },
      { code: "LANDSCAPING", label: "Landscaping" },
      { code: "LAWN_MOWING", label: "Lawn Mowing" },
      { code: "OUTDOOR_LIGHTING", label: "Outdoor Lighting" },
      { code: "TREE_SURGERY", label: "Tree Surgery" },
      other("LANDSCAPING_OUTDOOR"),
    ],
  },
  {
    id: "PETS_VETERINARY",
    name: "Pets & Veterinary",
    persona: "SERVICE_PROVIDER",
    specialties: [
      { code: "DOG_WALKING", label: "Dog Walking" },
      { code: "PET_BOARDING", label: "Pet Boarding" },
      { code: "PET_GROOMING", label: "Pet Grooming" },
      { code: "VETERINARY_MOBILE", label: "Veterinary Mobile" },
      other("PETS_VETERINARY"),
    ],
  },
  {
    id: "PLUMBING_WATER",
    name: "Plumbing, Water & Sanitation",
    persona: "FUNDI",
    specialties: [
      { code: "BOREHOLE_DRILLING", label: "Borehole Drilling" },
      { code: "DRAINAGE_SEWAGE", label: "Drainage & Sewage" },
      { code: "GAS_FITTING", label: "Gas Fitting" },
      { code: "PIPELAYER", label: "Pipelayer" },
      { code: "PLUMBING", label: "Plumbing" },
      { code: "PLUMBING_SERVICES", label: "Plumbing Services" },
      { code: "RAINWATER_HARVESTING", label: "Rainwater Harvesting" },
      { code: "SEPTIC_TANKS", label: "Septic Tanks" },
      { code: "SEWAGE_UNBLOCKING", label: "Sewage Unblocking" },
      { code: "WATER_HEATER_INSTALL", label: "Water Heater Install" },
      { code: "WATER_TREATMENT", label: "Water Treatment" },
      other("PLUMBING_WATER"),
    ],
  },
  {
    id: "PROFESSIONAL_BUSINESS",
    name: "Professional, Business & Property Services",
    persona: "SERVICE_PROVIDER",
    specialties: [
      { code: "ACCOUNTING_BOOKKEEPING", label: "Accounting & Bookkeeping" },
      { code: "AGROVET_FEEDS", label: "Agrovets & Feeds" },
      { code: "ARCHITECTURAL_DRAWINGS", label: "Architectural Drawings" },
      { code: "CHEMIST", label: "Chemist" },
      { code: "CONVEYANCING_LAWYER", label: "Conveyancing Lawyer" },
      { code: "FINANCIAL_CONSULTANT", label: "Financial Consultant" },
      { code: "GUIDANCE_COUNSELLING", label: "Guidance & Counselling" },
      { code: "HARDWARE", label: "Hardware" },
      { code: "HERBALIST", label: "Herbalist" },
      { code: "HOLIDAY_TUITION", label: "Holiday Tuition" },
      { code: "INSURANCE_BROKER", label: "Insurance Broker" },
      { code: "LAND_SURVEYOR", label: "Land Surveyor" },
      { code: "LOG_BOOK_LOANS", label: "Log Book Loans" },
      { code: "QUANTITY_SURVEYOR", label: "Quantity Surveyor" },
      { code: "REAL_ESTATE_VALUATION", label: "Real Estate Valuation" },
      { code: "TUTOR", label: "Tutor" },
      { code: "WEIGHTS_MEASURES", label: "Weights & Measures" },
      other("PROFESSIONAL_BUSINESS"),
    ],
  },
  {
    id: "SECURITY_FACILITY",
    name: "Security, Safety & Facility",
    persona: "BOTH",
    specialties: [
      { code: "ACCESS_CONTROL_BIOMETRIC", label: "Access Control & Biometric" },
      { code: "BOUNCER", label: "Bouncer" },
      { code: "CCTV_INSTALLATION", label: "CCTV Installation" },
      { code: "FACILITY_MAINTENANCE", label: "Facility Maintenance" },
      { code: "FIRE_SAFETY", label: "Fire Safety" },
      { code: "LOCKSMITH", label: "Locksmith" },
      { code: "PROPERTY_MANAGEMENT", label: "Property Management" },
      { code: "SECURITY", label: "Security" },
      other("SECURITY_FACILITY"),
    ],
  },
  {
    id: OTHER_SECTOR_ID,
    name: "Other",
    persona: "BOTH",
    specialties: [{ code: "OTHER_CUSTOM", label: "Other (describe below)", isOther: true }],
  },
];

export function isOtherSpecialty(code: string): boolean {
  return code === "OTHER_CUSTOM" || code.endsWith("_OTHER");
}

export function sectorForSpecialty(code: string): Sector | undefined {
  for (const s of SECTORS) {
    if (s.specialties.some((sp) => sp.code === code)) return s;
  }
  return SECTORS.find((s) => s.id === OTHER_SECTOR_ID);
}

export function labelForSpecialty(code: string): string {
  for (const s of SECTORS) {
    const hit = s.specialties.find((sp) => sp.code === code);
    if (hit) return hit.label;
  }
  return code
    .toLowerCase()
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function sanitizeSpecialtyCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/__+/g, "_")
    .slice(0, 60);
}

/** Stable listing-shelf slug for a specialty code (alias-aware, flat slugs). */
export function categorySlugForSpecialty(code: string): string {
  const canon = canonicalCode(code);
  if (canon === "OTHER_CUSTOM") return "other";
  if (canon.endsWith("_OTHER")) {
    const sectorId = canon.slice(0, -"_OTHER".length);
    const sector = SECTORS.find((s) => s.id === sectorId);
    const base = (sector?.name ?? sectorId)
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/'/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `${base || "other-services"}-other`;
  }
  const label = labelForSpecialty(canon);
  return label
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Validate a specialties array: dedupe via alias, enforce total + per-sector caps. */
export function validateSpecialties(input: string[]): { valid: string[]; errors: string[] } {
  const errors: string[] = [];
  const seen = new Set<string>();
  const perSector = new Map<string, number>();
  const valid: string[] = [];
  for (const raw of input) {
    if (typeof raw !== "string") continue;
    const code = sanitizeSpecialtyCode(raw);
    if (code.length < 2) continue;
    const canon = canonicalCode(code);
    if (seen.has(canon)) continue;
    // Sector-Other bucket codes never count toward caps (one per sector max).
    if (canon === "OTHER_CUSTOM" || canon.endsWith("_OTHER")) {
      seen.add(canon);
      valid.push(canon);
      continue;
    }
    const sector = sectorForSpecialty(canon);
    const sectorId = sector?.id ?? OTHER_SECTOR_ID;
    const count = perSector.get(sectorId) ?? 0;
    if (count >= MAX_SPECIALTIES_PER_SECTOR) {
      errors.push(`Too many specialties in ${sector?.name ?? "Other"} (max ${MAX_SPECIALTIES_PER_SECTOR})`);
      continue;
    }
    seen.add(canon);
    perSector.set(sectorId, count + 1);
    valid.push(canon);
    if (valid.length >= MAX_SPECIALTIES_TOTAL) {
      errors.push(`Too many specialties (max ${MAX_SPECIALTIES_TOTAL})`);
      break;
    }
  }
  return { valid, errors };
}
