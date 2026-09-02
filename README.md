# PixelQuest

A tiny world full of big adventures.

PixelQuest is an original fictional portfolio game/demo built as a playful browser adventure. Players explore Whisperwood Village and the Old Forest Path, collect items, talk to characters, solve quests, calm woodland creatures, complete a shrine puzzle, unlock perks, and discover secrets through a colorful retro-modern interface.

## Overview

Phase 2 expands the playable foundation into a richer lightweight adventure for a GitHub portfolio project, a future CodePen-compatible demo, and a Dribbble UI/UX case study. It remains frontend-only with local/mock game state.

## Gameplay

Start in Whisperwood Village, then walk through the eastern ruins gate to unlock Old Forest Path. The forest adds a winding trail, creek crossing, abandoned camp, ancient shrine, locked ruins, hidden items, and creature encounters.

## Features

- Animated title screen with world preview and continue summary
- Two playable areas: Whisperwood Village and Old Forest Path
- Area transition title card and progress persistence
- CSS-built environments with cottages, trees, creek, cart, shrine, camp, mushrooms, ruins, and ambient effects
- Keyboard and mobile movement controls
- Player boundaries and practical obstacle blocking
- NPC proximity prompts and dialogue panel
- Quest log with active/completed state and multi-step objective progress
- HUD quest tracker with progress and quest cycling
- Character panel with level, XP, health, energy, badge, perks, coins, and adventure stats
- Encounter system with Observe, Defend, Calm, Use Item, and Flee
- Shrine puzzle with rune sequence, clue, reset, submit, and reward
- Hidden items and secrets tracking
- Inventory category tabs, rarity labels, item details, and Moonberry energy restore
- Map overlay with discovered, undiscovered, locked, and current-area states
- Achievement and level-up banners
- Settings panel with music, sound effects, volume, reduced effects, prompts, and reset
- Local progress persistence with save migration for older Phase 1 saves

## Quests

- The Missing Lantern: help Old Rowan recover his lantern.
- Whispers in the Woods: investigate Mira's strange forest lights, find three trail markers, inspect the abandoned camp, calm the Bramble Sprite, and return to Mira.
- Pip's Moonberries: collect five forest Moonberries for Pip.

## Controls

- Move: `WASD` or `Arrow Keys`
- Interact: `E`
- Inventory: `I`
- Quest Log: `Q`
- Map: `M`
- Pause: `Escape`
- Cycle tracked quest: click the quest tracker in the HUD

Mobile and tablet layouts include on-screen directional controls and an interaction button.

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- lucide-react
- Web Audio API tones for optional sound effects
- localStorage for mock progress and settings

## Architecture

```text
src/
  components/game/   Playable UI, world, overlays, HUD, controls
  data/              Area, NPC, item, quest, achievement, encounter, and puzzle data
  hooks/             Game state, local save, and movement logic
  styles/            Global visual system and responsive CSS
  App.jsx            Screen orchestration
  main.jsx           React entry point
```

The game state is grouped around player, current area, inventory, quests, achievements, discovered locations, puzzles, encounters, secrets, dialogue, panels, pause state, and settings. No backend, authentication, or cloud saving is included.

## Accessibility

- Semantic buttons and dialog roles for menus and panels
- Keyboard-accessible menu controls and shortcuts
- Accessible encounter and puzzle action buttons
- Puzzle clue presented as readable text
- Visible focus styles
- High-contrast HUD and panel surfaces
- Reduced-motion media query and in-game reduced effects toggle
- Non-color quest, rarity, and map status labels
- ARIA labels/live regions for gameplay feedback
- Sound effects can be disabled

## Responsive Design

Desktop is the primary experience. Tablet and mobile layouts preserve playable controls with a compact HUD, full-width panels, virtual directional buttons, and a large interaction button. Panels and puzzle/encounter controls avoid horizontal overflow.

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

The UI now includes title, HUD, map, inventory, character, quest, dialogue, encounter, puzzle, settings, transition, achievement, and level-up moments that can be captured later for a UI/UX case study.

## Roadmap

- Add the locked ruins as a third playable area
- Add richer character portraits and branching dialogue
- Add optional ambient music with generated-safe audio
- Add more non-violent encounter outcomes
- Add secret completion percentage and collectible sets
- Add screenshot captures after visual QA
