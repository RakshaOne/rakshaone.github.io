# RakshaOne

RakshaOne is a solo-first personal safety learning app. It teaches awareness, boundaries, de-escalation, movement, escape, and help seeking through 40 short lessons in eight units. Nine lessons use five conservative, single-person MediaPipe checks for optional, private camera practice. The goal is to **avoid → de-escalate → create distance → escape → get help**; no technique guarantees safety.

## Architecture

The frontend is static vanilla HTML, CSS, and JavaScript. It has no build step. Hash routes keep deep links compatible with GitHub Pages. Supabase provides email/password authentication and per-user progress. Browser camera frames stay on the device; only derived calibration metrics, criterion scores, and progress are persisted.

| File | Responsibility |
| --- | --- |
| `index.html`, `styles.css` | App shell and responsive design tokens |
| `js/curriculum.js` | Versioned units, lessons, and content blocks |
| `js/app.js` | Routes and reusable lesson, quiz, camera, and account views |
| `js/experience.js` | Shared icons, lesson-stage continuity, and per-learner resume position |
| `js/camera-flow.js` | Hands-free hold gates for calibration and assessment |
| `js/store.js` | Supabase auth client and per-user persistence |
| `js/assessment.js` | Configured pose rules, visibility, smoothing, and scoring |
| `js/pose.js` | MediaPipe model, camera lifecycle, live skeleton, and target overlay |
| `SCHEMA.sql` | Reproducible schema, grants, and RLS policies |
| `sw.js`, `manifest.webmanifest` | Installable PWA shell and icons |

## Local development

Run `node tools/serve.mjs` (Node 20 or later) and open `http://127.0.0.1:4173`. If npm is available, `npm run dev` is equivalent. No dependencies need installing. Run `node tests/assessment.test.mjs`, `node tests/experience.test.mjs`, and `node tests/camera-flow.test.mjs` (or `npm test`) to check curriculum, assessment rules, lesson continuity, and automatic capture gates. Camera access needs HTTPS or localhost, a supported browser, permission, good light, and a full-body view. If you edit service worker assets, change its cache version to refresh installed clients.

## Supabase

This repository is configured for the existing **Raksha** project. `js/config.js` contains only the public project URL and a **publishable** key. Never put a secret or service-role key in static files. `SCHEMA.sql` creates `profiles`, `lesson_progress`, `exercise_attempts`, `activity_days`, and `device_calibrations`. All are user-owned with RLS checks using `auth.uid()`. The app does not store raw photos, frames, or video.

The project currently allows email/password sign-up without email confirmation. For another project, run `SCHEMA.sql`, enable email/password auth, set the site URL and allowed redirect URLs for your local and published origins, and place that project's publishable key and URL in `js/config.js`. Password reset emails return to the app origin and open the password update view. Supabase email delivery and redirect allowlisting are external project settings that must be configured for a new deployment.

## GitHub Pages deployment

Publish the repository root from the default branch through GitHub Pages. All local assets use relative URLs, and the manifest uses a relative start URL and scope. Routes use `#/...`, so refreshes and links work whether the site is at a custom domain root or under a repository path. The service worker caches the app shell and uses network-first updates; Supabase and MediaPipe model requests remain online. The full curriculum is bundled with the app, but account data requires Supabase connectivity.

The supplied logo remains the brand source. The two manifest icons in `assets/icons/` are exact resized copies for installability.

## Adding content

`js/curriculum.js` declares each unit with an immutable `id`, title, subtitle, and lesson list. Lesson IDs are independent of ordering; progress rows use `lesson_id`, so reordering or inserting content does not change existing completion. Never rename a published ID. `unitOrder` controls the syllabus sequence. Increment `CONTENT_VERSION` when changing content structure.

To add a lesson, call the `lesson(...)` helper with a stable ID, a clear objective, practical steps, a plausible choice with a correct answer and explanation, and a specific solo activity. Scenario lessons start with a decision; other lessons build toward it. The reusable renderer supports `explanation`, `demonstration`, `steps`, `cues`, `visual`, `practice`, and `choice` blocks. It omits the old repeated recap. For physical lessons, add manual demonstration stages (`demo`) and specific helpful/common-mistake cues. A new unit is an entry in `units` with its own immutable ID and lessons. The engine records attempts separately from completion.

For a camera-supported lesson, assign an `assessmentId` from `ASSESSMENTS` in `js/assessment.js` and a specific `cameraPrompt`. Existing camera activities are grouped in `cameraActivities` so the same visible skill can be applied in different contexts. Define only single-person, visible movements. Each criterion declares a metric, broad accepted range, weight, and specific corrective cue. The evaluator rejects low-visibility poses, normalizes measurements using this device's calibration, smooths landmarks over time, and returns weighted criterion scores. Dynamic side-step and guard-step practice track movement phase and recovery. The target skeleton is an approximate alignment guide, not an exact anatomical prescription. Partner contact is deliberately never camera-scored.

Calibration captures a neutral stance and arms-out reference after a steady, visible hold, then stores derived proportions, framing, quality, device class, and an anonymous local device ID. A manual capture fallback remains available. A camera assessment saves automatically after a three-second stable pass, so learners need not walk back to touch the device. Mobile and desktop profiles are separate. Recalibration and deletion are available in Settings. Camera video is never uploaded.

## Progress and safety

Statuses distinguish `viewed`, `practiced`, `passed`, and `mastered`. Correct decision checks are required to pass a lesson. Camera mastery requires a supported exercise scoring at least 80 with stable tracking. Camera trouble never blocks curriculum completion. A first completion earns 20 XP, and first camera mastery adds 10 XP. XP, level, streak, daily goal, and badges reward consistency and knowledge rather than speed or confrontation. No public leaderboard is present, so client-reported scores cannot affect other learners. The visual learning path shows current, available, upcoming, completed, and mastered lessons; all lessons remain accessible. Lesson stage position is stored locally per account and stable lesson ID, while completion and attempts remain in Supabase.

Physical drills should be done gently in clear space. Stop with pain or dizziness. Partner concepts require consent and light pressure. The product is educational and cannot promise safety in a real incident.

## Verification

- Browser-verified live sign-up, onboarding, incorrect/correct quiz feedback, lesson completion, XP/streak, session persistence, sign-out, and returning sign-in against the Raksha project.
- Verified MediaPipe 1.0.1 model initialization through the browser without a camera.
- `npm test` verifies 40 unique lessons, nine camera activities, visibility rejection, static criteria, corrective feedback, dynamic side-step and guard-step scoring, lesson position, and no-touch capture timing.
- The UX journey was walked at desktop, 390 px, and 320 px widths: account creation, onboarding, lesson steps, quiz feedback, completion, path progress, sign-out/sign-in resume, camera setup entry, and camera failure recovery.
- Supabase security advisor reported no security findings after schema creation. A role-switched RLS query saw two own progress rows and zero foreign rows.
- The product owner confirmed working calibration and motion tracking on two samples using a real device. The in-app test browser has no usable camera, so this UX pass verified its recovery flow but could not repeat a live pose assessment there.
