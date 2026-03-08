# AGENTS.md — 3D Cube Menu Style Guide

This document defines the strict visual and interaction rules for the 3D Cube Menu project. These rules **must not be violated** unless the user explicitly overrides them.

---

## Inspiration

Inspired by the Nintendo GameCube console menu. The cube floats in a dark void, minimal and geometric, with spring-themed lavender and lilac color accents. The void evokes a spring night sky — dark but with a faint lilac warmth. The aesthetic balances futuristic precision with approachable warmth.

---

## Core Principles

1. **Void first.** The cube floats in near-black empty space. The background is never bright, never busy. Emptiness is a feature.
2. **The cube is the only element.** No headers, footers, sidebars, or HUD chrome. The cube occupies the center of the viewport and nothing competes with it.
3. **Geometric precision.** All motion is mathematically exact — 90° rotations, centered alignment, symmetrical layout. Nothing is approximate.
4. **Restraint over decoration.** No gradients that scream, no excessive glow, no particle effects unless explicitly requested. Subtlety always wins.

---

## Color Rules

| Role | Value | Notes |
|---|---|---|
| Background | `#0a0812` | Near-black with a warm purple undertone |
| Background accents | Lavender ≤ 9%, lilac ≤ 7%, mint ≤ 4% | Radial gradients, lavender/lilac dominant |
| Cube faces | Semi-transparent (10–15% opacity) | Lavender/lilac primary, mint minor accent |
| Cube border | White at 25% opacity | Thin (1px), never thick or colored |
| Text | White at 85% opacity | Never colored, never bold-colored |
| Text hover glow | Lavender-tinted white at ≤ 90% opacity | Subtle `text-shadow` only |
| Cube glow | Lilac ≤ 12% inner + lavender ≤ 8% outer | Two-layer soft `box-shadow`, never harsh |

### Palette guardrails
- Lavender/lilac is the **primary accent**, representing up to ~45% of the visible palette.
- Mint green and other spring tones (pale pink, baby blue) are **secondary accents** that complement the lavender/lilac.
- The overall impression should be "frosted lilac glass floating in a spring night."
- High-saturation colors are **forbidden** unless the user explicitly requests them.

---

## Typography Rules

- Font: system sans-serif stack (`'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`)
- Menu labels: `uppercase`, `letter-spacing: 3px`, `font-weight: 600`, `font-size: ~0.95rem`
- Text appears **digitally printed on the cube face** — it is part of the surface, not floating above it.
- No drop shadows on text. Only subtle `text-shadow` glow on hover.
- Back arrows use Unicode arrow characters (←, →, ↑, ↓), not icons or images.

---

## Text Positioning on the Front Face

Each menu option is positioned at the **edge of the cube face** that corresponds to its navigation direction. The text baseline faces outward toward that edge.

| Option | Edge | CSS rotation | Meaning |
|---|---|---|---|
| Right-facing option | Right edge | `rotate(90deg)` | Baseline points right |
| Left-facing option | Left edge | `rotate(-90deg)` | Baseline points left |
| Top-facing option | Top edge | `rotate(180deg)` | Baseline points up |
| Bottom-facing option | Bottom edge | None | Baseline points down (natural) |

This layout communicates direction intuitively — each label sits at the edge the cube will turn toward when clicked.

---

## Cube Geometry

- Cube size: **300×300px** (desktop), scales down responsively
- Half-size (translateZ offset): **150px**
- `perspective`: **900px**, applied on the `.scene` container
- `transform-style: preserve-3d` on the `.cube` element
- `backface-visibility: hidden` on all faces
- Border radius on faces: **12px** (futuristic dice aesthetic)

### Face transforms (positioning each face in 3D space)

```
face-front:  rotateY(   0deg) translateZ(150px)
face-back:   rotateY( 180deg) translateZ(150px)
face-right:  rotateY(  90deg) translateZ(150px)
face-left:   rotateY( -90deg) translateZ(150px)
face-top:    rotateX(  90deg) translateZ(150px)
face-bottom: rotateX( -90deg) translateZ(150px)
```

