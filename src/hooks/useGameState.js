import { useCallback, useEffect, useMemo, useState } from "react";
import { achievements as achievementCatalog } from "../data/achievementData";
import { encounters } from "../data/encounterData";
import { itemCatalog } from "../data/itemData";
import { npcs } from "../data/npcData";
import { shrinePuzzle } from "../data/puzzleData";
import { quests as questCatalog } from "../data/questData";
import { areas, WORLD_BOUNDS } from "../data/worldData";
import { SAVE_KEY, clearSave, loadSave } from "./useLocalSave";

const xpLevels = [
  { level: 1, min: 0, max: 100 },
  { level: 2, min: 100, max: 250 },
  { level: 3, min: 250, max: 450 },
];

export const initialState = {
  version: 2,
  currentArea: "village",
  player: {
    name: "Explorer",
    level: 1,
    health: 3,
    maxHealth: 3,
    energy: 5,
    maxEnergy: 5,
    coins: 0,
    xp: 0,
    position: { x: 50, y: 62 },
    perks: [],
    badge: "Forest Explorer Badge",
  },
  inventory: {},
  collectedIds: [],
  quests: {},
  trackedQuestIds: ["missingLantern"],
  trackedQuestIndex: 0,
  completedQuests: [],
  achievements: [],
  discoveredLocations: ["village"],
  completedPuzzles: [],
  solvedEncounters: [],
  inspectedIds: [],
  secretsFound: [],
  stats: { itemsFound: 0, questsCompleted: 0, areasDiscovered: 1, npcsHelped: 0 },
  settings: { music: false, sfx: true, volume: 0.35, reducedEffects: false, showPrompts: true },
};

