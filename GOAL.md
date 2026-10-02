Build the production-ready application described below. You are working directly inside the connected Git repository and are expected to IMPLEMENT the application, not merely provide a plan, mockup, scaffold, or proof of concept.

You have permission to inspect the repository, create/edit/delete files as necessary, use the available skills/plugins, run the application, test it, debug it, and iterate until the major flows work.

IMPORTANT:
- Use the $frontend-design skill extensively for the interface and interaction design.
- Use the $supabase plugin to work directly with the existing Supabase project/database named "Raksha".
- Actually create/configure the required database tables, relationships, indexes, RLS policies, etc. through Supabase.
- ALSO create a complete SCHEMA.sql in the repository representing the database schema so the backend can be recreated later.
- The Git repository is connected. When the application is complete and tested, commit the completed implementation and push it to the connected remote.
- Do not stop after planning.
- Do not leave core functionality as TODOs.
- Do not build a prototype disguised as a finished application.
- Do not replace difficult functionality with fake data if it can reasonably be implemented.
- Make sensible engineering/product decisions yourself when something minor is unspecified.
- Prioritize a reliable learning experience over adding superficial features.

# PRODUCT

Product name: RakshaOne

RakshaOne is an AI/ML-powered practical self-defense learning platform.

It should feel like a genuinely polished consumer learning product that someone can open today and begin using to learn practical self-defense.

This is NOT primarily a martial arts app.

The objective is practical personal safety:
- situational awareness
- avoidance
- boundary setting
- de-escalation
- maintaining distance
- movement
- escaping unsafe situations
- breaking away from common holds where appropriate
- defensive positioning
- protecting vulnerable areas
- creating an opportunity to escape
- seeking help
- decision-making under pressure
- practical physical defensive fundamentals

The philosophy should consistently prioritize:

AVOID → DE-ESCALATE → CREATE DISTANCE → ESCAPE → GET HELP

Physical confrontation should never be framed as the goal.

The target audience is broad and includes teenagers and adults. The UI and curriculum should therefore feel accessible without being childish.

The first real intended user may be around Grade 8 age, so keep instructions understandable and safety-conscious.

# EXISTING REPOSITORY

The repository is essentially empty except for:

assets/logo.png
assets/favicon.ico

Inspect both assets before designing the application.

The attached logo is RakshaOne's visual identity and should materially influence the design system.

Do NOT replace the logo.

# TECHNOLOGY CONSTRAINTS

Frontend:
- vanilla HTML
- vanilla CSS
- vanilla JavaScript
- ES modules where useful
- libraries imported via CDN where practical
- NO React
- NO Vue
- NO Angular
- NO build system unless absolutely unavoidable
- should remain understandable and maintainable as a vanilla web application

Backend:
- Supabase
- use the existing "Raksha" Supabase project/database
- email/password authentication
- email verification is NOT required for the intended flow
- configure secure RLS
- never expose privileged Supabase credentials

Hosting:
- GitHub Pages
- the frontend must work correctly as a static GitHub Pages deployment
- handle paths/base URLs accordingly
- avoid architecture that requires a traditional server

PWA:
- installable
- proper web app manifest
- service worker where appropriate
- correct icons/theme metadata
- standalone display
- good installed-app behavior

Do NOT spend large amounts of implementation complexity making the entire curriculum offline-first. PWA support is primarily for installation and app-like behavior.

# CORE PRODUCT PRIORITY

Implement in this order of importance:

1. Excellent actual learning experience
2. Real curriculum
3. Camera calibration
4. MediaPipe technique assessment
5. Meaningful progress/mastery
6. Excellent responsive UX
7. Gamification
8. Secondary/social features

Do NOT build a beautiful dashboard while leaving the learning system shallow.

==================================================
CURRICULUM
==================================================

RakshaOne must ship with an ACTUAL useful curriculum.

Do not create 5 example lessons and fill the rest with "Coming Soon."

Create approximately 6–8 substantial units containing roughly 30–50 meaningful lessons/exercises in total.

Research/general knowledge may be used to construct a sensible beginner-oriented practical personal-safety curriculum, but avoid presenting dangerous or dubious techniques as guaranteed solutions.

Example high-level progression:

1. Personal Safety Foundations
2. Awareness & Decision Making
3. Movement, Balance & Distance
4. Defensive Positioning
5. Escapes & Releases
6. Creating Space & Getting Away
7. Scenario Training
8. Consolidation / Advanced Practice