### Show transforms (rotating the cube to reveal a face)

The show transform is the **negative** of the face's rotation. This brings the target face to the front.

```
show-front:  translateZ(-150px) rotateY(    0deg)
show-back:   translateZ(-150px) rotateY( -180deg)
show-right:  translateZ(-150px) rotateY(  -90deg)
show-left:   translateZ(-150px) rotateY(   90deg)
show-top:    translateZ(-150px) rotateX(  -90deg)
show-bottom: translateZ(-150px) rotateX(   90deg)
```

**Critical:** The show rotation must always be the negation of the face rotation. Swapping these causes the wrong face to appear and breaks navigation.

---

## Animation Rules

### Cube rotation
- **Duration:** `0.9s`
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design standard easing — fast out, slow in)
- **Property:** `transform` on the `.cube` element via CSS `transition`
- **Lock-out period:** Clicks are ignored for **950ms** after a rotation starts. This prevents double-rotations and state corruption.

### What the rotation must look like
- The cube rotates as a **rigid body** — all six faces move together.
- Rotation is always exactly **90°** (or 180° for back face). Never partial, never overshoot.
- The motion should feel **weighted** — it accelerates gently, decelerates firmly. The easing curve achieves this.
- There must be **no bounce, no elastic overshoot, no wobble**. The cube settles cleanly into position.

### What is forbidden in animation
- No CSS `@keyframes` animations on the cube rotation itself. Use `transition` only.
- No JavaScript-driven frame-by-frame animation (no `requestAnimationFrame` for cube movement).
- No spring physics, no jiggle, no idle floating/bobbing.
- No mouse-follow parallax on the cube. The cube is still until the user acts.
- No entrance animation. The cube is simply there when the page loads.

### Hover effects
- Menu options: `text-shadow` glow appears on hover, `0.25s` transition
- Back arrows: `scale(1.12)` on hover, `0.25s` transition, subtle `box-shadow` glow
- Active state: `scale(0.95)` for tactile press feedback

---

## Back Arrow Rules

- Each empty face has **exactly one** back arrow.
- The arrow character indicates the **direction the cube will visually turn** when pressed.
- The arrow is positioned at the **edge closest to the front face**:

| Face shown | Arrow character | Arrow position |
|---|---|---|
| Right | ← | Left edge (faces toward front) |
| Left | → | Right edge (faces toward front) |
| Top | ↓ | Bottom edge (faces toward front) |
| Bottom | ↑ | Top edge (faces toward front) |

- Arrow positioning uses `position: absolute` with `margin-top` or `margin-left` for centering. **Never use `transform: translate()` for positioning** — it conflicts with hover transforms.
- Arrow is a **56×56px circle** with a 1px white border at 25% opacity.

---

## Interaction Rules

1. Clicking a menu option on the front face rotates to the corresponding face.
2. Clicking a back arrow on any face returns to the front face.
3. During rotation, all clicks are ignored (950ms lock-out).
4. Keyboard support: Arrow keys navigate from the front face; Escape always returns to front.
5. The game **never ends**. There is no win/lose state. The user closes the tab to stop.

### Birthday branch rules

The top front option can branch into a dedicated submenu experience inspired by the GameCube memory card grid.

1. The **top** front option label is exactly `birthday` in lowercase.
2. Clicking `birthday` from the front face rotates the cube to the **top** first, then transitions into the birthday grid view.
3. Birthday view is a **3×3 grid** of mini cubes. No headers, no extra UI chrome.
4. Mini cubes are intentionally **empty-looking** for now (no photos/thumbnails yet).
5. Mini cubes use restrained hover motion only: slight grow/lift and subtle glow; on leave, they return to rest smoothly.
6. Birthday view has one back control: a **down arrow** (`↓`) in the standard 56×56 circular arrow style.
7. Clicking the birthday back arrow returns to cube mode, then rotates the cube back down to the front menu.
8. `Escape` in birthday view triggers the same back sequence.
9. During birthday enter/exit transitions, clicks are locked out to avoid state corruption.

