import { generateReactHelpers } from "@uploadthing/react"

const UT_URL = process.env.NEXT_PUBLIC_API_URL || "https://delightful-encouragement-production-878d.up.railway.app"

export const { useUploadThing } = generateReactHelpers({
  url: `${UT_URL}/api/uploadthing`,
  fetch: (input, init) => fetch(input, { ...init, credentials: "include" }),
})
