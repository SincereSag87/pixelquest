# PixelQuest

A tiny world full of big adventures.

PixelQuest is an original fictional portfolio game/demo built as a playful browser adventure. Players explore Whisperwood Village, collect items, meet characters, complete a starter quest, and unlock achievements through a colorful retro-modern interface.

## Overview

This Phase 1 build creates the playable foundation for a GitHub portfolio project, a future CodePen-compatible demo, and a Dribbble UI/UX case study.

## Gameplay

Start in Whisperwood Village, a peaceful forest village on the edge of an ancient woodland. Move the Explorer around the map, talk to Mira, Old Rowan, and Pip, collect village items, and complete Rowan's quest, The Missing Lantern.

## Features

- Animated title screen with original PixelQuest logo treatment
- CSS-built starter world with cottages, trees, pond, campfire, path, signpost, and ruins gate
- Keyboard and mobile movement controls
- Player boundary checks and practical obstacle blocking
- NPC proximity prompts and dialogue panel
- Collectible items with inventory updates and feedback toasts
- Quest log with active/completed state and objective progress
- Stylized map overlay with locked Phase 1 locations
- Achievement system with unlock banners
- Pause menu, help panel, restart, title return, and continue support
- Local progress persistence with `localStorage`

## Controls

- Move: `WASD` or `Arrow Keys`
- Interact: `E`
- Inventory: `I`
- Quest Log: `Q`
- Map: `M`
- Pause: `Escape`

Mobile and tablet layouts include on-screen directional controls and an interaction button.

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- lucide-react
- localStorage for mock progress

## Architecture

```text
src/
  components/game/   Playable UI, world, overlays, HUD, controls
  data/              NPC, item, quest, achievement, and world data
  hooks/             Game state, local save, and movement logic
  styles/            Global visual system and responsive CSS
  App.jsx            Screen orchestration
  main.jsx           React entry point
```

The game state is grouped around player, inventory, quests, achievements, dialogue, panels, and pause state. No backend, authentication, or cloud saving is included in Phase 1.

## Accessibility

- Semantic buttons and dialog roles for menus and panels
- Keyboard-accessible menu controls and shortcuts
- Visible focus styles
- High-contrast HUD and panel surfaces
- Reduced-motion media query
- Non-color quest indicators using checkbox symbols and text labels
- ARIA labels/live regions for gameplay feedback

## Responsive Design

Desktop is the primary experience. Tablet and mobile layouts preserve playable controls with a compact HUD, full-width panels, virtual directional buttons, and a large interaction button.

## Local Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Screenshots

Screenshots belong in `docs/screenshots/`. None are fabricated in this repository.

## CodePen

The current implementation is intentionally frontend-only and local-state driven so a future distilled demo can be adapted for CodePen.

## Dribbble

The Phase 1 UI is structured around title, HUD, map, inventory, quest, dialogue, and achievement moments that can be captured later for a UI/UX case study.

## Roadmap

- Add the Old Forest Path as a second playable area
- Add richer character portraits and expanded dialogue choices
- Add sound effects and optional music controls
- Add more quests, secrets, and collectible sets
- Add save-slot export/import for demos
- Capture real screenshots after visual QA