### Birthday text appearance

The `birthday` label on the front face **overrides** the default `.edge-top` rotation. Normal top-edge options use `rotate(180deg)` so the text baseline points upward. The birthday label instead:

- Uses `text-transform: lowercase` (never uppercase, unlike other menu options).
- Removes the `rotate(180deg)` — the text reads naturally left-to-right with the **top of the glyphs aligned to the top cube edge**.
- Keeps `translateX(-50%)` for horizontal centering.
- Sets `padding-top: 0` and `line-height: 1` so the text sits flush against the top edge.
- Implemented via `.menu-option.edge-top.birthday-option` (high specificity to override `.edge-top`).

### Birthday transition rules

Transitions use a **spring-flash overlay** — a bright radial bloom that masks state swaps.

**Critical rendering rule:** The flash element (`.birthday-flash`) must be a **real DOM element** placed **after** the `.cube` in DOM order inside `.scene`. Never use a `::before`/`::after` pseudo-element for the flash — pseudo-elements render behind 3D-transformed children due to CSS stacking context rules with `perspective`, making the flash invisible until the cube fades.

**Flash element:**
- 400×400px radial gradient circle, centered on the scene (`left: 50%; top: 50%`)
- Gradient: white core (95%) → lavender → lilac → pink → mint → transparent
- `filter: blur(2px)`, `z-index: 40`, `pointer-events: none`
- Two keyframe animations: `birthday-flash-open` (0.5s, for enter) and `birthday-flash` (0.55s with hold-at-peak, for exit)

**Enter transition (front → birthday grid):**
1. Cube rotates to top face (950ms standard rotation).
2. ~50ms before rotation ends: fire opening flash (`is-flash-opening`), add `is-birthday-opening` to scene (triggers shell expansion — faces spread to 164px/170px translateZ, cube-face glow brightens).
3. ~150ms after flash starts: add `is-birthday-grid` (cube fades to `opacity: 0` via CSS transition, grid fades in via CSS transition).
4. ~280ms later: remove opening classes. Grid is fully visible.
5. Opening transitions use **CSS transitions** for cube fade and grid emergence.

**Exit transition (birthday grid → front):**
1. Fire closing flash (`is-flash-closing`) — uses `birthday-flash` keyframe with a **hold-at-peak** window (opacity 1 from 15%–40% of 0.55s = ~80ms–220ms).
2. At **~100ms** (flash at peak brightness): perform **instant swap** behind the flash:
   - Set `transition: none` inline on cube and grid elements.
   - Snap cube to `show-front` and remove `is-birthday-grid`.
   - Force reflow, then clear inline transitions.
3. Flash continues fading out (~330ms remaining), revealing the cube already at front face.
4. At ~560ms: remove flash class.
5. Exit transitions use **no CSS transitions** — the swap is instant. The flash alone provides the visual bridge.

**Why enter and exit differ:** The enter path can use gradual CSS transitions because the flash masks the initial moment and the grid emergence is visually pleasing as a cascade. The exit path must be **instant** because any CSS transition on the cube (opacity, filter, transform) causes visible stutter — the cube's 3D face transforms, blur clearing, and opacity changes all compete and create jarring visual artifacts. The flash's hold-at-peak window provides enough time to swap everything invisibly.

---

## Sound Rules

- Rotation triggers a short sine-wave sweep: start frequency → half frequency over 0.15s, then fade to silence by 0.2s.
- Forward navigation (front → other face): **440 Hz** start.
- Return navigation (other face → front): **330 Hz** start.
- Volume: quiet (`gain: 0.08`). Sound should be noticeable but never jarring.
- Sound creation uses the **Web Audio API** (`AudioContext`). No audio files.
- Sound failures are silently caught (`try/catch`). The game must never break due to audio.

---

## File Structure

