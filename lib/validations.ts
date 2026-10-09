import { z } from "zod";

export const propertyUnitSchema = z.object({
  configuration: z.string().min(1, "Configuration is required"),
  label: z.string().optional(),
  floor: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().int().min(0).optional()
  ),
  bedrooms: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().int().min(0).optional()
  ),
  bathrooms: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().int().min(0).optional()
  ),
  area: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().int().min(0).optional()
  ),
  areaUnit: z.enum(["SQFT", "SQM"]).optional(),
  price: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().positive("Unit price must be positive").optional()
  ).nullable(),
  pricePeriod: z.enum(["TOTAL", "PER_MONTH", "PER_NIGHT", "PER_WEEK", "PER_SQM"]).optional(),
  listingPurpose: z.enum(["FOR_SALE", "FOR_RENT_LONG_TERM", "FOR_RENT_SHORT_TERM"]).optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).max(10).optional(),
  totalUnits: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().int().min(1).optional()
  ),
  availableUnits: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().int().min(0).optional()
  ),
  status: z.enum(["AVAILABLE", "SOLD", "RENTED"]).optional(),
});

export type PropertyUnitInput = z.infer<typeof propertyUnitSchema>;

export const propertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().positive("Price must be positive").optional()
  ).nullable(),
  currency: z.string().default("KES"),
  propertyType: z.enum(["APARTMENT", "HOUSE", "LAND", "COMMERCIAL"]),
  status: z.enum(["AVAILABLE", "SOLD", "RENTED"]).default("AVAILABLE"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  region: z.string().min(1, "Region is required"),
  country: z.string().default("Kenya"),
  bedrooms: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().int().optional()
  ),
  bathrooms: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().int().optional()
  ),
  area: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().int().optional()
  ),
  plotSize: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().positive("Plot size must be positive").optional()
  ).nullable(),
  plotSizeUnit: z.enum(["SQFT", "SQM", "ACRE", "HECTARE"]).optional(),
  latitude: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().optional()
  ),
  longitude: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().optional()
  ),
  listingPurpose: z.enum(["FOR_SALE", "FOR_RENT_LONG_TERM", "FOR_RENT_SHORT_TERM"]).optional(),
  subType: z.string().optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  coverImage: z.string().min(1, "Cover photo is required").optional().nullable(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  hasMultipleUnits: z.boolean().optional(),
  unitMixDescription: z.string().optional(),
  units: z.array(propertyUnitSchema).max(20).optional(),
}).superRefine((data, ctx) => {
  if (data.coverImage && data.images && data.images.length > 0 && !data.images.includes(data.coverImage)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cover photo must be one of the images", path: ["coverImage"] });
  }
  if (data.units !== undefined) {
    data.units.forEach((u, i) => {
      if (u.availableUnits !== undefined && u.totalUnits !== undefined && u.availableUnits > u.totalUnits) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Available units cannot exceed total units", path: ["units", i, "availableUnits"] });
      }
    });
    if (data.hasMultipleUnits === true && data.units.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Add at least one unit configuration when multiple units is enabled", path: ["units"] });
    }
  } else if (data.hasMultipleUnits === true) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Add at least one unit configuration when multiple units is enabled", path: ["units"] });
  }
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;