You may improve this structure if a more pedagogically coherent progression emerges.

Include nonphysical skills as first-class lessons.

Examples:
- identifying exits
- awareness habits
- recognizing unsafe positioning
- verbal boundaries
- de-escalation
- distance management
- reaction decisions
- when to run
- calling for help
- choosing safer routes
- responding to being followed
- protecting yourself after falling
- recovering to a safe position

Make these INTERACTIVE rather than walls of text.

Use:
- short scenarios
- decisions
- quizzes
- tap/select exercises
- visual explanations
- mini challenges
- quick checks
- scenario branching where appropriate

Physical lessons should generally follow a structure such as:

CONCEPT
→ DEMONSTRATION
→ STEP-BY-STEP
→ KEY CUES
→ COMMON MISTAKES
→ GUIDED PRACTICE
→ CAMERA PRACTICE where supported
→ FEEDBACK
→ RETRY / COMPLETE
→ QUICK KNOWLEDGE CHECK where useful

Lessons should be concise enough to remain engaging.

==================================================
CURRICULUM ARCHITECTURE
==================================================

THIS IS IMPORTANT.

The curriculum must be data-driven rather than hard-coded into dozens of unrelated pages.

Adding a new unit, lesson, exercise, quiz, demonstration, or assessment later should be straightforward.

Use stable immutable identifiers for:
- courses
- units
- lessons
- exercises
- assessments

User progress must reference stable IDs.

DO NOT make progress depend on:
- lesson array position
- unit index
- ordering number
- DOM location

Adding, removing, inserting or reordering curriculum content in a future version MUST NOT reset unrelated user progress.

Include content/schema versioning where useful.

Separate:
- curriculum definition
- rendering engine
- progress state
- assessment definitions
- technique evaluation configuration

Prefer reusable lesson-block types such as:
- explanation
- visual
- steps
- interactive-choice
- quiz
- scenario
- solo-practice
- camera-assessment
- recap

A future developer should be able to add a lesson primarily by defining its structured content rather than creating an entirely new page.

Document how to add curriculum content.

==================================================
INSTRUCTIONAL MEDIA
==================================================

Lessons MUST remain useful without external video.

Do not show:
- empty video boxes
- "Video coming soon"
- fake thumbnails
- unavailable placeholder media

If a reviewed video exists, the architecture may support a videoUrl/media source.

However, every lesson must stand on its own through:
- excellent text
- clear sequencing
- diagrams/illustrations where useful
- high-quality browser animations where appropriate
- interactive demonstrations

Do NOT make incomprehensible SVG stick figures whose limbs simply flap around.

If creating an animated demonstration:
- make the body positioning clear
- show starting position
- show movement direction
- show ending position
- use arrows/paths/callouts where helpful
- allow replay
- allow step-by-step viewing where useful
- use timing intentionally
- keep anatomy and orientation understandable

Prefer clarity over animation complexity.

Do not embed random third-party self-defense videos merely to fill space.

The system should make it easy to add reviewed videos later.

==================================================
SOLO VS PARTNER PRACTICE
==================================================

The product is SOLO-FIRST.

All core learning should be possible alone.

Partner exercises may exist when genuinely educational, but clearly label them as partner practice.

For partner drills:
- require a consenting practice partner
- include appropriate safety guidance
- do NOT run MediaPipe technique scoring
- do not pretend single-person pose tracking can accurately assess a two-person technique

Camera assessments should only exist for movements that can reasonably be assessed from a single person's visible pose/movement.

==================================================
MEDIAPIPE / MOTION COACHING
==================================================

This is one of RakshaOne's signature features.

Implement REAL browser-based pose estimation using an appropriate current MediaPipe web solution via CDN.

Do not fake pose tracking.

The expected pipeline is approximately:

webcam
→ MediaPipe pose landmarks
→ calibration normalization
→ temporal smoothing
→ technique-specific evaluator
→ criterion scores
→ live visual feedback
→ actionable corrective feedback

The evaluation engine should be CONFIGURATION-DRIVEN.

Each camera-assessed exercise should be able to define things such as:
- required landmarks
- phases
- joint-angle targets
- angle ranges/tolerances
- relative landmark positions
- normalized distances
- symmetry/asymmetry expectations
- stance requirements
- sequencing
- movement trajectory where viable
- timing ranges where viable
- confidence requirements
- visibility requirements
- safety-related constraints
- criterion weights