```
index.html   — Game markup (no wrapper divs, no header/footer)
styles.css   — All visual styling (no inline styles, no JS-injected styles)
script.js    — Interaction logic only (no DOM creation, no style manipulation)
AGENTS.md    — This file
```

- **No external dependencies.** No libraries, no CDNs, no build tools.
- **No server required.** The game runs by opening `index.html` directly.
- CSS handles all visual concerns. JS handles only state and events.

---

## Terrarium Rules

A miniature spring nature diorama lives inside the cube, visible through the semi-transparent faces.

### Art style
- **Charming and cartoony.** Studio Ghibli meadow meets Animal Crossing.
- Shapes are **rounded and chunky** — oversized circles, fat ovals, stubby stems.
- Shading is **cel-style** — flat base color + one flat highlight + one flat shadow per object. No photorealistic gradients.
- Scale is **toylike** — the tree canopy is disproportionately large, the bee is almost as big as a flower. Charm over accuracy.

### Structure
- The `.terrarium` div is a child of `.cube`, sitting at Z=0 (the 3D center).
- `transform-style: preserve-3d` on `.terrarium` — elements are positioned at different Z-depths for true 3D parallax.
- It rotates with the cube automatically (no extra JS needed).
- `pointer-events: none` on the entire terrarium — it must never block face clicks.
- Elements spread across Z range of approximately **-60px to +60px** from center.
- Bee and butterfly use `translate3d()` flight paths that move through all three axes.
- When the cube rotates, you see the same scene from a different angle — elements at different depths shift relative to each other.

### 3D techniques
- **Horizontal planes**: Ground, hills, and stream use `rotateX(90deg)` to lay flat as horizontal surfaces. They remain visible from all viewing angles.
- **Cross-plane (sprite cross)**: Tree trunk, tree canopy, flower stems, flower heads, and grass blades each have a `::after` pseudo-element rotated `rotateY(90deg)`. This creates two perpendicular planes forming an X shape (viewed from above), ensuring the element is visible from any horizontal angle. Classic 3D vegetation technique.
- **CSS custom properties for Z**: Flowers and grass use `--z` custom properties so their `@keyframes` animations can include the correct `translateZ()` value alongside scale/rotate transforms.
- **3D flight paths**: Bee and butterfly use `translate3d()` in their keyframes, weaving through all three axes.
- **Shadows**: Tree and flower shadows use `rotateX(90deg)` to lie flat on the ground plane.

### Critical 3D rules — NEVER VIOLATE

These rules exist because violating them causes elements to appear as flat 2D planes when the cube rotates, breaking the 3D illusion.

1. **Every visible element must be 3D.** No element may be a single flat plane that vanishes when viewed edge-on. Every element must use one of the approved 3D techniques below.

2. **Approved 3D techniques (use one per element):**
   - **Horizontal plane** (`rotateX(90deg)`) — for surfaces that lie flat: ground, stream, shadows, light overlay. These remain visible from front and side views.
   - **Cross-plane** (`::after` with `rotateY(90deg)`) — for standing objects: trees, flowers, grass, hills. Two perpendicular planes form an X (viewed from above), ensuring visibility from any horizontal angle. The parent element **must** have `transform-style: preserve-3d`.
   - **3D flight path** (`translate3d()` in `@keyframes`) — for flying creatures: bee, butterfly. The animation itself moves the element through all three axes.
   - **Tiny particles** — pollen, sparkles, petals are small enough (3–8px) that being a single plane is acceptable. They use `translate3d()` in their individual `@keyframes` for 3D drift.

3. **`translateY` math for horizontal planes is critical.** The formula is: `finalY = elementCenterY + translateYValue`. The element center Y = `top + height/2` (for `top`-positioned elements) or computed from `bottom`. The ground plane sits at approximately **Y=205**. All horizontal planes (stream, shadows, light overlay) must have their `translateY` calculated so they land at or near Y=205. Getting this wrong causes floating 2D discs visible from the side.

