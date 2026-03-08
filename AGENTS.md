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