function migrateSave(save) {
  if (!save) return null;
  return {
    ...initialState,
    ...save,
    version: 2,
    currentArea: save.currentArea ?? "village",
    player: { ...initialState.player, ...(save.player ?? {}) },
    settings: { ...initialState.settings, ...(save.settings ?? {}) },
    stats: { ...initialState.stats, ...(save.stats ?? {}) },
    trackedQuestIds: save.trackedQuestIds ?? ["missingLantern"],
    trackedQuestIndex: save.trackedQuestIndex ?? 0,
    discoveredLocations: save.discoveredLocations ?? ["village"],
    completedPuzzles: save.completedPuzzles ?? [],
    solvedEncounters: save.solvedEncounters ?? [],
    inspectedIds: save.inspectedIds ?? [],
    secretsFound: save.secretsFound ?? [],
  };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function inRect(position, rect) {
  const halfW = rect.width / 2;
  const halfH = rect.height / 2;
  return position.x >= rect.x - halfW && position.x <= rect.x + halfW && position.y >= rect.y - halfH && position.y <= rect.y + halfH;
}

function addItem(inventory, itemId, quantity) {
  return { ...inventory, [itemId]: (inventory[itemId] ?? 0) + quantity };
}

function removeItem(inventory, itemId, quantity) {
  const nextQuantity = Math.max(0, (inventory[itemId] ?? 0) - quantity);
  if (nextQuantity) return { ...inventory, [itemId]: nextQuantity };
  return Object.fromEntries(Object.entries(inventory).filter(([id]) => id !== itemId));
}

function makeToast(message, type = "info") {
  return { id: crypto.randomUUID(), message, type };
}

export function getLevelInfo(xp) {
  return [...xpLevels].reverse().find((entry) => xp >= entry.min) ?? xpLevels[0];
}

export function useGameState({ loadExisting = false } = {}) {
  const [game, setGame] = useState(() => migrateSave(loadExisting ? loadSave() : null) ?? initialState);
  const [hasStarted, setHasStarted] = useState(loadExisting);
  const [toasts, setToasts] = useState([]);
  const [achievementToasts, setAchievementToasts] = useState([]);
  const [levelToasts, setLevelToasts] = useState([]);
  const [dialogue, setDialogue] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [paused, setPaused] = useState(false);
  const [inspect, setInspect] = useState(null);
  const [encounter, setEncounter] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [areaTransition, setAreaTransition] = useState(null);

  const area = areas[game.currentArea] ?? areas.village;
  const areaNpcs = npcs.filter((npc) => !npc.area || npc.area === game.currentArea);
  const areaEncounters = Object.values(encounters).filter((entry) => entry.area === game.currentArea && !game.solvedEncounters.includes(entry.id));

  const pushToast = useCallback((message, type = "info") => {
    const toast = makeToast(message, type);
    setToasts((items) => [...items, toast]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== toast.id)), 2800);
  }, []);

  const playSound = useCallback((kind = "tap") => {
    if (!game.settings.sfx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = { pickup: 660, quest: 520, achievement: 780, puzzle: 880, transition: 360, tap: 420 }[kind] ?? 420;
      oscillator.type = "square";
      gain.gain.value = game.settings.volume * 0.08;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.08);
    } catch {
      // Optional audio should never block gameplay.
    }
  }, [game.settings.sfx, game.settings.volume]);

  const unlockAchievement = useCallback((achievementId) => {
    setGame((current) => {
      if (current.achievements.includes(achievementId)) return current;
      const achievement = achievementCatalog[achievementId];
      setAchievementToasts((items) => [...items, { ...achievement, toastId: crypto.randomUUID() }]);
      window.setTimeout(() => setAchievementToasts((items) => items.slice(1)), 3600);
      return { ...current, achievements: [...current.achievements, achievementId] };
    });
    playSound("achievement");
  }, [playSound]);

  const awardXp = useCallback((amount) => {
    setGame((current) => {
      const previousLevel = current.player.level;
      const xp = current.player.xp + amount;
      const levelInfo = getLevelInfo(xp);
      const leveled = levelInfo.level > previousLevel;
      if (leveled) {
        setLevelToasts((items) => [...items, { id: crypto.randomUUID(), level: levelInfo.level }]);
        window.setTimeout(() => setLevelToasts((items) => items.slice(1)), 3600);
        if (levelInfo.level >= 2 && !current.achievements.includes("growingAdventurer")) {
          const achievement = achievementCatalog.growingAdventurer;
          setAchievementToasts((items) => [...items, { ...achievement, toastId: crypto.randomUUID() }]);
          window.setTimeout(() => setAchievementToasts((items) => items.slice(1)), 3600);
        }
      }
      return {
        ...current,
        achievements: leveled && levelInfo.level >= 2 && !current.achievements.includes("growingAdventurer")
          ? [...current.achievements, "growingAdventurer"]
          : current.achievements,
        player: {
          ...current.player,
          xp,
          level: levelInfo.level,
          maxEnergy: leveled ? current.player.maxEnergy + 1 : current.player.maxEnergy,
          energy: leveled ? current.player.maxEnergy + 1 : current.player.energy,
        },
      };
    });
    if (amount) pushToast(`+${amount} XP`, "progress");
  }, [pushToast]);

  useEffect(() => {
    if (hasStarted) localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  }, [game, hasStarted]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setGame((current) => {
        if (!hasStarted || encounter || current.player.energy >= current.player.maxEnergy) return current;
        return { ...current, player: { ...current.player, energy: current.player.energy + 1 } };
      });
    }, 2400);
    return () => window.clearInterval(timer);
  }, [encounter, hasStarted]);

  const nearbyNpc = useMemo(() => areaNpcs.find((npc) => distance(game.player.position, npc) < 8), [areaNpcs, game.player.position]);
  const nearbyCollectible = useMemo(
    () => area.collectibles.find((item) => !game.collectedIds.includes(item.id) && distance(game.player.position, item) < 5.2),
    [area.collectibles, game.collectedIds, game.player.position],
  );
  const nearbyInspectable = useMemo(() => area.inspectables?.find((item) => distance(game.player.position, item) < 6), [area.inspectables, game.player.position]);
  const nearbyEncounter = useMemo(() => areaEncounters.find((item) => distance(game.player.position, item) < 6), [areaEncounters, game.player.position]);
  const nearbyPuzzle = useMemo(
    () => (game.currentArea === shrinePuzzle.area && !game.completedPuzzles.includes(shrinePuzzle.id) && distance(game.player.position, shrinePuzzle) < 6 ? shrinePuzzle : null),
    [game.completedPuzzles, game.currentArea, game.player.position],
  );

  const activeTrackedQuest = useMemo(() => {
    const activeIds = game.trackedQuestIds.filter((id) => game.quests[id] && !game.completedQuests.includes(id));
    const id = activeIds[game.trackedQuestIndex % Math.max(activeIds.length, 1)] ?? activeIds[0] ?? "missingLantern";
    const catalog = questCatalog[id];
    const progress = game.quests[id];
    const step = catalog?.steps.find((entry) => !progress?.completedSteps.includes(entry.id)) ?? catalog?.steps.at(-1);
    const count = progress?.counts?.[step?.id] ?? (progress?.completedSteps.includes(step?.id) ? step?.target ?? 1 : 0);
    return { id, catalog, step, count, total: step?.target ?? 1 };
  }, [game.completedQuests, game.quests, game.trackedQuestIds, game.trackedQuestIndex]);

  const updateQuestStep = useCallback((questId, stepId, amount = 1) => {
    setGame((current) => {
      const quest = current.quests[questId];
      const catalogStep = questCatalog[questId]?.steps.find((step) => step.id === stepId);
      if (!quest || !catalogStep || quest.completedSteps.includes(stepId)) return current;
      const target = catalogStep.target ?? 1;
      const nextCount = Math.min(target, (quest.counts?.[stepId] ?? 0) + amount);
      const completedSteps = nextCount >= target ? [...quest.completedSteps, stepId] : quest.completedSteps;
      pushToast(`Quest updated: ${questCatalog[questId].name}`, "quest");
      return {
        ...current,
        quests: { ...current.quests, [questId]: { ...quest, counts: { ...(quest.counts ?? {}), [stepId]: nextCount }, completedSteps } },
      };
    });
    playSound("quest");
  }, [playSound, pushToast]);

  const acceptQuest = useCallback((questId, firstStep = null) => {
    setGame((current) => {
      if (current.quests[questId] || current.completedQuests.includes(questId)) return current;
      pushToast(`Quest accepted: ${questCatalog[questId].name}`, "quest");
      return {
        ...current,
        quests: { ...current.quests, [questId]: { id: questId, completedSteps: firstStep ? [firstStep] : [], counts: {}, acceptedAt: Date.now() } },
        trackedQuestIds: current.trackedQuestIds.includes(questId) ? current.trackedQuestIds : [...current.trackedQuestIds, questId],
      };
    });
    unlockAchievement("helpfulStranger");
    playSound("quest");
  }, [playSound, pushToast, unlockAchievement]);

  const completeQuest = useCallback((questId) => {
    setGame((current) => {
      if (current.completedQuests.includes(questId)) return current;
      const reward = questCatalog[questId].reward;
      const inventory = reward.item ? addItem(current.inventory, reward.item, 1) : current.inventory;
      return {
        ...current,
        inventory,
        completedQuests: [...current.completedQuests, questId],
        stats: { ...current.stats, questsCompleted: current.stats.questsCompleted + 1, npcsHelped: current.stats.npcsHelped + 1 },
        player: {
          ...current.player,
          coins: current.player.coins + reward.coins,
          badge: reward.badge ?? current.player.badge,
          perks: reward.perk && !current.player.perks.includes(reward.perk) ? [...current.player.perks, reward.perk] : current.player.perks,
        },
      };
    });
    awardXp(questCatalog[questId].reward.xp);
    pushToast(`Quest completed: ${questCatalog[questId].name}`, "quest");
    if (questId === "missingLantern") unlockAchievement("forestExplorer");
    if (questId === "woodsWhispers") unlockAchievement("woodlandGuide");
    playSound("quest");
  }, [awardXp, playSound, pushToast, unlockAchievement]);

  const transitionArea = useCallback((zone) => {
    const destination = areas[zone.to];
    setGame((current) => {
      const discoveredLocations = current.discoveredLocations.includes(zone.to) ? current.discoveredLocations : [...current.discoveredLocations, zone.to];
      return {
        ...current,
        currentArea: zone.to,
        discoveredLocations,
        player: { ...current.player, position: destination.entry },
        stats: { ...current.stats, areasDiscovered: discoveredLocations.length },
      };
    });
    setAreaTransition({ id: crypto.randomUUID(), title: destination.name, subtitle: destination.description });
    window.setTimeout(() => setAreaTransition(null), 1800);
    pushToast(`${destination.name} unlocked`, "quest");
    playSound("transition");
    if (zone.to === "forest") {
      updateQuestStep("woodsWhispers", "enter-forest");
      unlockAchievement("intoTheWoods");
    }
  }, [playSound, pushToast, unlockAchievement, updateQuestStep]);

  const movePlayer = useCallback((dx, dy, elapsed) => {
    const speed = game.player.perks.includes("Quick Step") ? 0.68 : 0.58;
    const length = Math.hypot(dx, dy) || 1;
    const candidate = {
      x: Math.min(WORLD_BOUNDS.width - WORLD_BOUNDS.padding, Math.max(WORLD_BOUNDS.padding, game.player.position.x + (dx / length) * speed * elapsed)),
      y: Math.min(WORLD_BOUNDS.height - WORLD_BOUNDS.padding, Math.max(WORLD_BOUNDS.padding, game.player.position.y + (dy / length) * speed * elapsed)),
    };
    const zone = area.transitionZones.find((entry) => inRect(candidate, entry));
    if (zone && !areaTransition) {
      transitionArea(zone);
      return;
    }
    setGame((current) => {
      const currentArea = areas[current.currentArea] ?? areas.village;
      if (currentArea.obstacles.some((obstacle) => inRect(candidate, obstacle))) return current;
      return { ...current, player: { ...current.player, position: candidate } };
    });
  }, [area.transitionZones, areaTransition, game.player.perks, game.player.position, transitionArea]);

  const collectNearbyItem = useCallback(() => {
    if (!nearbyCollectible) return false;
    setGame((current) => {
      if (current.collectedIds.includes(nearbyCollectible.id)) return current;
      return {
        ...current,
        collectedIds: [...current.collectedIds, nearbyCollectible.id],
        inventory: addItem(current.inventory, nearbyCollectible.itemId, nearbyCollectible.quantity),
        player: { ...current.player, coins: current.player.coins + (nearbyCollectible.itemId === "coin" ? nearbyCollectible.quantity : 0) },
        stats: { ...current.stats, itemsFound: current.stats.itemsFound + nearbyCollectible.quantity },
        secretsFound: nearbyCollectible.secret ? [...current.secretsFound, nearbyCollectible.id] : current.secretsFound,
      };
    });
    pushToast(nearbyCollectible.label, "item");
    unlockAchievement("treasureHunter");
    if (nearbyCollectible.secret) unlockAchievement("secretSeeker");
    if (nearbyCollectible.itemId === "lantern") {
      updateQuestStep("missingLantern", "search-path");
      updateQuestStep("missingLantern", "find-lantern");
    }
    if (nearbyCollectible.marker) updateQuestStep("woodsWhispers", "markers");
    if (nearbyCollectible.itemId === "moonberry" && game.quests.pipsMoonberries) updateQuestStep("pipsMoonberries", "moonberries", nearbyCollectible.quantity);
    playSound("pickup");
    return true;
  }, [game.quests.pipsMoonberries, nearbyCollectible, playSound, pushToast, unlockAchievement, updateQuestStep]);

  const inspectNearby = useCallback(() => {
    if (!nearbyInspectable) return false;
    setInspect(nearbyInspectable);
    setGame((current) => ({
      ...current,
      inspectedIds: current.inspectedIds.includes(nearbyInspectable.id) ? current.inspectedIds : [...current.inspectedIds, nearbyInspectable.id],
      discoveredLocations: nearbyInspectable.id === "abandoned-camp" && !current.discoveredLocations.includes("camp") ? [...current.discoveredLocations, "camp"] : current.discoveredLocations,
    }));
    if (nearbyInspectable.questStep) updateQuestStep(nearbyInspectable.questStep.questId, nearbyInspectable.questStep.stepId);
    return true;
  }, [nearbyInspectable, updateQuestStep]);

  const interact = useCallback(() => {
    if (nearbyCollectible) return collectNearbyItem();
    if (nearbyPuzzle) {
      setPuzzle({ selected: [] });
      return true;
    }
    if (nearbyEncounter) {
      setEncounter({ ...nearbyEncounter, log: [nearbyEncounter.description] });
      return true;
    }
    if (nearbyInspectable) return inspectNearby();
    if (!nearbyNpc) {
      pushToast("Nothing nearby wants attention right now.", "info");
      return false;
    }
    if (nearbyNpc.questId) acceptQuest(nearbyNpc.questId, nearbyNpc.questId === "missingLantern" ? "talk-rowan" : null);
    if (nearbyNpc.givesItem && !game.inventory[nearbyNpc.givesItem]) {
      setGame((current) => ({ ...current, inventory: addItem(current.inventory, nearbyNpc.givesItem, 1) }));
      pushToast(`${itemCatalog[nearbyNpc.givesItem].name} added to inventory`, "item");
    }
    if (nearbyNpc.id === "rowan" && game.inventory.lantern && !game.completedQuests.includes("missingLantern")) completeQuest("missingLantern");
    if (nearbyNpc.id === "mira" && game.quests.woodsWhispers?.completedSteps.length >= 4 && !game.completedQuests.includes("woodsWhispers")) {
      updateQuestStep("woodsWhispers", "return-mira");
      completeQuest("woodsWhispers");
    }
    if (nearbyNpc.id === "pip" && game.quests.pipsMoonberries?.completedSteps.includes("moonberries") && !game.completedQuests.includes("pipsMoonberries")) {
      updateQuestStep("pipsMoonberries", "return-pip");
      completeQuest("pipsMoonberries");
    }
    setDialogue({ npc: nearbyNpc, index: 0 });
    return true;
  }, [acceptQuest, collectNearbyItem, completeQuest, game.completedQuests, game.inventory, game.quests.pipsMoonberries, game.quests.woodsWhispers, inspectNearby, nearbyCollectible, nearbyEncounter, nearbyInspectable, nearbyNpc, nearbyPuzzle, pushToast, updateQuestStep]);

  const encounterAction = useCallback((action) => {
    if (!encounter) return;
    if (action === "observe") {
      setEncounter((current) => ({ ...current, log: [...current.log, current.clue] }));
      return;
    }
    if (action === "flee") {
      setEncounter(null);
      pushToast("You step back and the path quiets.", "info");
      return;
    }
    if (action === "defend") {
      setGame((current) => ({ ...current, player: { ...current.player, energy: Math.max(0, current.player.energy - 1) } }));
      setEncounter((current) => ({ ...current, log: [...current.log, "You hold steady. The creature hesitates."] }));
      return;
    }
    if (action === "calm" || action === "use") {
      const needsBerry = encounter.id === "brambleSprite";
      if (needsBerry && !game.inventory.moonberry) {
        setEncounter((current) => ({ ...current, log: [...current.log, "A Moonberry would help, but your pack has none."] }));
        return;
      }
      setGame((current) => ({
        ...current,
        inventory: encounter.reward.item
          ? addItem(needsBerry ? removeItem(current.inventory, "moonberry", 1) : current.inventory, encounter.reward.item, 1)
          : needsBerry
            ? removeItem(current.inventory, "moonberry", 1)
            : current.inventory,
        solvedEncounters: [...current.solvedEncounters, encounter.id],
        player: { ...current.player, coins: current.player.coins + (encounter.reward.coins ?? 0) },
      }));
      awardXp(encounter.reward.xp);
      if (encounter.id === "brambleSprite") updateQuestStep("woodsWhispers", "sprite");
      unlockAchievement("creatureFriend");
      pushToast(`${encounter.name} is calm.`, "quest");
      playSound("quest");
      setEncounter(null);
    }
  }, [awardXp, encounter, game.inventory.moonberry, playSound, pushToast, unlockAchievement, updateQuestStep]);

  const selectRune = useCallback((runeId) => {
    setPuzzle((current) => current ? { ...current, selected: [...current.selected, runeId].slice(0, shrinePuzzle.sequence.length), message: "" } : current);
  }, []);

  const submitPuzzle = useCallback(() => {
    if (!puzzle) return;
    const solved = shrinePuzzle.sequence.every((rune, index) => puzzle.selected[index] === rune);
    if (!solved) {
      setPuzzle({ selected: [], message: "The stones dim. Try the clue again." });
      return;
    }
    setGame((current) => ({
      ...current,
      completedPuzzles: [...current.completedPuzzles, shrinePuzzle.id],
      inventory: addItem(addItem(current.inventory, shrinePuzzle.rewardItem, 1), "ancientCoin", 1),
      secretsFound: current.secretsFound.includes("shrine-chest") ? current.secretsFound : [...current.secretsFound, "shrine-chest"],
      discoveredLocations: current.discoveredLocations.includes("shrine") ? current.discoveredLocations : [...current.discoveredLocations, "shrine"],
    }));
    pushToast("Shrine solved. Hidden chest unlocked.", "quest");
    unlockAchievement("puzzleSolver");
    unlockAchievement("secretSeeker");
    playSound("puzzle");
    setPuzzle(null);
  }, [playSound, pushToast, puzzle, unlockAchievement]);

  const consumeInventoryItem = useCallback((itemId) => {
    if (itemId !== "moonberry" || !game.inventory.moonberry) return;
    setGame((current) => ({
      ...current,
      inventory: removeItem(current.inventory, "moonberry", 1),
      player: { ...current.player, energy: Math.min(current.player.maxEnergy, current.player.energy + 1) },
    }));
    pushToast("Moonberry restored 1 energy.", "item");
  }, [game.inventory.moonberry, pushToast]);

  const cycleTrackedQuest = useCallback(() => {
    setGame((current) => ({ ...current, trackedQuestIndex: current.trackedQuestIndex + 1 }));
  }, []);

  const updateSetting = useCallback((key, value) => {
    setGame((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
  }, []);

  const recoverAtCamp = useCallback(() => {
    setGame((current) => ({
      ...current,
      currentArea: "village",
      player: { ...current.player, health: current.player.maxHealth, energy: current.player.maxEnergy, position: areas.village.entry },
    }));
    pushToast("You recovered at the village camp.", "info");
  }, [pushToast]);

  const startAdventure = useCallback((mode = "new") => {
    const next = mode === "continue" ? migrateSave(loadSave()) ?? initialState : initialState;
    setHasStarted(true);
    setGame(next);
    localStorage.setItem(SAVE_KEY, JSON.stringify(next));
    unlockAchievement("firstSteps");
  }, [unlockAchievement]);

  const resetAdventure = useCallback(() => {
    const confirmed = window.confirm("Reset PixelQuest progress and return to the beginning?");
    if (!confirmed) return false;
    clearSave();
    setHasStarted(true);
    setGame(initialState);
    setDialogue(null);
    setActivePanel(null);
    setPaused(false);
    pushToast("Adventure reset", "info");
    return true;
  }, [pushToast]);

  return {
    activePanel,
    activeTrackedQuest,
    achievementToasts,
    area,
    areaTransition,
    cycleTrackedQuest,
    dialogue,
    encounter,
    encounterAction,
    game,
    inspect,
    interact,
    levelToasts,
    movePlayer,
    nearbyCollectible,
    nearbyEncounter,
    nearbyInspectable,
    nearbyNpc,
    nearbyPuzzle,
    paused,
    puzzle,
    pushToast,
    recoverAtCamp,
    resetAdventure,
    selectRune,
    setActivePanel,
    setDialogue,
    setEncounter,
    setInspect,
    setPaused,
    setPuzzle,
    startAdventure,
    submitPuzzle,
    toasts,
    updateSetting,
    consumeInventoryItem,
  };
}
