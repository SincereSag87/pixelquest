# PixelQuest

A tiny world full of big adventures.

PixelQuest is an original fictional portfolio game/demo built as a playful browser adventure. It is a frontend-only React/Vite game about exploring Whisperwood, helping memorable characters, solving gentle puzzles, collecting relics, crafting utilities, and restoring an ancient sanctuary.

## Overview

PixelQuest is designed as a GitHub portfolio project, a future CodePen-compatible playable slice, and a Dribbble UI/UX case study. It uses local/mock state only: no backend, authentication, multiplayer, or copyrighted assets.

## Story

Whisperwood's strange lights lead from a quiet village into an old forest, beneath ancient ruins, and finally into Starfall Sanctuary. The final discovery reframes the mystery: the energy below Whisperwood is not a threat, but a weakening protective force. The player chooses whether to preserve, share, or renew it.

## Areas

- Whisperwood Village: starter village, NPCs, first quest, campfire, pond, cottages.
- Old Forest Path: woodland trail, shrine, creek, abandoned camp, encounters, secrets.
- Ancient Ruins: dungeon-style rooms, Elyra, inscriptions, Guardian trial, sealed vault.
- Starfall Sanctuary: celestial bridge, garden, observatory, constellation gate, final chamber.

## Gameplay Systems

- Area-aware exploration with boundaries, obstacles, and transitions
- Local save/continue with migration through save version 4
- NPC dialogue with lightweight branching choices
- Quests with active/completed state, objective counts, and HUD tracking
- Non-violent encounters and boss-style puzzle encounter
- Environmental inspection and lore
- Shrine, echo, flooded chamber, Guardian, and constellation puzzles
- Inventory with tabs, rarity, details, and usable items
- Crafting, collections, secrets, badges, and world completion
- Leveling through Level 4, energy, perks, and character stats
- Character customization for outfit, accessory, and badge
- Day/sunset/night presentation cycle
- Optional Web Audio API tones and ambience cues
- Endgame summary and post-game exploration

## Quests

- The Missing Lantern
- Whispers in the Woods
- Pip's Moonberries
- Echoes Beneath the Ruins
- Fragments of Memory
- The Last Light of Whisperwood

## Encounters

Mossling, Bramble Sprite, and the Stone Guardian use observe/calm/defend/pattern actions instead of traditional combat.

## Puzzles

Puzzle mechanics are sound-independent and always expose text clues: rune order, visual echo sequence, switch sequence, Guardian pattern, and the final constellation path.

## Crafting

Recipes include Moonberry Tonic, Forest Charm, Explorer Pack, Star Tonic, Rune Lens, Explorer Beacon, and Traveler Snack.

## Collections

Collections track Ancient Relics, Celestial Relics, Whisperwood Memories, secrets, badges, and completion rewards without revealing exact hidden locations.

## Progression

The player gains XP, levels up, restores energy, earns badges, unlocks perks, and tracks play time, steps, items, coins, quests, puzzles, creatures calmed, secrets, areas, crafted items, and NPCs helped.

## Controls

- Move: `WASD` or `Arrow Keys`
- Interact: `E`
- Inventory: `I`
- Quest Log: `Q`
- Map: `M`
- Pause: `Escape`
- Cycle tracked quest: click the HUD quest tracker
- Crafting, Collections, Character, Customization, Hints, Settings: HUD icons

Mobile and tablet layouts include on-screen directional controls and an interaction button.

## Save System

Progress is persisted in `localStorage`, including current area, sub-location, player stats, inventory, quests, achievements, puzzles, Guardian/final trial state, crafting, collections, day/night, customization, settings, final choice, story completion, and post-game state. Older Phase 1-3 saves are migrated safely with defaults.

## Accessibility

- Semantic buttons and dialog roles
- Keyboard-accessible menus, choices, puzzles, and final story choice
- Visible focus states
- ARIA live regions for feedback
- Text-based puzzle clues and Guardian patterns
- Sound-independent puzzle solving
- Non-color status, rarity, and completion labels
- Reduced-motion support and in-game reduced effects toggle
- Sound, music, completion hint, time cycle, and presentation toggles
- Large touch targets for mobile controls

## Responsive Design

The game is desktop-first but playable on tablet and mobile. Panels use responsive grids, the HUD wraps, and overlays are constrained to avoid horizontal overflow.

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- lucide-react
- Web Audio API
- localStorage

## Architecture

```text
src/
  components/game/   World, HUD, panels, encounters, puzzles, ending, controls
  data/              Areas, quests, items, NPCs, achievements, crafting, collections
  hooks/             Game state, movement, local save
  styles/            Global visual system and responsive CSS
  App.jsx            Screen and overlay orchestration
  main.jsx           React entry
```

## Local Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Screenshots

Screenshots belong in `docs/screenshots/`. No screenshots are fabricated in this repository.

## CodePen

Live CodePen Demo: Coming soon

The repository includes a smaller standalone playable CodePen slice of PixelQuest:

```text
codepen/
  index.html
  style.css
  script.js
```

This demo is intentionally separate from the full React/Vite game. It uses plain HTML, CSS, and browser JavaScript with no bundler, JSX, React, npm imports, or external game engine. The slice focuses on a quick Whisperwood Village adventure with Mira, one collectible, one short quest, one rune puzzle, inventory, quest log, achievement feedback, pause/help controls, mobile controls, and dedicated demo `localStorage`.

For a future CodePen post, paste `codepen/index.html` into the HTML panel, `codepen/style.css` into the CSS panel, and `codepen/script.js` into the JavaScript panel. The full production game should stay in the app source rather than being flattened into CodePen.

## Dribbble

Recommended final shots:

1. PixelQuest title and animated world preview
2. Whisperwood Village gameplay
3. Old Forest Path encounter
4. Ancient Ruins Guardian trial
5. Starfall Sanctuary finale
6. Inventory, quests, crafting, and collections UI

## Portfolio Disclaimer

PixelQuest is an original fictional portfolio game/demo. All world concepts, characters, UI, and CSS/SVG/HTML artwork are original to this project.
