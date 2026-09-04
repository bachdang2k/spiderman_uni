# SPIDER STICKER ART DIRECTION

Status: reference direction only. Do not implement until the story script is approved.

## Objective

Replace the current single, simple web-hero illustration with a layered sticker language that feels collected from a Spider-Verse-inspired sketchbook: playful, tactile, imperfect, cinematic, and slightly punk.

The system must remain original. It may reference comic-print techniques and web-hero motifs, but it must not trace official character art, reuse logos, or copy commercial sticker designs.

## Visual Construction

Every sticker should combine at least three of these treatments:

- irregular die-cut silhouette;
- warm-white paper border, approximately `3–5px` at rendered desktop size;
- screen-print halftone shading;
- red/cyan or red/navy misregistered ink edge;
- subtle paper grain and scratched ink;
- a small folded or peeled corner;
- directional shadow that makes the sticker feel physically attached;
- one deliberately imperfect contour rather than a mathematically clean shape.

## Core Sticker Pack

### Character stickers

1. Tiny masked web hero hanging upside down with a flower.
2. Web hero peeking into the frame from one edge.
3. Crouching web hero looking at a suspicious signal.
4. Web hero being pulled sideways by an overenthusiastic web line.

Character proportions should be cute and expressive, but the ink treatment should remain editorial rather than childish.

### Graphic stickers

5. Angular mask-eye badge with red/cyan offset printing.
6. `THWIP` as an irregular comic burst, not plain text.
7. Spider Sense arcs drawn like rough radio waves.
8. A compact web-shooter cartridge diagram with fake technical markings.
9. A torn halftone panel fragment with speed lines.
10. A hand-drawn web knot or web target.
11. A small dimensional portal stamp labeled `DIMENSION 06`.
12. A scratched signal label: `WEB SIGNAL / FOUND`.

### Micro stickers

13. Cross-shaped lens flares.
14. Registration marks and tiny print calibration crosses.
15. Red arrows, circles, underlines, and handwritten question marks.
16. Small strips of translucent comic tape.

## Scene Placement

### Scene 0 — The Web

- One peeking web hero at an outer edge.
- One mask-eye badge near the progress indicator.
- One `THWIP` burst that appears only after interaction.
- Torn panel corners may frame the transition.

### Scene 1 — Spider Sense

- Spider Sense arc sticker behind the title.
- Web-shooter cartridge diagram as a secondary detail.
- Hand-drawn circles or arrows may react to wrong selections.

### Scene 2 — Wonder / Woman

- One small web hero sticker observing the heroine from a safe distance.
- `WEB SIGNAL / FOUND` appears like a pasted field note.
- Comic tape and registration marks connect this scene to the opening.

### Scene 3 — Galaxy Six

- `DIMENSION 06` is the final major Spider sticker.
- Sticker paper edges begin dissolving into stars as the portal opens.
- No character sticker should sit on top of the galaxy itself.

### Scene 4 — Rain Impact

- The last remaining paper sticker becomes wet.
- Ink softens and bleeds subtly when the raindrop hits the flower.
- From this exact point onward, the sticker language fades out and the sakura visual world takes over.

## Density Rules

- Desktop: maximum four prominent stickers visible at once.
- Mobile: maximum two prominent stickers plus two micro marks.
- Never place stickers over narrative text, primary interactions, the galaxy silhouette, or Linh Chu’s name.
- Character stickers appear at edges and react to the scene; they do not become the central subject.
- At least `24px` of visual separation between a sticker border and any readable copy on mobile.

## Motion Language

- Entry: peel, slide, imperfect paper settle, or masked paste-on reveal.
- Interaction: ink misregistration briefly separates and snaps back.
- Exit: paper tears, curls, gets pulled away by a web, or dissolves into halftone dots.
- Avoid bounce loops and repeated floating.
- Character poses may blink or tilt once, then remain mostly still.

## Responsive Strategy

- Use SVG for the sticker body and CSS masks/textures for grain.
- Keep paper borders visually consistent with `vector-effect="non-scaling-stroke"` where needed.
- Character stickers use `clamp(72px, 10vw, 140px)` on landscape screens and approximately `64–88px` on mobile.
- Crop a sticker deliberately at the viewport edge instead of shrinking every sticker into insignificance.
- Reduce halftone frequency and shadow blur on low-density mobile screens.

## Reference Findings

The reviewed sticker ecosystems consistently mix dynamic character poses, comic sound-effect bursts, mask symbols, graffiti, holographic or offset-print effects, and multiple sticker sizes. The desired result is a coherent mixed pack rather than several copies of the same character drawing.
