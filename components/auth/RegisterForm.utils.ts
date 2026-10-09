export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

// Mirrors backend normalizeKenyanPhone: 9-digit core (7xx/1xx), 0-prefixed
// (07xx/01xx), or +254/254 forms → +254XXXXXXXXX. Null when invalid.
export function normalizeKenyanPhoneClient(input: string): string | null {
  const digits = (input || "").replace(/\D/g, "")
  if (!digits) return null
  const coreRe = /^[17]\d{8}$/
  let core: string | null = null
  if (coreRe.test(digits)) {
    core = digits
  } else if (digits.length === 10 && digits.startsWith("0") && coreRe.test(digits.slice(1))) {
    core = digits.slice(1)
  } else if (digits.length === 12 && digits.startsWith("254") && coreRe.test(digits.slice(3))) {
    core = digits.slice(3)
  }
  return core ? `+254${core}` : null
}

export function kenyanPhoneError(input: string): string | null {
  const digits = (input || "").replace(/\D/g, "")
  if (!digits) return "Phone number is required"
  if (!normalizeKenyanPhoneClient(input)) {
    return "Enter a valid Kenyan mobile number (e.g. 712345678 or 0112345678)"
  }
  return null
}

// Option A disposable-email quick-list (frontend mirror of the backend
// blocklist's most-abused domains). Full file lives server-side; this
// local copy exists only for instant pre-submit feedback. Suffix-match
// so subdomains (e.g. x.temp-mail.org) also match.
const DISPOSABLE_EMAIL_DOMAINS = [
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "10minutemail.com",
  "10minutemail.net",
  "mailinator.com",
  "guerrillamail.com",
  "yopmail.com",
  "trashmail.com",
  "throwawaymail.com",
  "fakemail.net",
  "sharklasers.com",
  "privaterelay.appleid.com",
  "relay.firefox.com",
  "mozmail.com",
  "duck.com",
]

export const DISPOSABLE_EMAIL_MESSAGE =
  "Please use a permanent email address. Temporary inboxes are not allowed."

export function isDisposableEmailClient(input: string): boolean {
  const email = (input || "").trim().toLowerCase()
  const at = email.lastIndexOf("@")
  if (at < 0) return false
  const domain = email.slice(at + 1)
  if (!domain) return false
  return DISPOSABLE_EMAIL_DOMAINS.some(
    (blocked) => domain === blocked || domain.endsWith(`.${blocked}`)
  )
}
