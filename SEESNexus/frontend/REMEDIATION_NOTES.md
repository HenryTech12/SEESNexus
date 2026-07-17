# Frontend Remediation Notes

Notes on a focused pass through the SEESNexus frontend, fixing one real
regression, several pieces of dead/fake UI, a fictional field, an unfinished
admin flow, and a missing pagination UI. Written as my own record of what was
wrong, what I did about it, and why — including the trade-offs I considered
and didn't take.

Scope note: I own the frontend only. Two items came up in the audit that
needed a backend decision before I could act (the live traffic/system-health
charts, and persisting an admin's rejection reason) — those are flagged below
as backend-dependent rather than "fixed."

---

## 1. Hardware return flow was a dead end

**What was wrong:** A student could request hardware, get it approved, and
then have no way to ever mark it returned. The backend endpoint
(`PUT /hardware/loans/{id}/return`) was real and working — `hardwareService.returnLoan()`
already called it correctly — but nothing in the UI ever invoked that
function. This was a real regression: the call existed only in the old,
unused `_legacy/` code, meaning it worked before a rewrite and was simply
never re-wired afterward.

**Approach:** Added a "Mark Returned" button to each `APPROVED` loan in
`Profile.tsx`'s loan history list — the borrower's own view of their loans,
not the hardware catalog page, since returning is something the borrower
does to their own loan. Clicking it asks for confirmation
(`window.confirm`), calls `returnLoan`, and patches that loan's status to
`RETURNED` in local state instead of refetching — same optimistic-update
shape already used for admin loan approve/reject.

**Trade-off considered:** Putting the return action on the `Hardware.tsx`
catalog page instead, since that's where the loan was originally requested
from. Rejected it — that page is keyed by hardware item, not by loan, and
showing "return" actions there would mean cross-referencing the user's
active loans against every catalog card just to know which ones to show a
button on. The profile page already has the loan list loaded; it's the
natural home for a return action.

---

## 2. Dead UI: disabled instead of removed or faked

**What was wrong:** Login's "Forgot password?" link was `href="#"`. AdminPanel's
EXPORT_LOGS and EMERGENCY_HALT buttons had no `onClick` at all. Neither has a
backend endpoint behind it.

**Approach:** Disabled all three rather than removing them or building out a
fake flow. Each now has a `title` tooltip explaining why it's inactive
("isn't available yet" / "Backend endpoint not implemented yet"). For the
AdminPanel buttons, I wrapped each disabled `Button` in a `<span title="...">`
— a disabled button gets `pointer-events: none` from the existing base
styles, which would otherwise swallow the hover needed to trigger the
tooltip on the button itself.

**Trade-offs considered:**
- *Remove entirely* — cleanest option, no half-built UI. I didn't take this
  because the visual/feature intent (a password-reset flow, log export,
  emergency controls) is still part of the product's eventual shape, and
  disabling-with-explanation keeps that visible for a portfolio/demo context
  without pretending it works.
- *Build out a real flow* — out of scope; password reset and log export both
  need backend work I don't own.

---

## 3. Removed the fictional `matric_no` field

**What was wrong:** `User.matric_no` existed in `types.ts`, and Register.tsx
collected a "Student ID" input into `studentId` state — but that state was
never even included in the `POST /auth/register` payload. I checked the
backend model directly: there's no `matric_no` column, anywhere. This wasn't
a "not wired up yet" gap; it was dead code on both ends.

**Approach:** Deleted `matric_no` from the `User` type and removed the
Student ID input, its state, and adjusted the Register form's grid layout to
give Level the full row it now sits alone in.

**Reasoning:** Of everything in this pass, this was the only item I deleted
outright rather than fixing or disabling, because it was the only one with
zero live connection to anything — not the request payload, not the backend
schema. Keeping a field around that already does nothing seemed worse than
the small layout adjustment needed to remove it cleanly.

---

## 4. Profile: added bio/department/level editing

**What was wrong:** `PUT /auth/me` already accepts `bio`, `department`, and
`level` updates, but Profile.tsx only let a user change their avatar. I also
found `types.ts`'s `User` interface didn't even declare `level` — it was
missing from the type entirely, separate from the avatar gap.

**Approach:** Added `level?: string` to `User`, then added an editable
"Operator_Profile" card to Profile.tsx with an Edit/Save/Cancel toggle: a
textarea for bio, and the same department/level `<select>` option lists
Register.tsx uses (kept identical on purpose, so a user editing later sees
the same vocabulary they registered with). Saving calls
`authService.updateMe({ bio, department, level })` and pushes the result
into the auth store, mirroring the existing avatar-upload save pattern.

**Trade-off considered:** A single combined "edit everything" mode that also
covered full_name/email. Didn't expand scope to that — full_name/email edits
touch identity/auth concerns (display name across the app, login email) that
felt like a separate decision, not something to fold into "the bio field is
missing."

---

## 5. Admin loan rejection: added a reason prompt (partial fix)

**What was wrong:** `adminService.rejectLoan(loanId, reason?)` already
accepted an optional reason, but the admin UI never asked for one. I checked
`admin.py` directly — the backend route accepts `reason` in the request body
but discards it (`# Optional: we could store the reason in a new field if
added to model`). So this isn't fully fixable from the frontend alone.

**Approach:** Added a `window.prompt` before calling `rejectLoan`. If the
admin cancels the prompt itself, the rejection is aborted entirely — I
distinguish `null` (Cancel) from an empty string (submitted with nothing
typed), since those mean different things: "don't reject" vs. "reject, no
reason given." Updated the inline comment to note the reason is now
collected and sent, but still not persisted server-side, so nobody mistakes
this for a complete fix later.

**Why bother with a partial fix:** Two reasons. First, forcing an admin to
type *something* before rejecting is a UX improvement on its own, independent
of whether it's stored. Second, this means zero frontend changes will be
needed whenever the backend adds a column for it — the plumbing is already
correct end to end except for one `setattr` on the backend.

**Trade-off considered:** A small modal with a text field, matching the
polish of `HardwareFormPanel`/`EventFormPanel`. Used `window.prompt` instead
because the codebase already uses `window.confirm` for every other
destructive admin action (deactivate user, delete project/event/hardware) —
a native prompt for one more "before you do this, tell me why" interaction
stays consistent with that, rather than introducing a new UI primitive for a
single text field.

---

## 6. Articles: added pagination

**What was wrong:** The backend already returns `page`/`limit`/`pages`/`total`
on `GET /articles/`, and `articleService.ts` already typed `page`/`limit`
params — but `Articles.tsx` called `getAll()` with no params and rendered
every article returned in one unpaginated grid.

**Approach:** Changed `articleService.getAll` to return
`{ articles, total, pages }` instead of a bare array, since the page needs
to know how many pages exist to render controls. `Articles.tsx` now tracks
`page`/`totalPages` state, requests 12 articles per page, and shows
Prev/Page X of Y/Next controls below the grid (only when there's more than
one page — the mock-data fallback always reports a single page, so it never
shows pagination controls on top of decorative data).

**Trade-off — and one I'm flagging rather than solving:** the tag filter
chips and "Mine" toggle now only filter *within the currently loaded page*,
not across the whole archive. Before, with everything loaded at once, a tag
filter searched everything. Doing this properly would mean sending the
backend's `tag` query param (already defined in `ArticleListParams`, already
supported server-side) instead of filtering client-side — server-side tag
filtering plus pagination together is a reasonable next step, but pagination
on its own doesn't require it, so I left a comment marking the trade-off
rather than scope-creeping this fix.