Do not create one giant pile of technique-specific if-statements.

==================================================
CALIBRATION
==================================================

Before camera assessment, provide a polished calibration process.

Calibration should establish enough information to make assessment more robust across:
- different bodies
- different camera positions
- desktop webcams
- phones propped several feet away
- portrait/landscape differences
- camera distance

Possible calibration flow:

1. Explain camera setup
2. Request camera permission
3. Ask user to position their full body inside a framing guide
4. Verify required landmarks are visible
5. Neutral standing pose
6. Arms-out reference pose
7. Small controlled reference movement if useful
8. Derive normalized measurements
9. Confirm camera quality/visibility
10. Save calibration

Calibration should measure/derive useful normalized information such as:
- body landmark proportions
- shoulder width
- hip width
- approximate limb relationships
- neutral joint orientations
- scale
- framing
- camera orientation
- landmark visibility reliability

Do NOT store webcam video or captured frames in Supabase.

Store only derived calibration information required for future evaluation.

Explain this privacy behavior clearly.

==================================================
DEVICE-SPECIFIC CALIBRATION
==================================================

A single account may be used on both desktop and mobile.

Desktop and mobile camera setups are fundamentally different.

Support separate calibration profiles per device/device class.

At minimum distinguish:
- desktop/laptop
- mobile

If practical, generate a persistent anonymous local device ID so multiple devices can each retain an appropriate calibration profile.

When a user begins camera practice:
- identify the current device/profile
- use the matching calibration if available
- otherwise request calibration

Allow recalibration from settings and from the camera experience.

Do not silently apply an unsuitable desktop calibration to a mobile camera or vice versa.

==================================================
CAMERA PRACTICE UI
==================================================

Make this excellent.

The camera practice experience should include:

- live webcam
- real MediaPipe pose skeleton
- clear landmark/bone visualization
- target/ghost skeleton or target alignment visualization
- live criterion feedback
- confidence/visibility handling
- clear start/stop controls
- camera switching where supported
- mirrored preview where appropriate
- framing assistance
- progress through movement phases
- understandable score/results

The LIVE skeleton should communicate correctness visually.

For example:
- correct joints/bones
- borderline joints/bones
- incorrect joints/bones

Use a coherent accessible status system rather than relying solely on color.

The TARGET/GHOST skeleton should be visually distinct and semi-transparent.

Its purpose is to communicate optimal approximate alignment.

Do not imply millimeter-perfect body positioning.

Different bodies move differently.

==================================================
CORRECTIVE FEEDBACK
==================================================

The primary technique feedback should be DETERMINISTIC.

Do not send webcam frames to an LLM.

Given:
- current normalized landmarks
- calibration
- current exercise phase
- target criteria

produce actionable corrections such as:

"Raise your right hand slightly."
"Bring your elbow closer to your body."
"Widen your stance a little."
"Keep your weight more centered."
"Turn your shoulders slightly."
"Good guard position."
"Step back a little faster."
"Return to your ready position."

Prioritize the 1–2 most useful corrections rather than overwhelming the learner.

Only give corrections that the pose data can reasonably support.

If confidence/visibility is poor, say so instead of inventing feedback.

==================================================
STATIC + DYNAMIC ASSESSMENT
==================================================

Support both where viable.

STATIC:
Evaluate target alignment during a pose/position.

DYNAMIC:
For suitable movements, assess a sequence such as:

READY
→ INITIATION
→ MOVEMENT
→ TARGET
→ RECOVERY

Use temporal landmark history where useful.

Factor timing into assessment only when:
- MediaPipe tracking is sufficiently reliable
- the exercise actually benefits from timing evaluation
- frame rate/performance is adequate

Timing should generally be a criterion, not the entire score.

Do not sacrifice reliable pose assessment merely to claim dynamic analysis.

==================================================
SCORING
==================================================

Do NOT reduce every technique to raw pose similarity.

Assess meaningful criteria.

Example:
- stance
- balance
- guard
- elbow position
- hand position
- torso alignment
- movement sequence
- recovery
- controlled timing

Each criterion may have:
- weight
- current score
- pass threshold
- feedback rule

Combine criteria into an understandable overall result.

Show WHY a learner received a result.

Example result:

84 — Strong attempt

Guard        Excellent
Stance       Good
Balance      Good
Recovery     Needs work

