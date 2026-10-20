# amywang2010/awang

Personal site. Two ways to read it:

- **The field** — a hand-drawn room, a walkable meadow, field notes, a map, and a guide on first arrival.
- **Professional resume** — the same content laid out as a conventional page. Reachable from the settings panel, the guide, or `?view=static`.

No build step, no framework, no bundler. Open `index.html` through a local server, or push to GitHub Pages.

## Local preview

```bash
python -m http.server 8080
# http://localhost:8080
```

A server is recommended so the Google Fonts and local assets behave the same as in production. The site also runs from the file system.

## Files

```
index.html          markup: desk scene (inline SVG), world shell, panels, settings
css/base.css        tokens, reset, cursor, shared controls
css/desk.css        the room, boot screen, bird, warp transition
css/world.css       field, ground, landmarks, player, HUD, touch controls
css/ui.css          field-note panels, settings, bubbles, cranes
css/static.css      professional resume
js/state.js         saved state, toasts, speech bubbles
js/content.js       all written content: bio, research, awards, work, projects
js/audio.js         synthesised music and sound effects (Web Audio)
js/character.js     the walker, built from SVG parts and animated in JS
js/desk.js          boot sequence, password, bird, way into the field
js/world.js         world geometry, ground painting, movement, camera
js/panels.js        field-note renderers and focus handling
js/static.js        professional resume renderers
js/eggs.js          paper cranes helpers, konami, the bird's name, console note
js/settings.js      settings panel
js/main.js          cursor trail, mode switching, HUD wiring
assets/             three photographs, compressed to WebP
```

## Editing

- **Words**: `js/content.js`. Both the field notes and the resume read from it.
- **Landmark positions**: the `SITES` array at the top of `js/world.js`. Positions are feet-anchored world coordinates in a 4200 × 3000 field.
- **Paths and ground**: `paintGround()` in `js/world.js`.
- **Colours and type**: the `:root` block in `css/base.css`.

## Saved state

Stored under `awang.field.v1` in `localStorage`: sound, music, volume, resume view, reduced motion, collected cranes, the unlocked garden, and the time of day. The reset row in settings clears the field-specific parts.

## Keyboard

- Arrow keys or WASD to walk. Hover a landmark to see what it is before you walk there; the map in the corner jumps you anywhere.
- Click the minimap, or walk with the on-screen stick on touch.
- `E` to open whatever is close.
- `J` for the journal, `G` for the guide.
- `M` to mute music.
- `Esc` to close a panel or settings.
- `Tab` moves through buttons; panels trap focus.

## Checks

The two scripts I use live outside the repo, but the invariants they cover are worth keeping in mind when editing: every landmark is hit-testable at its centre, every panel fits the viewport without horizontal scroll, all body text holds a 4.5:1 contrast ratio, the resume stays free of overflow, and the field holds 60fps while walking.

## Things that are hidden on purpose

A gate behind the cottage, seven paper cranes, an old sundial, a bird with opinions, and six things on the bench that change every time you sit down. Look around.

## Deployment

GitHub Pages serves the repository root from `main`. There is no build step to run.