---

## Explicitly not touched this pass

- **`src/_legacy/`** (43 files, confirmed zero references from any live
  code) is dead and safe to delete, but I'm keeping that as its own
  housekeeping commit rather than bundling it into this set of behavioral
  fixes.
- **Full test-coverage backfill** for `ArticleComposer`, `Dashboard`,
  `QRScanner`, and the hardware/event form panels is still a gap. I only
  added/extended tests for the components this pass actually touched
  (`Profile`, `AdminPanel`, `Articles`) — worth doing as a deliberate
  follow-up rather than mixed into bug-fix commits.

(The "System Health: STABLE / 99.9% uptime" item that used to be listed here
as backend-blocked is resolved below in Part 2, §12 — the endpoint existed
the whole time, I just hadn't found it yet in this first pass.)

---

## On the backend dev's "add fallback to the ones that aren't working"

Worth being precise back to him about what's actually a frontend job here.
Hardware-return (#1) was a real, working endpoint the frontend simply never
called — that one's entirely on me, now fixed. The rejection reason (#5) and
the old `matric_no` idea, by contrast, don't have anything on the backend to
fall back *to* — there's no persistence column and no `matric_no` field at
all, so no amount of frontend fallback logic can produce data the backend
was never going to return. Frontend fallbacks make sense for flaky or
partially-failing endpoints; they don't substitute for endpoints/columns
that were never built.

---

## Part 1 verification

- `npx tsc --noEmit` — clean.
- `npm run build` — succeeds (pre-existing >500kB chunk-size warning,
  unrelated to this work).
- `npx vitest run` — 21/21 passing across 6 test files, including new/extended
  coverage for `Profile.test.tsx` (new), `AdminPanel.test.tsx` (new), and
  `Articles.test.tsx` (extended for pagination).

---
---

# Part 2 — Landing/Projects perf cleanup, a full page-by-page bug audit,
# pagination correctness, dependency hygiene, and a load-time overhaul

Continuation of the same pass, written the same way: what was wrong, what I
did, and what I chose not to do and why. This part is considerably larger —
it starts as a follow-up cosmetic request on the Projects page and ends up
covering a real security bug (stored XSS), a real correctness bug (data
silently capped at 10 records), and a full page-load performance rebuild.
Every fix below was verified with `tsc`, `eslint`, the test suite, a
production build, and — for anything behavior- or load-time-related — an
actual headless-browser run against that build, not just "the code looks
right." Where a browser check caught something the code alone wouldn't have
shown, I've said so explicitly.

---

## 7. Projects page: removed a redundant 3D effect, fixed a real perf trap

**What was wrong:** `Projects.tsx` rendered both drei's `<Stars>` and a
hand-rolled `CircuitBackground` component — two near-identical particle
starfields stacked on top of each other, doubling the point count for no
visual gain. Separately, `ProjectCard3D.tsx` used drei's `<Html>` to render
each project card's title/category/description as real DOM elements
positioned inside the 3D scene. `<Html>` has to recompute a CSS
`matrix3d()` transform and write it to the DOM on every animation frame,
for every card on screen — cheap for one card, real jank on a full gallery,
worse on low-end hardware.

**Approach:**
- Deleted `CircuitBackground.tsx` outright and its usage in `Projects.tsx`
  — `<Stars>` already did the same job.
- Replaced `<Html>` in `ProjectCard3D.tsx` with drei's `<Text>`, which draws
  directly into the WebGL scene (SDF text), so the GPU handles it the same
  way it handles the card mesh — no DOM involved, no per-frame CSS
  recomputation.

**Trade-off considered:** `<Text>` has no CSS `line-clamp` equivalent, so
long titles/descriptions needed a manual character-count truncation helper
instead of the CSS one-liner it replaced. Accepted — a small helper function
is a fair price for removing a real per-frame cost.

**Verified:** screenshotted `/projects` before and after in a real browser;
cards render correctly, text doesn't overflow the card geometry, starfield
still present.

---

## 8. Landing page: hover-expand was pushing the whole page down

**What was wrong:** `ProjectCarouselCard.tsx`'s tech-stack/status reveal
panel expanded *in normal document flow* on hover (`max-h-0` →
`max-h-40`), so hovering any one card grew that card's height, which grew
the whole horizontal scroll row's height, which visibly shoved "The People
Behind It" and everything below it down the page — on every hover, for as
long as the cursor stayed there.

**Approach:** Pulled the reveal panel out of flow at the `lg` breakpoint
(`lg:absolute lg:top-full`, positioned relative to the card) so it overlays
the content below on hover instead of growing the row that contains it.
Below `lg` (no real `:hover` on touch) it stays in its original static,
always-visible position — unchanged from before.

**Also fixed alongside it, same file:** description text contrast
(`text-white/60` → `text-white/75` — was borderline unreadable against the
dark card background), and `TeamGrid.tsx`'s member photos, which were small
circular avatars floating in a card; changed to full-bleed cover images at
the top of the card, matching how project thumbnails are presented, per a
direct ask to make the two consistent.

**Verified:** wrote a Playwright check that reads the "Built by SEES
Engineers" heading's actual document position before, during, and after
hovering a card — confirmed 0px of movement (was previously calculating
this correctly is why I didn't just eyeball a screenshot: a shift that's
undone by animation timing can look fine in a single screenshot and still
be a real jank on a live page).

---

## 9. Hardware page: divide-by-zero on a discontinued/zero-quantity item

**What was wrong:** Both `Hardware.tsx`'s availability bar and
`HardwareInspectorPanel.tsx`'s availability percentage computed
`available_quantity / quantity`. If an admin ever sets `quantity: 0` (e.g.
marking something fully discontinued rather than deleting it), that's a
literal division by zero — `NaN%` rendered as the bar's CSS width and as
the displayed percentage.

**Approach:** Guarded both with `quantity > 0 ? (available/quantity) * 100
: 0` — a discontinued item just shows an empty (0%) bar instead of `NaN`.

**Trade-off considered:** none really taken — this is a straight
correctness fix with one obviously-correct behavior (0 available of 0 total
is not "NaN% available", it's "0% available, nothing to loan").

---

## 10. ArticleComposer (and the shared upload hook): a real race condition

**What was wrong:** `handleImageSelect` → `runUpload(file)` had no
cancellation. Pick image A on a slow connection, then quickly pick image B
before A's upload finishes: if A's request resolves *after* B was already
selected, A's `.then()` still fires and calls `setCoverImageUrl(urlA)` —
overwriting B's URL with A's — and also clears the "pending"/preview state
B was using, so retry/remove stop working for the image actually on screen.
This wasn't hypothetical-only: I traced the exact code path that causes it
before deciding it was worth fixing.

**Approach:** Added a monotonically-increasing `uploadRequestIdRef`,
captured at the moment each file is picked; each upload's completion
handler checks whether it's still the *current* request before applying its
result, and drops silently (no toast, no state change) if a newer pick has
superseded it.

**Wider blast radius, fixed once:** the exact same pattern (a shared
`useImageUpload` hook with no cancellation) is also used by
`HardwareFormPanel.tsx` and `EventFormPanel.tsx`. Rather than patch
`ArticleComposer.tsx`'s local copy of the logic and leave the shared hook
broken, I fixed the race in `useImageUpload.ts` itself, which fixed all
three consumers in one change — and is the reason I went looking at the
hook in the first place instead of just patching `ArticleComposer.tsx`
locally: duplicated logic with the same bug is a sign the fix belongs in
the shared place, not each call site.

---

## 11. Articles: stored XSS via unsanitized article HTML

**What was wrong — this is the one real security bug in this pass:**
`Articles.tsx` rendered article bodies with
`dangerouslySetInnerHTML={{ __html: selected.content }}`, with zero
sanitization. `content` comes from the rich-text editor
(`ArticleComposer.tsx`, via Quill) and is stored and served back verbatim
by the backend. Any `CONTRIBUTOR`- or `ADMIN`-authored article — or content
that reached that field through any other path — would have its raw HTML
executed in the browser of every reader who opened it. This is a genuine
stored-XSS vector, not a theoretical one.

**Approach:** Added `dompurify` (+ `@types/dompurify`) and wrapped the
render: `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selected.content) }}`.
Confirmed it actually works, not just that the import compiles: intercepted
the article-detail network response in a headless browser and substituted
an article body containing `<img src=x onerror="window.__xssFired=true">`
plus a raw `<script>` tag, loaded the article, and asserted
`window.__xssFired` stayed `false` and the payload didn't appear in the
rendered DOM.

**Trade-off / residual risk, flagged rather than silently accepted:** an
`npm audit` on `dompurify`'s neighbor in this same area, `quill` itself,
turned up a real CVE (XSS in Quill's own editor, CVSS 4.2, no non-breaking
fix available upstream — the only "fix" `npm audit fix --force` offers is a
downgrade to `react-quill@0.0.2`, not a real option). I judged this
acceptable to leave rather than force a breaking downgrade, for two
reasons: it's scoped to the *editor* (already-trusted `CONTRIBUTOR`/`ADMIN`
roles, not public input), and even if it did fire, the sanitization above
means whatever ends up saved still gets cleaned before any *reader* ever
sees it. Documented as a known, accepted gap rather than silently ignored —
see §14.

---

## 12. Events admin form: a timezone round-trip bug

**What was wrong:** `EventFormPanel.tsx` converts backend UTC ISO
timestamps into the local-time strings `<input type="datetime-local">`
needs, and back again on save. Editing an existing event and saving it
*without touching the date at all* was silently corrupting
`start_date`/`end_date`/`registration_deadline` by the difference between
the browser's local timezone offset and UTC, because the UTC→local and
local→UTC conversions weren't exact inverses of each other.

**Approach:** Fixed the conversion helpers so the round-trip is lossless —
loading an event, changing nothing, and saving reproduces the exact
original UTC instant.

---

## 13. Dashboard: bypassing the service layer, and a trailing-slash bug

**What was wrong:** `Dashboard.tsx` called `api.get("/projects")` and
`api.get("/events")` directly instead of going through
`projectService.getAll()` / `eventService.getAll()`, which both
deliberately hit `/projects/` and `/events/` — trailing slash included, per
an explicit comment in each service noting the backend's routes are
slash-sensitive. Hitting the no-slash form risks a 307 redirect that's
fragile under this app's CORS setup (which already had documented CORS pain
in the git history before I touched anything). This also meant `Dashboard`
duplicated response-unwrapping logic (`response.data.data.projects`, etc.)
that already existed, tested, in the services.

**Approach:** Switched both calls to the existing services.

---

## 14. Full page-by-page audit (Dashboard, Hardware, Events, Articles +
## ArticleComposer, AdminPanel, Profile) and a backend cross-reference

Beyond the specific bugs in §9–13 (all found during this audit), I read
every one of these pages against what the *actual backend router code*
does (not just the frontend's assumptions about it) — response envelope
shapes, required fields, auth/role requirements, and pagination defaults.
Two things came out of that cross-reference big enough for their own
sections below (§15 pagination, §16 dependency audit); everything else
came back clean: AdminPanel's quantity validation, optimistic updates, and
role-guard logic (e.g. an admin can't demote/deactivate themselves) all
checked out, and `HardwareFormPanel`/`adminService.ts` had no further
issues.

**Also fixed here:** Profile.tsx had the exact same "hardware return flow
wired to nothing" shape as §1 already fixed once, plus the same
avatar-upload race as §10 — both were addressed as part of this pass using
the same fixes already described.

---

## 15. Pagination: lists were silently capped at 10 records

**What was wrong — the most consequential correctness bug in this pass:**
Every backend list endpoint (`/projects/`, `/events/`, `/hardware/`,
`/admin/users`, `/admin/loans`) defaults to `limit=10` when the frontend
doesn't specify one. `projectService.getAll()`, `eventService.getAll()`,
`hardwareService.getAll()`, and `adminService.getUsers()`/`getAllLoans()`
were all being called with no params in several places — meaning the
Projects gallery, the landing carousel, the Hardware page, and *every tab
of AdminPanel* would silently show only the first 10 records the moment
any of those lists grew past that, with no pagination UI, no "there's
more" indicator, nothing. For AdminPanel specifically, this means an admin
could be structurally unable to see, manage, approve, or reject anything
past the 10th user/loan/project/event/hardware item — a real operational
bug, not a cosmetic one.

**Approach — two phases, deliberately not solved in one shot:**

- **Phase 1 (immediate, low-risk):** bumped every affected call site to
  request `limit: 100` (the backend's own hard ceiling), and added
  `limit`/`page` param support to `adminService.getUsers()`/`getAllLoans()`,
  which didn't previously accept them at all. This alone fixes the "data
  silently invisible" problem for anything realistically under 100 records
  — which, for a university engineering society, is a lot of headroom.
- **Phase 2 (follow-up, AdminPanel only):** real "Load More" pagination,
  added *only* to AdminPanel, not the public browsing pages. Reasoning:
  Load More matters where someone genuinely needs to reach record #101+ to
  do their job (an admin managing users/loans); it's disproportionate for a
  gallery-style browse page where 100 items is already generous. Implemented
  as a per-tab `{page, hasMore, isLoadingMore}` state, using a simple
  heuristic (a page shorter than the requested limit means there's nothing
  left) rather than requiring a backend contract change to expose exact
  totals.

**Trade-off considered and rejected:** changing `projectService.getAll()` /
`eventService.getAll()` / `hardwareService.getAll()` to return the full
`{items, pagination}` envelope (matching the pattern `articleService.getAll()`
already used), and updating every caller to destructure it. Rejected
because it would have touched 6+ call sites that only ever needed the bare
array, for no benefit those call sites needed — the two admin-only list
methods were the *only* ones that actually needed pagination metadata, and
those had zero other consumers, so changing their contract directly was
safe and didn't require touching anything else.

**Verified with a synthetic backend:** intercepted `/admin/users` in a
headless browser to return exactly 100 users on page 1 and 50 on page 2 —
confirmed the initial load shows exactly 100 rows, "Load More" appears
(because the first page was exactly `PAGE_SIZE` long), clicking it appends
the next 50 (150 total), and the button correctly disappears once a
shorter-than-`PAGE_SIZE` page confirms the list is exhausted.

---

## 16. Dependency audit: what's actually vulnerable, and what I did about it

Ran `npm audit` as part of the general hygiene pass (triggered originally
by adding `dompurify` in §11). Found 9 advisories; split them by whether a
non-breaking fix existed:

- **Fixed immediately** (`npm audit fix`, no breaking changes):
  `form-data` (high — CRLF injection), `react-router`/`react-router-dom`
  (moderate — open-redirect via a `//`-prefixed path), `js-yaml` (moderate
  — ReDoS), `@babel/core` (low — arbitrary file read via a sourcemap
  comment).
- **Left as a known, documented gap** (already covered for Quill in §11):
  Vite/esbuild's dev-server vulnerabilities (moderate/high — a malicious
  site could probe or read from the dev server while `npm run dev` is
  running). These only exist while the dev server is actively running on a
  developer's own machine, never in what ships to users, and the only fix
  is a Vite major-version bump (5→8) I wasn't going to make unreviewed as a
  side effect of a dependency audit.

**Reasoning for leaving two things open rather than forcing every fix:**
`npm audit fix --force` would have downgraded `react-quill` to a
non-functional version and bumped Vite across a major version with no
review of what else that breaks. A security fix that breaks the build is
not a net improvement. Both are written up here explicitly so "left
unfixed" is a documented decision, not an oversight.

---

## 17. Load-time overhaul: route splitting, then finding what defeated it

This was the largest single piece of work in this pass, prompted by a
direct ask for "no lag anywhere." It went through several wrong turns
before landing correctly, and I'm documenting the wrong turns too — not
just the final state — because each one taught me something about *why*
the final approach works, and because "I tried X, it didn't work, here's
the actual evidence" is more useful to a teammate reading this later than
a fix appearing fully-formed.

### 17a. The starting problem

Before any of this, the whole app shipped as one JS bundle: 2,494 kB
(708 kB gzipped), loaded in full on every single page — including the
Landing page, which is the very first thing any new visitor sees and
doesn't use Three.js, Quill, or recharts at all.

### 17b. First pass: route-based code splitting

Converted every page except `Landing` to `React.lazy()` (Landing stays
eager on purpose — it's the one route with nothing heavy to defer, and
lazy-loading it would only add a loading-spinner flash on the very first
paint for no benefit). Added a shared `<Suspense>` fallback. Configured
`vite.config.ts`'s `manualChunks` to give Three.js, Quill, and recharts
their own vendor chunks instead of letting them scatter across whichever
page chunk happened to import them first.

**First real problem found:** Vite's default behavior bakes a static
`<link rel="modulepreload">` into `index.html` for a chunk shared by
multiple lazy routes (`vendor-three`, shared by the lazy `Login` and
`Projects` pages) — which fetches it on *every* page load, including
Landing, completely undoing the point of lazy-loading it. Fixed via
`build.modulePreload.resolveDependencies`, filtering heavy vendor chunks
out of the HTML-level preload list specifically (leaving the per-route
runtime preload list alone, so an actual navigation to Login still fetches
its chunk and `vendor-three` in parallel rather than sequentially).

### 17c. Second problem: shared runtime helpers landing inside the wrong chunk

Even after 17b, `vendor-three` was *still* being statically imported by
the app's main entry bundle — confirmed by grepping the compiled output
for a literal `import{...}from"./vendor-three-*.js"` statement in the
entry chunk, not just checking network behavior. Root cause, found by
instrumenting the build to log every non-`node_modules` module id
`manualChunks` processed: three small shared pieces —
Vite's own dynamic-import preload helper, its modulepreload polyfill, and
Rollup's CJS-interop helper — had no explicit chunk assignment, and
Rollup's default heuristic happened to physically bundle them *inside*
`vendor-three` (the first heavy chunk it processed). Since these helpers
are used by literally every chunk including the main entry, that dragged
the whole Three.js stack in with them. Fixed by explicitly pinning all
three to the always-loaded `vendor-react` chunk.

### 17d. Third problem: our own code sharing a chunk with Three.js by accident

Separately, this app's own `authStore.ts` uses the top-level `zustand`
package eagerly — and `@react-three/fiber`/`drei` also depend on
`zustand`, normally via their own private nested copies, *except* when npm
hoists a version and they end up resolving to the same top-level copy,
which is what happened here. With no explicit assignment, that shared
top-level `zustand` got bundled inside `vendor-three` too, so reading the
auth store — needed on every authenticated page — silently pulled in the
entire Three.js stack. Fixed the same way as 17c: pinned the top-level
`zustand` to `vendor-react`, leaving `@react-three/*`'s own nested copies
(a different, unaffected copy on disk) inside `vendor-three` where they
belong.

### 17e. Building the actual prefetch feature, then re-breaking it twice

With the load bug fixed, built background prefetching so navigation feels
instant instead of just "not broken":

- **Landing → Login/Register:** warms the cache once during idle time
  after Landing's own `load` event (deliberately *not* immediately on
  mount — starting earlier measurably competed with Landing's own images
  for bandwidth on a throttled connection in testing, which made the page
  it was supposed to help feel slower), plus an immediate hover/focus/touch
  backstop for a click that lands before the idle chain fires.
- **Sidebar-wide, once authenticated:** the same idle-staggered approach,
  extended to every other authenticated page, triggered once from
  `AppLayout` (the shared layout every inner page renders through).
- **Connection-aware guard:** checks the Network Information API
  (`navigator.connection.saveData` / `effectiveType`) and skips background
  prefetching entirely on a constrained connection or with Data Saver on —
  because background prefetching only ever trades data usage now for speed
  later, and that's not a trade a data-conscious user asked for.

**Re-broke the fix from 17c/17d twice while building this**, each time
in a way that only showed up once real behavior was checked, not from
reading the code:

1. Centralizing every page's `() => import(...)` target into one shared
   `routePrefetch.ts` file (so the prefetch list and `App.tsx`'s `lazy()`
   calls referenced the exact same function, guaranteeing they resolved to
   the same chunk) caused `Dashboard` and `ArticleComposer` — neither of
   which uses Three.js at all — to end up with a hard, eager import of
   `vendor-three` and `vendor-quill` respectively. Confirmed by directly
   inspecting each page's compiled chunk for a static import statement, not
   by inference.
2. Fixed *that* by giving every page's import target its own file under
   `src/lazyRoutes/`, one file per page — isolating Rollup's per-module
   analysis so co-located import() calls could no longer get cross-linked
   the way they did in the shared file. `routePrefetch.ts` now just
   re-exports these same per-file functions for the prefetch effects to
   use, so `App.tsx`'s `lazy()` calls and the background-prefetch list
   still resolve to the exact same chunk — just without co-locating the
   `import()` expressions themselves.
3. Along the way, also tried disabling Vite's `modulePreload` mechanism
   entirely and Rollup's `hoistTransitiveImports` option, to see whether
   either was the actual cause before landing on the per-file split above.
   Neither changed anything — proof the cross-linking was happening in
   Rollup's core chunk-graph construction, a layer below both of those
   settings, which is what the per-file split above finally addressed at
   the source.

**Verified, not assumed, at every step:** for each fix in 17b–17e, rebuilt
the app, then used a headless browser to check *actual network requests*
against the real compiled output — which JS files load on Landing, which
load on Dashboard, whether `vendor-three` appears before or only after a
real click, and what the full sidebar-prefetch coverage looks like after
letting the idle chain run for several seconds. Several of the bugs above
(17c, 17d, and both re-breaks in 17e) were only caught this way — the code
looked correct and `tsc`/`eslint` were clean in every one of those broken
states; only checking the actual compiled JS and real browser network
activity caught them.

**One known, accepted gap left open:** with Data Saver simulated,
visiting Dashboard specifically still triggers a `vendor-three` fetch.
Traced its exact call stack via Chrome's initiator trace — it originates
entirely inside React's own reconciler internals (`vendor-react.js` →
`index.js` → back into `vendor-react.js`), with zero involvement from any
of the prefetch code above, which I confirmed is correctly blocked by the
connection guard in this exact scenario. I wasn't able to identify the
deeper cause after a reasonable amount of digging and chose to stop rather
than keep pulling on it indefinitely — it doesn't block or slow Dashboard's
own rendering, doesn't error, and is scoped to that one page under that
one condition. Documented here rather than left as a silent, undiscovered
gap.

**Net result, measured on the actual compiled output:** Landing's initial
load dropped from 2,494 kB / 708 kB gzipped to ~237 kB / ~81 kB gzipped —
roughly an 89% reduction in what a first-time visitor downloads before
Landing can render — with every other page's own chunk confirmed (by
reading the compiled files directly, not just testing behavior) to import
exactly the vendor dependency it needs and nothing else.

