(() => {
  if (window.__PIXELQUEST_CODEPEN_LOADED__) return;
  window.__PIXELQUEST_CODEPEN_LOADED__ = true;

  const SAVE_KEY = "pixelquest-codepen-save-v1";
  const rootId = "game-root";
  const bounds = { minX: 4, maxX: 96, minY: 8, maxY: 92 };
  const data = {
    npc: {
      id: "mira",
      name: "Mira the Cartographer",
      x: 49,
      y: 42,
      dialogue: "Welcome to Whisperwood. I dropped a map fragment near the old pond. Think you can find it?",
    },
    collectible: {
      id: "mapFragment",
      name: "Map Fragment",
      x: 79,
      y: 63,
      description: "A torn piece of Mira's hand-drawn village map.",
    },
    puzzle: {
      id: "pondRunes",
      name: "Pond Rune Puzzle",
      x: 72,
      y: 73,
      clue: "Where moonlight meets the river, the oldest tree remembers.",
      sequence: ["Moon", "River", "Tree"],
    },
    items: {
      mapFragment: { name: "Map Fragment", section: "Quest Items", description: "A torn piece of Mira's hand-drawn village map." },
      moonberry: { name: "Moonberry", section: "Collectibles", description: "A bright berry that glows softly after sunset." },
      oldCoin: { name: "Old Coin", section: "Collectibles", description: "A warm brass coin stamped with a tiny leaf." },
    },
    achievements: {
      firstSteps: { title: "First Steps", text: "Start your adventure" },
      treasureHunter: { title: "Treasure Hunter", text: "Collect your first item" },
      puzzleSolver: { title: "Puzzle Solver", text: "Complete the pond rune puzzle" },
      firstExplorer: { title: "First Explorer", text: "Complete Mira's Missing Map" },
    },
    questSteps: [
      { id: "talk", label: "Talk to Mira" },
      { id: "fragment", label: "Find the Map Fragment" },
      { id: "puzzle", label: "Solve the pond rune puzzle" },
      { id: "return", label: "Return to Mira" },
    ],
    obstacles: [
      { x: 12, y: 21, w: 17, h: 19 },
      { x: 70, y: 70, w: 22, h: 20 },
      { x: 3, y: 8, w: 8, h: 14 },
      { x: 30, y: 12, w: 8, h: 13 },
      { x: 73, y: 8, w: 8, h: 13 },
    ],
  };

  const defaultState = () => ({
    screen: "title",
    panel: null,
    dialogue: false,
    puzzleOpen: false,
    selectedItem: "mapFragment",
    puzzleSelection: [],
    puzzleMessage: "",
    prompt: "",
    player: { x: 30, y: 55, level: 1, xp: 0, coins: 0, hearts: 3 },
    questAccepted: false,
    questCompleted: false,
    questSteps: [],
    inventory: {},
    collected: false,
    puzzleSolved: false,
    achievements: [],
    muted: false,
  });

  let state = defaultState();
  let root = null;
  let playerEl = null;
  let collectibleEl = null;
  let lastTime = 0;
  let animationId = 0;
  let isMoving = false;
  const keys = new Set();
  const toasts = [];
  const achievementToasts = [];

  function boot() {
    root = document.getElementById(rootId);
    if (!root) return;
    renderTitleScreen();
    bindGlobalEvents();
    animationId = window.requestAnimationFrame(loop);
  }

  function hasSave() {
    return Boolean(localStorage.getItem(SAVE_KEY));
  }

  function saveGame() {
    const saved = { ...state, screen: "game", panel: null, dialogue: false, puzzleOpen: false, prompt: "" };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
  }

  function loadGame() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      state = { ...defaultState(), ...saved, screen: "game", panel: null, dialogue: false, puzzleOpen: false };
    } catch {
      state = defaultState();
      state.screen = "game";
    }
    renderGame();
  }

  function resetDemo() {
    localStorage.removeItem(SAVE_KEY);
    state = defaultState();
    renderTitleScreen();
  }

  function startAdventure() {
    state = defaultState();
    state.screen = "game";
    unlockAchievement("firstSteps");
    showToast("Welcome to Whisperwood Village!", "quest");
    saveGame();
    renderGame();
  }

  function renderTitleScreen() {
    state.screen = "title";
    const saved = readSaveSummary();
    root.innerHTML = `
      <main class="title-screen">
        <div class="sky-layer"><span class="cloud one"></span><span class="cloud two"></span></div>
        ${particles("spark", 14)}
        ${particles("leaf", 10)}
        <section class="title-card" aria-labelledby="title">
          <h1 class="logo" id="title">PIXELQUEST</h1>
          <p class="tagline">A tiny world full of big adventures.</p>
          ${saved ? `<p class="save-summary"><span>Continue Adventure</span><span>Level ${saved.level} Explorer</span><span>${saved.progress} complete</span></p>` : ""}
          <div class="button-stack">
            <button class="pixel-button" data-action="start" type="button">Start Adventure</button>
            <button class="pixel-button secondary" data-action="continue" ${hasSave() ? "" : "disabled"} type="button">Continue Adventure</button>
            <button class="pixel-button ghost" data-action="help" type="button">How to Play</button>
          </div>
        </section>
      </main>
      <div class="sr-live" aria-live="polite" id="announcer"></div>
    `;
  }

  function readSaveSummary() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!saved) return null;
      const done = [saved.questAccepted, saved.collected, saved.puzzleSolved, saved.questCompleted].filter(Boolean).length;
      return { level: saved.player?.level || 1, progress: `${Math.round((done / 4) * 100)}%` };
    } catch {
      return null;
    }
  }

  function renderGame() {
    root.innerHTML = `
      <main class="game-screen">
        ${renderHUD()}
        <section class="world-wrap">
          <div class="world" tabindex="0" aria-label="Whisperwood Village playable area">
            <div class="path"></div>
            <div class="cottage" aria-hidden="true"></div>
            <div class="pond" aria-hidden="true"></div>
            <div class="campfire" aria-hidden="true"></div>
            <div class="rune-site" aria-hidden="true"></div>
            <span class="tree t1"></span><span class="tree t2"></span><span class="tree t3"></span><span class="tree t4"></span><span class="tree t5"></span>
            ${particles("spark", 8)}
            <div class="npc" style="left:${data.npc.x}%;top:${data.npc.y}%">
              <div class="portrait" aria-hidden="true"></div>
              <span class="npc-label">Mira</span>
            </div>
            ${state.collected ? "" : `<button class="collectible" data-action="collect" style="left:${data.collectible.x}%;top:${data.collectible.y}%" aria-label="Collect Map Fragment" type="button">Map</button>`}
            <div class="player" style="left:${state.player.x}%;top:${state.player.y}%"><span class="head"></span><span class="body"></span></div>
            <div class="prompt" hidden></div>
          </div>
        </section>
        ${renderMobileControls()}
      </main>
      <div class="toast-stack" aria-live="polite"></div>
      <div class="achievement-stack" aria-live="polite"></div>
      <div class="sr-live" aria-live="polite" id="announcer"></div>
    `;
    playerEl = root.querySelector(".player");
    collectibleEl = root.querySelector(".collectible");
    updatePrompt();
    renderOverlay();
    renderToasts();
  }

  function renderHUD() {
    const objective = getCurrentObjective();
    return `
      <header class="hud">
        <div class="hud-group">
          <span class="hud-pill">Level ${state.player.level}</span>
          <span class="hud-pill">XP ${state.player.xp}</span>
          <span class="hud-pill" aria-label="${state.player.hearts} hearts">${"♥".repeat(state.player.hearts)}</span>
          <span class="hud-pill">Coins ${state.player.coins}</span>
          <button class="hud-pill quest-pill" data-action="quest" type="button">Quest: ${objective}</button>
        </div>
        <nav class="hud-actions" aria-label="Game panels">
          <button class="hud-button" data-action="inventory" type="button">🎒 <span>Inventory</span></button>
          <button class="hud-button" data-action="quest" type="button">📜 <span>Quest</span></button>
          <button class="hud-button" data-action="help" type="button">? <span>Help</span></button>
          <button class="hud-button" data-action="pause" type="button">Ⅱ <span>Pause</span></button>
        </nav>
      </header>
    `;
  }

  function renderMobileControls() {
    return `
      <div class="mobile-controls" aria-label="Mobile game controls">
        <div class="dpad">
          <button class="up" data-hold="up" type="button">▲</button>
          <button class="left" data-hold="left" type="button">◀</button>
          <button class="right" data-hold="right" type="button">▶</button>
          <button class="down" data-hold="down" type="button">▼</button>
        </div>
        <div class="mobile-actions">
          <button data-action="interact" type="button">Interact</button>
          <button data-action="inventory" type="button">Bag</button>
          <button data-action="quest" type="button">Quest</button>
          <button data-action="pause" type="button">Pause</button>
        </div>
      </div>
    `;
  }

  function renderOverlay() {
    root.querySelectorAll(".panel-backdrop").forEach((node) => node.remove());
    if (state.dialogue) return renderDialogue();
    if (state.puzzleOpen) return renderPuzzle();
    if (state.panel === "inventory") return renderInventory();
    if (state.panel === "quest") return renderQuestLog();
    if (state.panel === "pause") return renderPause();
    if (state.panel === "help") return renderHelp();
    return null;
  }

  function renderDialogue() {
    addPanel(`
      <section class="panel" role="dialog" aria-labelledby="dialogue-title">
        <div class="panel-header">
          <h2 id="dialogue-title">${data.npc.name}</h2>
          <button class="close-button" data-action="close" aria-label="Close dialogue" type="button">X</button>
        </div>
        <p>${data.npc.dialogue}</p>
        <div class="dialogue-actions">
          ${state.questAccepted ? `<button class="pixel-button" data-action="finishQuest" type="button">${canFinishQuest() ? "Complete Quest" : "Keep Exploring"}</button>` : `<button class="pixel-button" data-action="acceptQuest" type="button">Accept Quest</button>`}
          <button class="pixel-button ghost" data-action="close" type="button">Maybe Later</button>
        </div>
      </section>
    `);
  }

  function renderPuzzle() {
    addPanel(`
      <section class="panel" role="dialog" aria-labelledby="puzzle-title">
        <div class="panel-header">
          <h2 id="puzzle-title">${data.puzzle.name}</h2>
          <button class="close-button" data-action="close" aria-label="Close puzzle" type="button">X</button>
        </div>
        <p><strong>Clue:</strong> ${data.puzzle.clue}</p>
        <p aria-live="polite"><strong>Selected:</strong> ${state.puzzleSelection.join(" → ") || "None"}</p>
        ${state.puzzleMessage ? `<p><strong>${state.puzzleMessage}</strong></p>` : ""}
        <div class="rune-grid">
          ${["Moon", "River", "Tree"].map((rune) => `<button class="rune-button" data-rune="${rune}" type="button">${rune}</button>`).join("")}
        </div>
        <div class="puzzle-actions">
          <button class="pixel-button secondary" data-action="resetPuzzle" type="button">Reset</button>
          <button class="pixel-button" data-action="submitPuzzle" type="button">Submit</button>
        </div>
      </section>
    `);
  }

  function renderInventory() {
    const entries = Object.entries(data.items);
    addPanel(`
      <section class="panel" role="dialog" aria-labelledby="inventory-title">
        <div class="panel-header">
          <h2 id="inventory-title">Inventory</h2>
          <button class="close-button" data-action="close" aria-label="Close inventory" type="button">X</button>
        </div>
        ${["Quest Items", "Collectibles"].map((section) => `
          <h3>${section}</h3>
          <ul class="item-list">
            ${entries.filter(([, item]) => item.section === section).map(([id, item]) => `
              <li><button class="item-card" data-item="${id}" type="button">${item.name} x${state.inventory[id] || 0}</button></li>
            `).join("")}
          </ul>
        `).join("")}
        <h3>Item Detail</h3>
        <p>${selectedItemText()}</p>
      </section>
    `);
  }

  function renderQuestLog() {
    addPanel(`
      <section class="panel" role="dialog" aria-labelledby="quest-title">
        <div class="panel-header">
          <h2 id="quest-title">Quest Log</h2>
          <button class="close-button" data-action="close" aria-label="Close quest log" type="button">X</button>
        </div>
        <div class="button-stack" aria-label="Quest tabs">
          <button class="pixel-button ${state.questCompleted ? "ghost" : "secondary"}" type="button">Active</button>
          <button class="pixel-button ${state.questCompleted ? "secondary" : "ghost"}" type="button">Completed</button>
        </div>
        <h3>Mira's Missing Map</h3>
        <p>Help Mira recover her map fragment and wake the pond runes.</p>
        <ul class="objective-list">
          ${data.questSteps.map((step) => `<li class="objective ${state.questSteps.includes(step.id) ? "complete" : ""}">${state.questSteps.includes(step.id) ? "✓" : "○"} ${step.label}</li>`).join("")}
        </ul>
        <p><strong>Progress:</strong> ${state.questSteps.length} / ${data.questSteps.length}</p>
        <p><strong>Reward:</strong> 50 XP, 25 Coins, First Explorer Badge</p>
      </section>
    `);
  }

  function renderPause() {
    addPanel(`
      <section class="panel" role="dialog" aria-labelledby="pause-title">
        <h2 id="pause-title">Paused</h2>
        <div class="panel-actions">
          <button class="pixel-button" data-action="close" type="button">Resume</button>
          <button class="pixel-button secondary" data-action="help" type="button">How to Play</button>
          <button class="pixel-button ghost" data-action="restart" type="button">Restart Demo</button>
          <button class="pixel-button ghost" data-action="title" type="button">Return to Title</button>
          <button class="pixel-button secondary" data-action="mute" type="button">${state.muted ? "Sound On" : "Mute"}</button>
        </div>
      </section>
    `);
  }

  function renderHelp() {
    addPanel(`
      <section class="panel" role="dialog" aria-labelledby="help-title">
        <div class="panel-header">
          <h2 id="help-title">How to Play</h2>
          <button class="close-button" data-action="close" aria-label="Close help" type="button">X</button>
        </div>
        <p><strong>Move:</strong> WASD / Arrow Keys</p>
        <p><strong>Interact:</strong> E</p>
        <p><strong>Inventory:</strong> I</p>
        <p><strong>Quest:</strong> Q</p>
        <p><strong>Pause:</strong> Escape</p>
      </section>
    `);
  }

  function addPanel(markup) {
    root.insertAdjacentHTML("beforeend", `<div class="panel-backdrop">${markup}</div>`);
    const focusTarget = root.querySelector(".panel-backdrop button");
    if (focusTarget) focusTarget.focus();
  }

  function loop(time) {
    const dt = Math.min(32, time - lastTime || 16);
    lastTime = time;
    handleMovement(dt);
    animationId = window.requestAnimationFrame(loop);
  }

  function handleMovement(dt) {
    if (state.screen !== "game" || state.panel || state.dialogue || state.puzzleOpen) return;
    let dx = 0;
    let dy = 0;
    if (keys.has("arrowup") || keys.has("w") || keys.has("up")) dy -= 1;
    if (keys.has("arrowdown") || keys.has("s") || keys.has("down")) dy += 1;
    if (keys.has("arrowleft") || keys.has("a") || keys.has("left")) dx -= 1;
    if (keys.has("arrowright") || keys.has("d") || keys.has("right")) dx += 1;
    isMoving = dx !== 0 || dy !== 0;
    if (!isMoving) {
      if (playerEl) playerEl.classList.remove("moving");
      return;
    }
    const length = Math.hypot(dx, dy) || 1;
    const speed = 0.018 * dt;
    const next = { x: state.player.x + (dx / length) * speed, y: state.player.y + (dy / length) * speed };
    next.x = clamp(next.x, bounds.minX, bounds.maxX);
    next.y = clamp(next.y, bounds.minY, bounds.maxY);
    if (hitsObstacle(next)) return;
    state.player.x = next.x;
    state.player.y = next.y;
    if (playerEl) {
      playerEl.style.left = `${next.x}%`;
      playerEl.style.top = `${next.y}%`;
      playerEl.classList.add("moving");
    }
    updatePrompt();
  }

  function handleInteraction() {
    if (state.screen !== "game") return;
    if (near(data.npc, 8)) {
      state.dialogue = true;
      if (state.questAccepted) completeStep("return");
      renderOverlay();
      return;
    }
    if (!state.collected && near(data.collectible, 7)) {
      collectMapFragment();
      return;
    }
    if (!state.puzzleSolved && near(data.puzzle, 9)) {
      state.puzzleOpen = true;
      renderOverlay();
      return;
    }
    showToast("Nothing nearby needs attention right now.");
  }

  function collectMapFragment() {
    state.collected = true;
    state.inventory.mapFragment = 1;
    state.inventory.moonberry = state.inventory.moonberry || 1;
    state.inventory.oldCoin = state.inventory.oldCoin || 1;
    completeStep("fragment");
    unlockAchievement("treasureHunter");
    showToast("Map Fragment collected!", "item");
    playTone(620, 0.08);
    saveGame();
    if (collectibleEl) collectibleEl.classList.add("collected");
    window.setTimeout(renderGame, 320);
  }

  function acceptQuest() {
    state.questAccepted = true;
    completeStep("talk");
    state.dialogue = false;
    showToast("Quest accepted: Mira's Missing Map", "quest");
    saveGame();
    renderGame();
  }

  function completeQuest() {
    if (state.questCompleted) {
      showToast("Mira's Missing Map is already complete.");
      return;
    }
    if (!canFinishQuest()) {
      showToast("Mira still needs the fragment and the pond rune solved.");
      return;
    }
    state.questCompleted = true;
    state.player.xp = 50;
    state.player.coins = 25;
    completeStep("return");
    unlockAchievement("firstExplorer");
    showToast("Quest completed: First Explorer Badge earned!", "quest");
    saveGame();
    renderGame();
  }

  function submitPuzzle() {
    const correct = data.puzzle.sequence.every((value, index) => state.puzzleSelection[index] === value);
    if (!correct || state.puzzleSelection.length !== data.puzzle.sequence.length) {
      state.puzzleMessage = "The pond ripples kindly. Try Moon, River, then Tree.";
      renderOverlay();
      return;
    }
    state.puzzleSolved = true;
    state.puzzleOpen = false;
    completeStep("puzzle");
    unlockAchievement("puzzleSolver");
    showToast("Pond rune puzzle solved!", "quest");
    playTone(880, 0.14);
    saveGame();
    renderGame();
  }

  function completeStep(stepId) {
    if (!state.questSteps.includes(stepId)) state.questSteps.push(stepId);
  }

  function canFinishQuest() {
    return state.questAccepted && state.collected && state.puzzleSolved;
  }

  function getCurrentObjective() {
    if (!state.questAccepted) return "Talk to Mira";
    if (!state.collected) return "Find the Map Fragment";
    if (!state.puzzleSolved) return "Solve the pond runes";
    if (!state.questCompleted) return "Return to Mira";
    return "Adventure complete";
  }

  function unlockAchievement(id) {
    if (state.achievements.includes(id)) return;
    state.achievements.push(id);
    const achievement = data.achievements[id];
    achievementToasts.push(achievement);
    announce(`Achievement unlocked: ${achievement.title}`);
    playTone(1040, 0.1);
    renderToasts();
    window.setTimeout(() => {
      achievementToasts.shift();
      renderToasts();
    }, 3400);
  }

  function showToast(text) {
    toasts.push(text);
    announce(text);
    renderToasts();
    window.setTimeout(() => {
      toasts.shift();
      renderToasts();
    }, 2600);
  }

  function renderToasts() {
    const toastStack = root.querySelector(".toast-stack");
    const achievementStack = root.querySelector(".achievement-stack");
    if (toastStack) toastStack.innerHTML = toasts.map((text) => `<div class="toast">${text}</div>`).join("");
    if (achievementStack) {
      achievementStack.innerHTML = achievementToasts.map((item) => `<div class="achievement"><strong>${item.title}</strong><br>${item.text}</div>`).join("");
    }
  }

  function selectedItemText() {
    const item = data.items[state.selectedItem];
    const quantity = state.inventory[state.selectedItem] || 0;
    return `${item.name}: ${item.description} Quantity: ${quantity}.`;
  }

  function updatePrompt() {
    const prompt = root.querySelector(".prompt");
    if (!prompt) return;
    let text = "";
    if (near(data.npc, 8)) text = "Press E to talk to Mira";
    else if (!state.collected && near(data.collectible, 7)) text = "Press E to collect Map Fragment";
    else if (!state.puzzleSolved && near(data.puzzle, 9)) text = "Press E to inspect pond runes";
    prompt.textContent = text;
    prompt.hidden = !text;
  }

  function bindGlobalEvents() {
    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) keys.add(key);
      if (key === "e") handleInteraction();
      if (key === "i") openPanel("inventory");
      if (key === "q") openPanel("quest");
      if (key === "escape") closeOrPause();
    });
    document.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
    document.addEventListener("click", (event) => {
      const action = event.target.closest("[data-action]")?.dataset.action;
      const rune = event.target.closest("[data-rune]")?.dataset.rune;
      const item = event.target.closest("[data-item]")?.dataset.item;
      if (rune) {
        state.puzzleSelection = [...state.puzzleSelection, rune].slice(0, 3);
        state.puzzleMessage = "";
        renderOverlay();
      }
      if (item) {
        state.selectedItem = item;
        renderOverlay();
      }
      if (action) runAction(action);
    });
    document.addEventListener("pointerdown", (event) => {
      const hold = event.target.closest("[data-hold]")?.dataset.hold;
      if (hold) keys.add(hold);
    });
    document.addEventListener("pointerup", clearTouchKeys);
    document.addEventListener("pointercancel", clearTouchKeys);
  }

  function runAction(action) {
    const actions = {
      start: startAdventure,
      continue: loadGame,
      help: () => openPanel("help"),
      inventory: () => openPanel("inventory"),
      quest: () => openPanel("quest"),
      pause: () => openPanel("pause"),
      close: closeOverlay,
      interact: handleInteraction,
      collect: collectMapFragment,
      acceptQuest,
      finishQuest: completeQuest,
      resetPuzzle: () => {
        state.puzzleSelection = [];
        state.puzzleMessage = "The runes reset.";
        renderOverlay();
      },
      submitPuzzle,
      restart: () => {
        if (window.confirm("Restart the CodePen demo?")) resetDemo();
      },
      title: renderTitleScreen,
      mute: () => {
        state.muted = !state.muted;
        saveGame();
        renderOverlay();
      },
    };
    if (actions[action]) actions[action]();
  }

  function openPanel(panel) {
    if (state.screen === "title" && panel === "help") {
      state.panel = "help";
      renderTitleScreen();
      renderOverlay();
      return;
    }
    if (state.screen !== "game") return;
    state.panel = panel;
    state.dialogue = false;
    state.puzzleOpen = false;
    renderOverlay();
  }

  function closeOverlay() {
    state.panel = null;
    state.dialogue = false;
    state.puzzleOpen = false;
    if (state.screen === "game") renderGame();
    else renderTitleScreen();
  }

  function closeOrPause() {
    if (state.panel || state.dialogue || state.puzzleOpen) closeOverlay();
    else if (state.screen === "game") openPanel("pause");
  }

  function clearTouchKeys() {
    ["up", "down", "left", "right"].forEach((key) => keys.delete(key));
  }

  function near(target, radius) {
    return Math.hypot(state.player.x - target.x, state.player.y - target.y) <= radius;
  }

  function hitsObstacle(point) {
    return data.obstacles.some((obstacle) => (
      point.x >= obstacle.x
      && point.x <= obstacle.x + obstacle.w
      && point.y >= obstacle.y
      && point.y <= obstacle.y + obstacle.h
    ));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function particles(className, count) {
    return `<div class="${className === "spark" ? "fireflies" : "leaves"}">${Array.from({ length: count }, (_, index) => {
      const left = (index * 17 + 9) % 96;
      const top = (index * 23 + 12) % 88;
      const delay = (index % 7) * 0.42;
      return `<span class="${className}" style="left:${left}%;top:${top}%;animation-delay:${delay}s"></span>`;
    }).join("")}</div>`;
  }

  function announce(text) {
    const announcer = document.getElementById("announcer");
    if (announcer) announcer.textContent = text;
  }

  function playTone(frequency, duration) {
    if (state.muted || !window.AudioContext) return;
    try {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = "triangle";
      gain.gain.value = 0.035;
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
      window.setTimeout(() => context.close(), (duration + 0.05) * 1000);
    } catch {
      // Audio is optional; the game remains fully playable without it.
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();

  window.addEventListener("pagehide", () => {
    window.cancelAnimationFrame(animationId);
  });
})();
