# CURRENT WORKING SCRIPT — FROZEN FOR REVIEW

No further UI implementation should continue until this script is revised and approved.

Spider visual direction is documented separately in `context/SPIDER-STICKER-DIRECTION.md`.

## Scene 0 — The Web

**Visual:** Midnight screen, expanding web, subtle comic halftone, tiny web hero signal.

**On-screen copy:**

> Some stories begin with a coincidence.
>
> Some begin with a web.

**Instruction:** Touch the thread.

**Interaction:** The user touches the center web. A web shoots toward the pointer with a `THWIP` transition.

**Hidden interaction:**

> Hey. Stop touching random things.
>
> ...actually, keep going.

---

## Scene 1 — Spider Sense

**Visual:** Eight abstract comic signals. One has a different golden core.

**On-screen copy:**

> SPIDER SENSE
>
> Let’s see if yours works.

**Instruction:** Find the one that feels different.

**Wrong response:**

> Nope.
>
> Spider Sense temporarily unavailable.

**Correct response:**

> Okay...
>
> That was suspiciously good.

**Exit:** Continue.

---

## Scene 2 — Wonder / Woman

**Visual:** An original comic heroine silhouette. A gold emblem glows at her center. She is a metaphor for “a wonderful woman,” not a direct reproduction of Wonder Woman.

**Label:** `WONDER // WOMAN`

**On-screen copy:**

> A different signal just appeared.
>
> Not every superhero needs a cape.

**Instruction:** Touch the emblem.

**Interaction:** The emblem lights up and opens a circular star portal behind her.

**Exit:** Enter the star portal.

---

## Scene 3 — Galaxy Six / Letter L

**Approved visual reference:** `src/assets/references/Screenshot 2026-09-04 at 13.43.54.png`

**Visual:** Reconstruct the reference as a Three.js point-cloud galaxy shaped like the number `6`. Preserve its defining features: a dense luminous core, multiple irregular spiral streams, blue-white stars mixed with restrained warm-gold stars, several larger cross-shaped flare stars, faint gaseous haze, and a long open upper stroke. The result must feel organic and astronomical rather than like a clean typographic outline.

**Desktop composition:** The scene uses a cinematic landscape canvas. The galaxy remains fully visible without stretching, with intentional horizontal negative space for pacing and copy. Target framing is approximately `16:9`, not a portrait image enlarged to fill the screen.

**Mobile composition:** Do not force landscape orientation and do not crop the number. Reframe the same particle system inside a portrait viewport, scale the complete `6` to approximately `78–84vw`, reduce particle count and flare size, and move copy above or below the galaxy. Preserve the full silhouette and readable interaction target.

**Quote 1:**

> “The stars are beautiful, because of a flower that cannot be seen.”

**Supporting copy:**

> A number lost in the galaxy.
>
> Touch it and see what letter it is hiding.

**Instruction:** Touch the galaxy shaped like a six.

**Interaction:** The point cloud converges from `6` into the letter `L`. The `L` must retain the same astronomical construction as the reference: layered star streams, luminous knots, a subtle cloudy core, and a few large flare stars. It must not become a thin dotted font outline.

**Quote 2 appears after the morph:**

> “When you want something, all the universe conspires in helping you to achieve it.”

**Exit:** Follow the L.

---

## Scene 4 — Rain / Sakura

**Visual continuity:** Keep the exact cosmic visual world established by the galaxy reference throughout the beginning of this scene: near-black space, deep blue haze, blue-white stars, restrained warm-gold highlights, and luminous dust. Do not introduce pink when the rain scene begins.

**Visual:** One suspended raindrop emerges from the cosmic field and falls toward a still, nearly monochrome flower branch. The galaxy should feel as if it has condensed into rain rather than being replaced by an unrelated scene.

**On-screen copy:**

> Then the sky changed its mind.
>
> All it takes is one raindrop in the right place.

**Instruction:** Touch the raindrop.

**Interaction:** The drop falls onto the flower. The exact moment of impact is the color boundary between the two visual worlds.

**Theme transition after impact:** Cherry-blossom pink begins at the contact point, then spreads organically through the flower, branch, nearby particles, atmospheric haze, and finally the background. This must be a gradual color migration rather than a hard scene cut. Cosmic blue remains visible underneath during the transition before the sakura palette takes over.

**Sakura motion reference:** Use the wind, gravity, tumble, size variation, and irregular petal timing of `jhammann/sakura` as motion inspiration. The hero implementation must be a dense particle system rather than a literal DOM port.

**Sakura art direction:** The approved motion composition is documented in `context/SAKURA-MOTION-DIRECTION.md`. The precise flower branch form and final pink material may still be refined when the user provides the next image reference.

**Exit:** Follow the petals.

---

## Scene 5 — Petal Name / Butterfly Flock

**Visual:** A seemingly endless field of cherry-blossom petals fills the frame at multiple depths. Broad, irregular currents gradually emerge from the chaos. Most petals converge into the actual strokes of `LINH CHU`; smaller petal clusters become living butterflies that continue flying around the completed name.

**On-screen copy:** None. `LINH CHU` is the entire visual and narrative reveal.

**Choreography:** Petal infinity → curved wind ribbons → staggered letter assembly → butterfly birth → living tableau.

**Interaction:** No additional interaction interrupts the payoff. The raindrop impact from Scene 4 automatically begins the full sequence.

**Butterflies:** Three to five articulated petal butterflies on desktop, two to three on mobile. Their paths move in front of, behind, above, and below the name without obscuring its readability.

**Hold:** Keep the completed name readable while loose petals and butterflies remain in motion.

**Exit:** A single butterfly eventually breaks from its orbit and leads the eye toward the next strange object.

---

## Scene 6 — The Strange Object

**Visual:** A small star-seed wrapped in Spider-Man-inspired web rings. It breathes softly in the dark.

**On-screen copy:**

> Wait.
>
> Something fell behind.

**Instruction:** Touch the strange object.

**Interaction:** The web cocoon opens. Twelve stars escape and spread across the screen.

**Exit:** See what the stars are writing.

---

## Scene 7 — The Invitation

**Visual:** Escaped stars assemble into a sentence. A tiny web hero hangs at the edge of the screen with one flower.

**Final line:**

> Would you watch the sunset with me?

**Response button:** Yes, I would.

**After interaction:** A warm sunset rises from the bottom of the screen.

**Small final note:**

> Spider Sense says that was a very good choice.

---

## Current Narrative Logic

```text
Spider web
→ Spider Sense detects someone unusual
→ “wonder / woman” introduces the wonderful girl metaphor
→ her emblem opens the universe
→ galaxy 6 becomes L
→ L dissolves into cosmic rain without changing the blue-black theme
→ one raindrop touches the flower
→ pink spreads from the impact point and transforms the world into sakura
→ countless petals gather into LINH CHU while petal butterflies fly around it
→ one butterfly leaves the living name and leads toward a mysterious web cocoon
→ cocoon releases stars
→ stars write the sunset invitation
```

## Current Copy Density Problem

Scenes 2–4 still carry more copy than the visual story requires. Scene 5 is now deliberately wordless apart from the particle-built name. Scene 3 still contains both literary quotes and remains the primary copy-density decision.

The next revision should decide which narrative lines are essential and which scenes can communicate entirely through motion.
