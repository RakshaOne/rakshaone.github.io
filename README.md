# RakshaOne

RakshaOne is a solo-first personal safety learning app. It teaches awareness, boundaries, de-escalation, movement, escape, and help seeking through 40 short lessons in eight units. Four single-person movements support optional, private MediaPipe pose coaching. The goal is to **avoid → de-escalate → create distance → escape → get help**; no technique guarantees safety.

## Architecture

The frontend is static vanilla HTML, CSS, and JavaScript. It has no build step. Hash routes keep deep links compatible with GitHub Pages. Supabase provides email/password authentication and per-user progress. Browser camera frames stay on the device; only derived calibration metrics, criterion scores, and progress are persisted.

| File | Responsibility |
| --- | --- |
| `index.html`, `styles.css` | App shell and responsive design tokens |
| `js/curriculum.js` | Versioned units, lessons, and content blocks |
| `js/app.js` | Routes and reusable lesson, quiz, camera, and account views |
| `js/store.js` | Supabase auth client and per-user persistence |
| `js/assessment.js` | Configured pose rules, visibility, smoothing, and scoring |
| `js/pose.js` | MediaPipe model, camera lifecycle, live skeleton, and target overlay |
| `SCHEMA.sql` | Reproducible schema, grants, and RLS policies |
| `sw.js`, `manifest.webmanifest` | Installable PWA shell and icons |

## Local development

Run `node tools/serve.mjs` (Node 20 or later) and open `http://127.0.0.1:4173`. If npm is available, `npm run dev` is equivalent. No dependencies need installing. Run `node tests/assessment.test.mjs` (or `npm test`) to check curriculum IDs and key assessment rules. Camera access needs HTTPS or localhost, a supported browser, permission, good light, and a full-body view. If you edit service worker assets, change its cache version to refresh installed clients.

## Supabase

This repository is configured for the existing **Raksha** project. `js/config.js` contains only the public project URL and a **publishable** key. Never put a secret or service-role key in static files. `SCHEMA.sql` creates `profiles`, `lesson_progress`, `exercise_attempts`, `activity_days`, and `device_calibrations`. All are user-owned with RLS checks using `auth.uid()`. The app does not store raw photos, frames, or video.

The project currently allows email/password sign-up without email confirmation. For another project, run `SCHEMA.sql`, enable email/password auth, set the site URL and allowed redirect URLs for your local and published origins, and place that project's publishable key and URL in `js/config.js`. Password reset emails return to the app origin and open the password update view. Supabase email delivery and redirect allowlisting are external project settings that must be configured for a new deployment.

## GitHub Pages deployment

Publish the repository root from the default branch through GitHub Pages. All local assets use relative URLs, and the manifest uses a relative start URL and scope. Routes use `#/...`, so refreshes and links work whether the site is at a custom domain root or under a repository path. The service worker caches the app shell and uses network-first updates; Supabase and MediaPipe model requests remain online. The full curriculum is bundled with the app, but account data requires Supabase connectivity.

The supplied logo remains the brand source. The two manifest icons in `assets/icons/` are exact resized copies for installability.

## Adding content

`js/curriculum.js` declares each unit with an immutable `id`, title, subtitle, and lesson list. Lesson IDs are independent of ordering; progress rows use `lesson_id`, so reordering or inserting content does not change existing completion. Never rename a published ID. Increment `CONTENT_VERSION` when changing content structure.

To add a lesson, call the `lesson(...)` helper with a stable ID, a clear objective, three practical steps, a plausible choice with a correct answer and explanation, and a solo practice prompt. The reusable renderer supports `explanation`, `demonstration`, `steps`, `cues`, `visual`, `practice`, `choice`, and `recap` blocks. For physical lessons, add manual demonstration stages (`demo`) and specific helpful/common-mistake cues. A new unit is an entry in `units` with its own immutable ID and lessons. Quizzes use the same `choice` block; use plausible options and explain why one action is safer. The engine records attempts separately from completion.

For a camera-supported lesson, set its `assessmentId` to a key in `ASSESSMENTS` in `js/assessment.js`. Define only single-person, visible movements. Each criterion declares a metric, broad accepted range, weight, and specific corrective cue. The evaluator rejects low-visibility poses, normalizes measurements using this device's calibration, smooths landmarks over time, and returns weighted criterion scores. Dynamic side-step practice also tracks movement phase and recovery. The target skeleton is an approximate alignment guide, not an exact anatomical prescription. Partner contact is deliberately never camera-scored.

Calibration captures a neutral stance and arms-out reference, then stores derived proportions, framing, quality, device class, and an anonymous local device ID. Mobile and desktop profiles are separate. Recalibration and deletion are available in Settings. Camera video is never uploaded.

## Progress and safety

Statuses distinguish `viewed`, `practiced`, `passed`, and `mastered`. Correct decision checks are required to pass a lesson. Camera mastery requires a supported exercise scoring at least 80 with stable tracking. Camera trouble never blocks curriculum completion. XP, level, streak, daily goal, and badges reward consistency and knowledge rather than speed or confrontation. No public leaderboard is present, so client-reported scores cannot affect other learners.

Physical drills should be done gently in clear space. Stop with pain or dizziness. Partner concepts require consent and light pressure. The product is educational and cannot promise safety in a real incident.

## Verification

- Browser-verified live sign-up, onboarding, incorrect/correct quiz feedback, lesson completion, XP/streak, session persistence, sign-out, and returning sign-in against the Raksha project.
- Verified MediaPipe 1.0.1 model initialization through the browser without a camera.
- `npm test` verifies 40 unique lessons, all lesson interactions, visibility rejection, static criteria, corrective feedback, and dynamic side-step phase scoring.
- Supabase security advisor reported no security findings after schema creation. A role-switched RLS query saw two own progress rows and zero foreign rows.
- The in-app test browser did not grant camera access, so live webcam calibration, skeleton overlay, and end-to-end assessment could not be physically observed there. The app shows a bounded permission error and keeps the knowledge pathway usable. Recheck those steps on a real webcam/phone before a public launch.