4. **Hills are cross-plane domes, NOT horizontal planes.** Hills use semicircular shapes (`border-radius: Npx Npx 0 0`) with the cross-plane `::after` technique. They sit at ground level (`bottom: 30%`) and use `translateZ()` for depth positioning. A horizontal-plane hill vanishes when viewed from the side; a cross-plane dome does not.

5. **Cross-plane `::after` rules:**
   - `content: ''`, `position: absolute`, `inset: 0`
   - `background: inherit`, `border-radius: inherit`, `box-shadow: inherit` (or similar shading)
   - `transform: rotateY(90deg)`
   - The parent **must** have `transform-style: preserve-3d`

6. **CSS custom properties for animated Z-positioned elements.** When an element has both a `translateZ()` position and a `@keyframes` animation that sets `transform`, the animation overrides the static transform. Solution: use a `--z` custom property on the element and include `translateZ(var(--z, 0px))` in every keyframe that sets `transform`. This applies to flowers (`scale`) and grass (`rotate`).

7. **The light overlay is a horizontal plane, not a flat panel.** It uses `rotateX(90deg)` positioned at ground level to simulate a light pool on the ground. A flat vertical panel is immediately visible as a 2D rectangle when the cube rotates.

8. **No flat vertical panels allowed for environmental elements.** If an element looks correct from the front but appears as a thin line or floating rectangle from the side, it is wrong. Fix it using one of the approved 3D techniques above.

### Nature elements
- **Ground**: horizontal plane (`rotateX(90deg)`) with radial gradient, ~280×280px ellipse at Y≈205
- **Hills** (2): cross-plane semicircle domes at ground level, different Z-depths
- **Tree**: cross-plane trunk + cross-plane canopy, `transform-style: preserve-3d` chain
- **Flowers** (3): cross-plane stems + cross-plane heads, `--z` custom property for animated Z positioning
- **Stream**: horizontal plane on the ground surface, shimmer animation on `background-position`
- **Grass** (5): cross-plane blades, `--z` custom property for animated Z positioning
- **Bee**: 3D flight path via `translate3d()`, wings via `::before`
- **Butterfly**: 3D flight path via `translate3d()`, wings via `::before`/`::after`

### Lighting & shading
- **Light overlay**: horizontal plane (`rotateX(90deg)`) at ground level — radial gradient simulating a warm sunlight pool. **Not a flat vertical panel.**
- **Object highlights**: `inset box-shadow` lighter on top-left of each major shape
- **Ground shadows**: `rotateX(90deg)` ellipses beneath tree and flowers, lying flat on the ground plane
- **Light source direction**: soft top-left (warm spring sunlight entering the terrarium)

### Particle effects
- **Pollen** (5): tiny white circles floating upward via individual `@keyframes` with `translate3d()`, 8–12s loops, staggered delays
- **Sparkles** (3): 3px white dots that pulse opacity, 5–7s loops
- **Falling petals** (2): pink/lavender shapes tumbling down via individual `@keyframes` with `translate3d()`, 10–14s loops
- All particles use unique `animation-delay` values — never synchronized
- Each pollen and petal has its **own named `@keyframes`** (e.g., `pollen-float-1` through `pollen-float-5`) to give each a unique 3D path

### Animation constraints
- All terrarium animations use `@keyframes` — this is allowed because they are decorative scene elements, not cube rotation.
- Animations are `ease-in-out` with gentle timing (2–14s loops). Never frantic.
- The terrarium is **always animating** — it does not pause when the cube rotates.
- No JavaScript is used for terrarium animation. CSS only.

---

## Responsive Behavior

- The cube scales down on smaller viewports but the **rules above still apply**.
- Reduce cube size and `translateZ` proportionally (e.g., 250px/125px at 768px, 200px/100px at 480px).
- Never switch to a non-3D fallback. The cube must always be 3D.

---

## Modification Protocol

These rules are **immutable defaults**. To change any rule:
1. The user must **explicitly request** the change.
2. The change must be acknowledged before implementation.
3. This document should be updated to reflect the new rule.

Do not silently deviate from these rules to "improve" the design. If a rule seems wrong, ask the user before changing it.
