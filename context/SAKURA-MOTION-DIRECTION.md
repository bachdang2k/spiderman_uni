# SAKURA MOTION DIRECTION — LINH CHU REVEAL

## Intent

This is not a decorative petal shower and not a single butterfly made from petals.

The frame begins as a seemingly endless field of cherry-blossom petals. Wind gradually reveals intention inside the chaos: most petals converge into the letters `LINH CHU`, while smaller groups become living butterflies that continue to fly around the completed name.

The emotional beat is discovery, not romance copy. The name itself is the reveal.

## Reference Translation

Reference: `https://github.com/jhammann/sakura`

Borrow from Sakura.js:

- varied petal size and color;
- gravity-led falling motion;
- wind-driven lateral sway;
- independent rotation and irregular timing;
- petals entering and leaving the frame naturally.

Do not reproduce its implementation literally for the hero sequence. Sakura.js creates individual DOM petals and uses CSS animation with `requestAnimationFrame`; that is suitable for a light ambient layer, but the name reveal needs a denser particle field, deterministic choreography, depth, and precise morph targets.

## Hero Frame

### Desktop / landscape

- Compose for a cinematic `16:9` field.
- Keep the name near the optical center, occupying roughly `68–76%` of the safe width.
- Leave breathing room above and below the letters for butterfly flight paths.
- Use three depth planes: soft distant petals, sharp hero petals, and a small number of close petals that cross the camera.
- Preserve traces of cosmic blue behind the pink so this still feels like the same universe after the raindrop impact.

### Mobile / portrait

- Do not rotate the device or crop a desktop composition.
- Keep `LINH CHU` on one line when the safe width permits; use a wide custom letter construction rather than a conventional font size.
- Fit the complete name inside approximately `88–92vw`.
- Reduce the number of close-camera petals and use two or three butterflies so the letters remain readable.
- Move butterfly paths above, below, and behind the name instead of across its central strokes.

## Choreography

### Phase 1 — Petal infinity

Duration: approximately `2.4s` after the raindrop impact.

- Pink first grows from the flower's contact point.
- Hundreds of visible petals release from that point, while additional petals enter from outside the camera to imply thousands beyond the frame.
- Petals do not fall in parallel. They tumble, catch crosswind, briefly rise, and pass one another at different depths.
- The center remains visually unresolved. No readable letters appear yet.

### Phase 2 — The wind notices something

Duration: approximately `1.8s`.

- Four to six broad wind ribbons emerge from the apparent chaos.
- Petals follow curved, offset trajectories rather than one perfect spiral.
- The flow creates temporary negative space at the center, then curls back toward it.
- Motion becomes more intentional without immediately revealing the destination.

### Phase 3 — Write the name

Duration: approximately `2.6s`.

- A text mask for `LINH CHU` is sampled into stable particle targets.
- Roughly `78–84%` of the hero petals are assigned to those targets.
- Petals arrive in waves: `L`, then `INH`, a short pocket of air, then `CHU`.
- Each petal overshoots slightly and settles from a different angle so the assembly feels organic, not like pixels snapping to a grid.
- The final letters must be made visibly from petals. Do not reveal an ordinary text layer and place petals over it.
- After settling, the letters retain a tiny breathing motion and occasional petal exchange without losing legibility.

### Phase 4 — Butterflies are born

This overlaps the end of Phase 3.

- Reserve `12–18%` of the hero petals for three to five butterfly clusters on desktop and two to three on mobile.
- Each butterfly is a small articulated group of petals, not a sticker icon and not a static silhouette.
- Wing pairs open and close with slightly different phase offsets.
- One butterfly passes in front of the first `L`, one crosses behind the name, and one pauses near the final `U` before leaving its orbit.
- Butterfly motion follows asymmetric spline loops with occasional hovering, direction changes, and depth crossings.
- Butterflies must never obscure enough petals to make the name unreadable.

### Phase 5 — Living tableau

- Hold the completed image without interface chrome for at least approximately `2s`, long enough to recognize and read the name without hurry.
- Keep the center calm while the perimeter remains alive.
- A few loose petals continue past the camera.
- Butterflies remain in motion around `LINH CHU`; they do not freeze after the assembly.
- No narrative sentence appears in this beat. The only visible language is the name.

## Visual Material

- Petals use a custom asymmetric petal mesh or sprite with a shallow center fold, never a flat oval.
- Use restrained variations of pale blush, cherry pink, dusty rose, and occasional near-white petals.
- Light comes from the former cosmic core: cooler rim light underneath, warm pink transmitted light through thin petals.
- Hero petals are crisp; far petals receive blur and lower contrast; close petals may use brief motion blur.
- Avoid a uniformly pink background. The color migration should remain visible as blue-black space becomes blossom atmosphere.

## Motion Character

- Wind: layered curl noise plus a slow directional field.
- Fall: gravity is present but weak enough for petals to rise inside vortices.
- Tumble: separate rotation velocity per axis; avoid identical pendulum sway.
- Convergence: use target attraction with tangential force so petals orbit before settling.
- Settling: critically damped with a small overshoot, not a bounce preset.
- Butterflies: low-frequency body drift plus faster asynchronous wing articulation.
- Use seeded randomness so the cinematic beats remain art-directable and testable.

## Rendering Plan

- Render the hero system with Three.js instanced petal geometry or an equivalent WebGL instanced system.
- Use an offscreen canvas only to rasterize and sample the `LINH CHU` target mask.
- Assign particles to target points once, then animate their physical state in a single `requestAnimationFrame` loop.
- GSAP owns phase timing, camera values, global force strength, color migration, and transition cues; it does not create one tween per petal.
- A lightweight DOM/SVG fallback displays the already-formed petal name with two gently moving butterfly silhouettes if WebGL initialization fails.

Suggested visible particle budgets:

| Viewport | Ambient | Hero/name | Close camera | Butterflies |
| -------- | ------: | --------: | -----------: | ----------: |
| Desktop  | 280–420 | 900–1,300 |        24–40 |         3–5 |
| Mobile   | 100–160 |   420–650 |         8–14 |         2–3 |

The frame can feel like it contains countless petals without rendering every implied petal. Depth, occlusion, spawn continuity, and offscreen flow create that scale.

## Interaction and Copy

- The raindrop impact automatically starts this choreography; do not ask for another click while the visual payoff is unfolding.
- Remove the previous lines about petals trying to become something.
- Do not place an instruction over the name formation.
- Once the living tableau has held long enough, exactly one butterfly breaks from the flock and visually leads toward the next CTA.
- Reveal `Follow the butterfly` only after that lead motion begins, outside the name's safe area.
- Accessible text must still expose `Linh Chu` to assistive technology even though the visible typography is particle-built.

## Reduced Motion

- Crossfade from a small drifting petal field into the completed name.
- Use one or two slow butterflies with minimal path travel and no camera fly-through.
- Preserve the blue-to-pink color migration and the readable final composition.

## Acceptance Frame

The beat is successful only when all of the following are true:

1. The first impression is an unbounded field of petals, not a particle logo waiting to resolve.
2. The wind choreography creates anticipation before any letter is obvious.
3. `LINH CHU` is readable because petals physically form its strokes.
4. Multiple petal-built butterflies remain alive around the name.
5. The reveal works as a landscape hero and as a separately framed mobile composition.
6. No additional romantic sentence competes with the visual reveal.
