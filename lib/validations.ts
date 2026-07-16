import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
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
  latitude: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().optional()
  ),
  longitude: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().optional()
  ),
  listingPurpose: z.enum(["FOR_SALE", "FOR_RENT_LONG_TERM", "FOR_RENT_SHORT_TERM"]).optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;