Primary correction:
"Return your hands to guard immediately after the movement."

Scores should tolerate natural anatomical variation and imperfect webcam conditions.

==================================================
MASTERY
==================================================

Progress should mean something.

Distinguish between:
- viewed
- learned/completed
- practiced
- passed
- mastered

Where camera assessment is appropriate, mastery should require achieving reasonable assessment criteria rather than simply pressing "Complete."

Non-camera lessons can use:
- quizzes
- scenarios
- interactive decisions
- knowledge checks

Do not lock someone permanently because their camera cannot track them reliably.

Provide sensible alternatives when tracking is unavailable.

==================================================
AI / GENERATIVE AI
==================================================

Do NOT make generative AI a dependency for the core product.

MediaPipe pose estimation and the deterministic coaching system are the main AI/ML functionality.

NVIDIA NIM may be integrated later for optional features such as:
- conversational explanation of already-derived feedback
- adaptive explanations
- session summaries
- personalized learning guidance

But do NOT add NIM merely for marketing.

Do NOT expose an NVIDIA API key in client-side JavaScript.

If you decide there is a genuinely valuable NIM feature, implement it securely using an appropriate Supabase Edge Function and degrade gracefully without it.

The entire learning/course/camera experience must function without NIM.

==================================================
GAMIFICATION
==================================================

ONLY after the learning functionality is strong.

Take inspiration from the effectiveness of Duolingo's progression systems, NOT its visual identity.

Include useful systems such as:
- XP
- levels
- daily goal
- streak
- lesson completion
- mastery
- achievements
- badges
- skill/course progress
- daily challenge
- celebratory moments
- optional leaderboard

Do not let gamification incentivize unsafe speed or sloppy technique.

For example, do NOT reward:
"perform this defensive movement as fast as physically possible."

Reward:
- consistency
- completing practice
- improvement
- mastery
- correct technique
- knowledge

Use streak protection/recovery sensibly rather than making the experience punitive.

A leaderboard may exist, but it is secondary.

==================================================
PRODUCT EXPERIENCE
==================================================

Use the $frontend-design skill.

Do not produce generic AI-generated SaaS UI.

The application should have a distinctive RakshaOne identity.

Use the provided logo as the starting point.

Visual direction:

- LIGHT THEME ONLY
- warm off-white backgrounds
- coral / terracotta brand tones derived from the logo
- peach highlights
- dark warm-neutral text
- restrained gradients
- excellent typography
- generous spacing
- rounded elements where appropriate
- shield geometry can inspire stronger structural forms
- clean
- calm
- confident
- protective
- modern
- premium

Avoid:
- aggressive black/red martial-arts styling
- excessive gradients
- glassmorphism everywhere
- generic purple AI aesthetic
- dashboard-template appearance
- childish cartoon UI
- huge hero marketing sections inside the logged-in app

The product should feel welcoming enough for a teenager but polished enough for an adult.

==================================================
INTERACTION DESIGN
==================================================

Take conceptual inspiration from:
- Duolingo for progression and satisfying learning loops
- Revolut for premium micro-interactions and polish
- Phantom for making utility feel unusually enjoyable

DO NOT clone any of them.

Use:
- tactile buttons
- subtle press states
- spring-like transitions where appropriate
- progress animation
- satisfying completion states
- small celebratory effects
- polished loading states
- smooth page/state transitions
- excellent empty states
- immediate feedback

Motion should support understanding.

Respect prefers-reduced-motion.

Avoid excessive animation.

==================================================
RESPONSIVE DESIGN
==================================================

RakshaOne must work extremely well on BOTH:

DESKTOP
and
MOBILE

Do not treat mobile as a compressed desktop layout.

Mobile should feel like a first-class installed application.

Consider:
- bottom navigation on mobile where appropriate
- desktop sidebar/top navigation where appropriate
- large touch targets
- camera practice while phone is propped up
- portrait orientation
- landscape where useful
- safe areas for installed PWAs
- responsive typography
- camera controls reachable without blocking the body view

Desktop camera practice should be designed around laptop/external webcams.

==================================================
ONBOARDING
==================================================

Keep onboarding short.

Suggested flow:

Welcome
→ Create account / Sign in
→ Name
→ brief profile/preferences if genuinely useful
→ explain learning philosophy
→ optional/required camera calibration before first camera lesson
→ begin learning

Do not ask 15 marketing-personalization questions.