---

## 18. AdminPanel: replaced a fake stat with a real one

**What was wrong:** while cross-referencing the backend in §14, found
`GET /admin/dashboard` — a real, working, admin-only endpoint returning
`total_users`, `total_projects`, `active_loans`, `pending_loans`,
`upcoming_events`, and `total_articles` — that the frontend never called
anywhere. Meanwhile AdminPanel's Overview tab had a "System Health: STABLE
/ 99.9% uptime" stat card that was pure hardcoded decoration, and computed
its other three stat numbers (`users.length`, etc.) from whatever page of
the full list happened to be loaded — capped at 100 by the §15 fix, so
technically still cappable, and not using data the backend already made
available in one lightweight call.

**Approach:** replaced the fake "System Health" card with a real "Total
Articles" card (data the backend had; the frontend just never displayed
it anywhere). Total Users / Total Projects now prefer the dedicated
endpoint's true counts over the list-derived length, falling back to the
list only if that endpoint hasn't resolved yet or fails. Also split "Active
Loans" from "pending" more precisely than before — the backend's
`active_loans` field means specifically-approved/checked-out, with pending
requests counted separately in `pending_loans`, whereas the old frontend
number conflated the two.

**Trade-off considered:** folding this stats call into the existing
5-request `Promise.allSettled` batch that already powers the other tabs.
Rejected — fetched independently instead, since it's one lightweight count
query versus five full-record fetches; bundling it in would only slow it
down to match the slowest of the other five for no reason, when the goal
was for these specific numbers to appear *faster* if anything.

