# PixelQuest

A tiny world full of big adventures.

PixelQuest is an original fictional portfolio game/demo built as a playful browser adventure. Players explore Whisperwood Village, the Old Forest Path, and the Ancient Ruins, collect items, talk to characters, solve quests, calm woodland creatures, complete puzzles, craft upgrades, unlock perks, and discover secrets through a colorful retro-modern interface.

## Overview

Phase 3 unlocks the Ancient Ruins as a third playable area and adds a dungeon-style exploration loop, branching dialogue, collectible sets, crafting, day/night presentation, and stronger world completion tracking. It remains frontend-only with local/mock game state.

## Gameplay

Start in Whisperwood Village, walk through the eastern gate to Old Forest Path, solve the Ancient Forest Shrine for the Old Forest Key, then unlock the Ruins Gate to enter the Ancient Ruins. The ruins include multiple rooms, smaller puzzles, Elyra the Archivist, a Stone Guardian trial, a sealed vault, night-only secrets, and relic collection goals.

## Features

- Animated title screen with world preview and continue summary
- Three playable areas: Whisperwood Village, Old Forest Path, and Ancient Ruins
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
- Branching Mira dialogue with remembered choices
- Elyra the Archivist and optional lore quest
- Dungeon-style ruins progression through Entrance Hall, Hall of Echoes, Rune Gallery, Flooded Chamber, Archivist Room, Moon Shrine, and Sealed Vault
- Stone Guardian pattern trial with sound-independent visual sequence
- Hall of Echoes and Flooded Chamber puzzles
- Crafting recipes for Moonberry Tonic, Forest Charm, and Explorer Pack
- Collections panel for Ancient Relics, Whisperwood Memories, secrets, and completion progress
- Day, Sunset, and Night presentation cycle with optional time-cycle setting
- Optional generated Web Audio ambience and sound effects
- Local progress persistence with save migration for older Phase 1/2 saves

## Quests

- The Missing Lantern: help Old Rowan recover his lantern.
- Whispers in the Woods: investigate Mira's strange forest lights, find three trail markers, inspect the abandoned camp, calm the Bramble Sprite, and return to Mira.
- Pip's Moonberries: collect five forest Moonberries for Pip.
- Echoes Beneath the Ruins: unlock the gate, enter the ruins, find rune fragments, solve the Hall of Echoes, reach the Moon Shrine, complete the Guardian trial, recover the Star Compass, and return to Mira.
- Fragments of Memory: find four lost inscriptions for Elyra the Archivist.

## Controls

- Move: `WASD` or `Arrow Keys`
- Interact: `E`
- Inventory: `I`
- Quest Log: `Q`
- Map: `M`
- Pause: `Escape`
- Cycle tracked quest: click the quest tracker in the HUD
- Crafting and Collections: use the HUD icons

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
  data/              Area, NPC, item, quest, achievement, encounter, puzzle, crafting, collection, and ruins data
  hooks/             Game state, local save, and movement logic
  styles/            Global visual system and responsive CSS
  App.jsx            Screen orchestration
  main.jsx           React entry point
```

The game state is grouped around player, current area, ruins room, day/night state, inventory, quests, achievements, discovered locations, puzzles, guardian state, crafting, collections, encounters, secrets, dialogue choices, panels, pause state, and settings. No backend, authentication, or cloud saving is included.

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
- Guardian and puzzle patterns are displayed in text and visuals, so audio is never required

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

The UI now includes title, HUD, map, inventory, character, quest, dialogue choice, encounter, guardian trial, puzzle, crafting, collections, settings, transition, achievement, and level-up moments that can be captured later for a UI/UX case study.

## Roadmap

- Add richer character portraits and longer branching dialogue arcs
- Add a fourth area beyond the Sealed Vault
- Add more craftable utility items and temporary perks
- Add optional generated-safe ambient music refinements
- Add route hints for 100% completion
- Add screenshot captures after visual QA