The learner should reach useful content quickly.

==================================================
AUTHENTICATION
==================================================

Use Supabase email/password auth.

Support:
- sign up
- sign in
- sign out
- session persistence
- useful error states
- password reset if reasonably supported

Email verification is not required for the intended product flow.

Do not expose service-role credentials.

==================================================
DATA MODEL
==================================================

Design a robust Supabase schema.

Likely concepts include:

profiles
device_calibrations
course_progress
lesson_progress
exercise_attempts
assessment_results
quiz_attempts
user_stats
streaks
achievements
user_achievements
daily_challenges
leaderboard-related data if implemented

You may improve this model.

Avoid storing unnecessary sensitive data.

Camera footage MUST NOT be stored.

Store only derived assessment/calibration information required for the product.

Use:
- foreign keys
- constraints
- useful indexes
- timestamps
- RLS
- appropriate cascading behavior

Every user-owned table must have correct RLS.

Users must not be able to arbitrarily modify another user's progress.

Do not trust client-supplied user IDs without policy protection.

Create SCHEMA.sql containing the reproducible schema/policies.

==================================================
PROGRESS & CONTENT UPDATES
==================================================

Future curriculum additions must not reset users.

For example, if a learner has completed:

foundation.awareness.01

and later a new lesson is inserted before it, their existing completion remains attached to:

foundation.awareness.01

Do not calculate persisted identity from numeric ordering.

Ordering is presentation metadata only.

==================================================
PAGES / MAJOR EXPERIENCES
==================================================

Determine the final information architecture yourself, but the finished product should cover experiences equivalent to:

- landing/auth entry
- sign up
- sign in
- onboarding
- home / learning dashboard
- curriculum path
- unit view
- lesson player
- interactive scenario
- quiz
- solo guided practice
- camera calibration
- camera practice
- assessment result
- progress
- achievements
- leaderboard if worthwhile
- profile
- settings
- calibration management

Do not create separate HTML documents unnecessarily if a clean vanilla-JS application shell/router is more maintainable.

==================================================
HOME EXPERIENCE
==================================================

The home screen should answer:

"What should I do next?"

Prominently show:
- Continue learning
- current unit/lesson
- progress
- streak/daily goal
- relevant practice recommendation

Secondary information can include:
- XP
- mastery
- recent achievements
- daily challenge

Avoid a business analytics dashboard.

==================================================
LEARNING PATH
==================================================

Create an engaging visual progression through the curriculum.

It can take inspiration from game-like learning paths but should have its own visual identity.

Clearly communicate:
- completed
- current
- available
- locked/prerequisite
- mastered

The learner should understand where they are immediately.

==================================================
QUIZZES / SCENARIOS
==================================================

Use quizzes where knowledge matters.

Do not make every quiz trivial.

Scenario example:

"You notice someone has been following the same route for several turns. What is the safest next action?"

Present plausible choices and explain WHY an answer is safer.

Build reusable quiz/scenario components.

==================================================
ACCESSIBILITY
==================================================

Build accessibility in from the start.

Include:
- semantic HTML
- keyboard navigation
- visible focus
- adequate contrast
- accessible forms
- ARIA only where needed
- non-color status cues
- reduced-motion support
- useful screen-reader labels
- touch-friendly controls

Do not make the application depend exclusively on visual color differences.

==================================================
SAFETY / CLAIMS
==================================================

This application teaches personal safety but cannot guarantee safety.

Use concise appropriate safety framing without covering every screen in disclaimers.

Avoid claims such as:
- "This technique will always work."
- "You can defeat an attacker."
- "Guaranteed protection."

Teach escape and risk reduction rather than dominance.

For potentially risky physical drills:
- advise controlled practice
- adequate space
- no intentional injury
- stop if pain occurs
- use supervision/partner consent where appropriate

Because younger users may use the application, keep content responsible.

==================================================
PERFORMANCE
==================================================

Camera analysis can be computationally expensive.

Optimize appropriately.

Consider:
- model initialization only when needed
- frame throttling where useful
- requestAnimationFrame
- avoiding unnecessary DOM updates
- smoothing landmark noise
- pausing processing when tab/camera is inactive
- cleanup when leaving practice
- mobile thermal/performance constraints

Provide graceful feedback if the device cannot maintain adequate tracking.

==================================================
ERROR HANDLING
==================================================

Handle real-world failures.