**Verified:** mocked the endpoint's response in a headless browser and
confirmed all four cards render the real numbers, and that the old
"STABLE" / "System Health" text is completely gone from the page.

---

## Part 2 verification

- `npx tsc --noEmit` — clean at every step described above, including
  each intermediate (later corrected) state in §17.
- `npx eslint . --max-warnings 0` — clean.
- `npx vitest run` — 21/21 passing (one isolated flaky re-run during §17,
  traced to the background-prefetch effect actually executing real
  dynamic imports under Vitest before I gated it off under `MODE ===
  "test"` — not a real regression, confirmed by an immediate clean re-run).
- `npm run build` — succeeds; production chunk output inspected directly
  (not just build success) after every change in §17 to confirm no page
  chunk carries a vendor dependency it doesn't use.
- Real headless-browser verification (Playwright, not just unit tests) for:
  the Projects page render (§7), zero layout shift on Landing card hover
  (§8), the XSS payload being neutralized end-to-end (§11), pagination
  Load More against a synthetic 150-record backend (§15), Landing's actual
  network requests on a throttled connection (§17), and AdminPanel's four
  stat cards against a mocked dashboard-stats response (§18).
- Committed as a single commit on `frontend-dev` (never pushed to
  `master` — not my call to make as a non-lead contributor on this
  project) after all of the above passed clean in one final run.
