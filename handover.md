# Handover — Session 1

## Goal
Separate monolithic Next.js into scalable Vercel frontends + Railway Express API with JWT auth (httpOnly cookies). Add user-facing features: Google OAuth, KYC verification, ProfileButton. Deploy and test end-to-end.

## Current State
- **Backend**: Express.js on Railway (`https://delightful-encouragement-production-878d.up.railway.app`)
- **Main site**: Next.js on Vercel (`https://allpropertylink-amber.vercel.app`) — production, just redeployed
- **Admin panel**: Next.js on Vercel (`https://admin-panel-eight-tawny.vercel.app`)
- **Theme**: Warm-beige/teal/gold design applied across entire codebase
- **Lint**: Clean (0 errors, warnings only: `<img>` tags on dynamic blob/Cloudinary URLs, unused `user` var in onboarding page)
- **Build**: Main site builds and deploys successfully
- **GitHub repos**: `All-Property-Link-01` (main site), `admin-panel`, `backend-api` (master branch)

## Active Files (changed this session)

### Main Site — `allpropertylink/`
| File | Status | Purpose |
|------|--------|---------|
| `app/dashboard/kyc/page.tsx` | **Rewritten** | KYC submission page with document crop flow, per-type aspect ratios, Cloudinary upload, submission history |
| `components/kyc/ImageCropper.tsx` | **New** | react-easy-crop wrapper with locked aspect ratios per document type, zoom control, modal UI |
| `components/kyc/ImageUploader.tsx` | **Deleted** | Replaced by inline upload + cropper flow |
| `components/layout/Navbar.tsx` | Modified | ProfileButton integration (prev session) |
| `components/layout/MobileMenu.tsx` | Modified | ProfileButton integration (prev session) |
| `components/layout/ProfileButton.tsx` | New | User dropdown (prev session) |
| `components/auth/GoogleSignInButton.tsx` | New | Google OAuth button (prev session) |
| `components/auth/RegisterForm.tsx` | Modified | Google OAuth button (prev session) |
| `components/auth/LoginForm.tsx` | Modified | Google OAuth button (prev session) |
| `app/sitemap.ts` | Modified | Added `revalidate=3600` and try-catch (prev session) |
| `package.json` | Modified | Added `react-easy-crop` dependency |
| `lib/api-client.ts` | Unchanged | API client with auto-refresh |
| `lib/auth-context.tsx` | Unchanged | Auth provider |

### Backend — `backend/`
| File | Status | Purpose |
|------|--------|---------|
| `src/routes/auth.ts` | Modified | Google OAuth endpoint added (prev session) |
| `src/config.ts` | Modified | Google OAuth env vars (prev session) |
| `src/routes/user.ts` | Unchanged | KYC endpoints (GET/POST /api/user/kyc) |
| `src/routes/upload.ts` | Unchanged | Cloudinary image upload |

## Changes Made This Session
1. **KYC page rewrite** — Clean, step-by-step form with document type selector, document number input, drag-and-drop image upload areas
2. **Document-aware cropping** — `ImageCropper` component using `react-easy-crop` with per-document aspect ratios:
   - National ID & Driver's License: 1.59:1 (ID-1 card size)
   - Passport: 1.42:1 (ID-3 page size)
3. **Upload flow** — User selects file → cropper modal opens with locked ratio → Apply Crop → cropped blob uploads to Cloudinary → cropped preview shown
4. **Removed unused component** — Deleted `ImageUploader.tsx` (replaced by inline cropper flow)
5. **Fixed lint warnings** — Removed unused `loading` state in KYC page, fixed unused `err` in `ImageCropper.tsx`
6. **Deployed to Vercel** — Main site built and deployed to production alias
7. **Cloudinary credentials applied everywhere** — Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` on:
   - **Railway** (backend — used by KYC, onboarding, and all `/api/upload` endpoints)
   - **Vercel production** (main site — used by server-side `lib/actions/upload.ts` for property listing images)
   - **Vercel preview** (main site — same as production, for preview deployments)
8. **Clean build** — Zero errors, only warnings for `<img>` tags (expected for dynamic URLs) and pre-existing unused `user` var in onboarding

## Cloudinary Usage — All Upload Types

| Upload Type | Component | Upload Path | Host |
|------------|-----------|-------------|------|
| KYC document images | `app/dashboard/kyc/page.tsx` → cropper → blob → `fetch("/api/upload")` | Backend route `src/routes/upload.ts` | **Railway** |
| Onboarding documents | `app/dashboard/onboarding/page.tsx` → `fetch("/api/upload")` | Backend route `src/routes/upload.ts` | **Railway** |
| Property listing images | `PropertyImageUploader.tsx` → `lib/actions/upload.ts` → `lib/cloudinary.ts` | Server action on Vercel Node.js runtime | **Vercel** |

## Failed Attempts
1. **Initial KYC page had multiple build errors** — `statusDisplay` undefined, `cn` not imported, extra Chinese characters in code (`授权`, `用`), malformed JSX. Fixed by rewriting entire file from scratch.
2. **File write tool created corrupt file** — Extra characters appeared in the file content (`授权`, `用`). Likely a transcription artifact. Fixed by rewriting the file.
3. **PowerShell `&&` chaining** — `bash` tool runs PowerShell 5.1 which doesn't support `&&`. Used `;` separator or `cmd /c` wrapper instead.
4. **Git push timeouts** — Initial pushes timed out at 120s. Increased timeout to 300s for subsequent pushes.

## Next Steps
1. **Google OAuth** — Add JavaScript origins in Google Cloud Console:
   - `https://allpropertylink-amber.vercel.app`
   - `http://localhost:3000` (for dev)
   - Admin panel domain not needed (Google removed from admin login)
2. **Resend domain verification** — Verify a domain (e.g. `allpropertylink.co.ke`) in Resend dashboard so OTP emails work for all users (currently only reach `allpropertylink1@gmail.com`)
3. **Railway auto-deploy** — Install Railway GitHub app on `allpropertylink1-ship-it/backend-api` so deploys trigger on push
4. **Test full flow** — Register new user → verify OTP → login → submit KYC documents → check admin panel review page
5. **Admin panel** — Verify builds clean and deploy if needed
6. **Sitemap Prisma error** — Fix applied (`revalidate` + try-catch) but should verify build output includes sitemap correctly
7. **Handle `<img>` warnings** — Could replace with `next/image` using a custom loader for Cloudinary URLs, but dynamic blob URLs can't use `next/image` without static dimensions