Examples:
- camera permission denied
- no camera
- body not fully visible
- low pose confidence
- poor lighting
- MediaPipe CDN/model loading failure
- Supabase unavailable
- session expired
- progress save failure
- network loss
- unsupported browser feature

Do not leave users staring at broken controls.

==================================================
PRIVACY
==================================================

The camera experience should make clear that:
- pose analysis happens locally in the browser
- raw camera footage is not uploaded/stored for technique assessment
- only derived progress/calibration/assessment information is persisted

Do not silently capture photos.

==================================================
CODE QUALITY
==================================================

Even though this is vanilla JS, structure it professionally.

Use sensible modules such as:
- auth
- router
- supabase client
- curriculum
- progress
- gamification
- camera
- calibration
- pose engine
- assessment engine
- feedback engine
- UI components/utilities

Avoid one 8,000-line app.js.

Use centralized design tokens.

Avoid huge amounts of duplicated markup.

Comment complex pose/math logic where useful.

Document architecture.

==================================================
DOCUMENTATION
==================================================

Create a useful README covering:

- what RakshaOne is
- architecture
- local development
- Supabase configuration
- GitHub Pages deployment
- PWA behavior
- curriculum architecture
- how to add a unit
- how to add a lesson
- how to add a quiz
- how to add a camera-assessed technique
- how assessment rules work
- calibration
- database schema
- security/privacy notes

Also include SCHEMA.sql.

==================================================
TESTING
==================================================

Actually run and inspect the application.

Test important flows.

At minimum verify:

AUTH
- sign up
- sign in
- sign out/session persistence

LEARNING
- curriculum renders
- lesson navigation
- lesson completion
- quizzes
- progress persists
- adding/reordering content would not invalidate progress

CAMERA
- permission flow
- calibration
- pose initialization
- skeleton rendering
- ghost/target rendering
- visibility handling
- criterion evaluation
- feedback
- assessment completion
- camera cleanup

RESPONSIVE
- narrow mobile
- typical phone
- tablet-ish
- desktop

PWA
- manifest
- service worker registration
- icons
- installability-related configuration

DATABASE
- schema
- RLS
- expected inserts/updates
- user isolation

Use browser/dev tooling available to you to identify console errors and layout problems.

Fix issues you find.

==================================================
DEFINITION OF DONE
==================================================

Do not consider the task complete merely because:
- pages exist
- the homepage looks good
- the database exists
- MediaPipe draws dots
- sample lessons render

RakshaOne is complete for this task when a real user can approximately:

1. Open the deployed/static-compatible app
2. Create an account
3. Complete onboarding
4. Enter a substantial real curriculum
5. Learn an actual lesson
6. Understand a technique through clear instruction
7. Calibrate their camera
8. Perform a supported solo exercise
9. See their tracked body skeleton
10. See target/ghost alignment guidance
11. Receive meaningful deterministic corrective feedback
12. Complete an assessment
13. Understand their result
14. Have progress persist
15. Continue to the next lesson
16. Gain XP/mastery/streak progress
17. Return later and continue where they stopped
18. Use the application comfortably on mobile or desktop

The application should feel coherent, intentional and polished throughout this complete journey.

==================================================
WORK PROCESS
==================================================

Start by:

1. Inspecting the repository.
2. Inspecting assets/logo.png and assets/favicon.ico.
3. Using $frontend-design to establish an appropriate design system.
4. Inspecting the existing Raksha Supabase project with $supabase.
5. Designing the architecture/schema.
6. Implementing the foundational application.
7. Implementing the curriculum engine and real content.
8. Implementing calibration and MediaPipe.
9. Implementing assessment/feedback.
10. Implementing progress/mastery.
11. Adding gamification.
12. Polishing responsive UX/micro-interactions.
13. Testing.
14. Fixing issues.
15. Reviewing the product as a first-time learner.
16. Removing placeholders/dead ends/debug artifacts.
17. Ensuring GitHub Pages compatibility.
18. Updating documentation and SCHEMA.sql.
19. Reviewing git diff/status for accidental files/secrets.
20. Commit the completed work with an appropriate commit message.
21. Push to the connected remote.

Do not ask me questions about minor implementation details. Make good decisions and proceed.

If you encounter a genuine external limitation, implement the best graceful solution rather than abandoning the feature.

Most importantly:

BUILD THE PRODUCT, NOT A DEMO OF THE PRODUCT.