import { useCallback, useEffect, useMemo, useState } from "react";
import { achievements as achievementCatalog } from "../data/achievementData";
import { collections } from "../data/collectionData";
import { recipes } from "../data/craftingData";
import { encounters } from "../data/encounterData";
import { itemCatalog } from "../data/itemData";
import { npcs } from "../data/npcData";
import { ruinsPuzzles, shrinePuzzle } from "../data/puzzleData";
import { quests as questCatalog } from "../data/questData";
import { guardianTrial, ruinsRooms } from "../data/ruinsData";
import { constellationTrial, sanctuaryRooms } from "../data/sanctuaryData";
import { areas, WORLD_BOUNDS } from "../data/worldData";
import { SAVE_KEY, clearSave, loadSave } from "./useLocalSave";

const xpLevels = [
  { level: 1, min: 0, max: 100 },
  { level: 2, min: 100, max: 250 },
  { level: 3, min: 250, max: 450 },
  { level: 4, min: 450, max: 700 },
];

export const initialState = {
  version: 4,
  currentArea: "village",
  currentRoom: null,
  timeState: "Day",
  transitionCount: 0,
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
  gateUnlocked: false,
  dungeonProgress: { hallOpen: false, echoesSolved: false, waterRedirected: false, shrineReached: false, vaultOpen: false },
  guardian: null,
  finalTrial: null,
  craftedRecipes: [],
  dialogueChoices: {},
  sanctuaryProgress: { vaultOpened: false, moonSeal: false, riverSeal: false, treeSeal: false, observatoryReached: false, finalTrialComplete: false },
  finalChoice: null,
  storyComplete: false,
  postGame: false,
  customization: { outfit: "Forest Green", accessory: "Traveler Scarf", badge: "Forest Explorer Badge" },
  lore: [],
  inspectedIds: [],
  secretsFound: [],
  stats: { playTime: 0, stepsTaken: 0, itemsFound: 0, coinsFound: 0, questsCompleted: 0, puzzlesSolved: 0, creaturesCalmed: 0, secretsFound: 0, areasDiscovered: 1, itemsCrafted: 0, npcsHelped: 0 },
  settings: { music: false, sfx: true, volume: 0.35, reducedEffects: false, showPrompts: true, timeCycle: true, completionHints: true, presentationMode: false },
};

function migrateSave(save) {
  if (!save) return null;
  return {
    ...initialState,
    ...save,
    version: 4,
    currentArea: save.currentArea ?? "village",
    currentRoom: save.currentRoom ?? null,
    timeState: save.timeState ?? "Day",
    transitionCount: save.transitionCount ?? 0,
    player: { ...initialState.player, ...(save.player ?? {}) },
    settings: { ...initialState.settings, ...(save.settings ?? {}) },
    stats: { ...initialState.stats, ...(save.stats ?? {}) },
    trackedQuestIds: save.trackedQuestIds ?? ["missingLantern"],
    trackedQuestIndex: save.trackedQuestIndex ?? 0,
    discoveredLocations: save.discoveredLocations ?? ["village"],
    completedPuzzles: save.completedPuzzles ?? [],
    solvedEncounters: save.solvedEncounters ?? [],
    gateUnlocked: save.gateUnlocked ?? false,
    dungeonProgress: { ...initialState.dungeonProgress, ...(save.dungeonProgress ?? {}) },
    guardian: save.guardian ?? null,
    finalTrial: save.finalTrial ?? null,
    craftedRecipes: save.craftedRecipes ?? [],
    dialogueChoices: save.dialogueChoices ?? {},
    sanctuaryProgress: { ...initialState.sanctuaryProgress, ...(save.sanctuaryProgress ?? {}) },
    finalChoice: save.finalChoice ?? null,
    storyComplete: save.storyComplete ?? false,
    postGame: save.postGame ?? false,
    customization: { ...initialState.customization, ...(save.customization ?? {}) },
    lore: save.lore ?? [],
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

function hasAncientRelics(inventory) {
  const relics = collections.find((collection) => collection.id === "ancientRelics");
  return Boolean(relics?.items.every((id) => inventory[id]));
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
  const [guardianPanel, setGuardianPanel] = useState(false);

  const area = areas[game.currentArea] ?? areas.village;
  const areaNpcs = npcs.filter((npc) => !npc.area || npc.area === game.currentArea);
  const areaEncounters = Object.values(encounters).filter((entry) => entry.area === game.currentArea && !game.solvedEncounters.includes(entry.id));
  const currentRoom = game.currentArea === "ruins"
    ? ruinsRooms.find((room) => distance(game.player.position, room) < 14) ?? ruinsRooms[0]
    : game.currentArea === "sanctuary"
      ? sanctuaryRooms.find((room) => distance(game.player.position, room) < 14) ?? sanctuaryRooms[0]
    : null;
  const worldProgress = useMemo(() => {
    const totalCollectibles = Object.values(areas).flatMap((entry) => entry.collectibles).length;
    const totalPuzzles = 4;
    const totalSecrets = 8;
    const foundCollections = collections.reduce((sum, collection) => sum + collection.items.filter((id) => game.inventory[id]).length, 0);
    const allCollectionItems = collections.reduce((sum, collection) => sum + collection.items.length, 0);
    const total = Math.min(100, Math.round((
      (game.discoveredLocations.length / 10) +
      (game.completedQuests.length / 5) +
      (game.collectedIds.length / totalCollectibles) +
      (game.completedPuzzles.length / totalPuzzles) +
      (game.secretsFound.length / totalSecrets) +
      (game.achievements.length / Object.keys(achievementCatalog).length) +
      (foundCollections / allCollectionItems)
    ) / 7 * 100));
    return {
      total,
      totalSecrets,
      areas: {
        "Whisperwood Village": Math.min(100, Math.round((game.discoveredLocations.includes("village") ? 70 : 0) + (game.completedQuests.includes("missingLantern") ? 30 : 0))),
        "Old Forest Path": Math.min(100, Math.round((game.discoveredLocations.includes("forest") ? 35 : 0) + (game.completedPuzzles.includes("ancientShrine") ? 25 : 0) + (game.completedQuests.includes("woodsWhispers") ? 40 : 0))),
        "Ancient Ruins": Math.min(100, Math.round((game.discoveredLocations.includes("ruins") ? 20 : 0) + (game.completedPuzzles.filter((id) => ["hallEchoes", "floodedChamber"].includes(id)).length * 18) + (game.dungeonProgress.vaultOpen ? 24 : 0) + (game.completedQuests.includes("echoesRuins") ? 20 : 0))),
        "Starfall Sanctuary": Math.min(100, Math.round((game.discoveredLocations.includes("sanctuary") ? 20 : 0) + (Object.values(game.sanctuaryProgress).filter(Boolean).length * 10) + (game.completedQuests.includes("lastLight") ? 20 : 0))),
      },
    };
  }, [game.achievements.length, game.collectedIds.length, game.completedPuzzles, game.completedQuests, game.discoveredLocations, game.dungeonProgress.vaultOpen, game.inventory, game.sanctuaryProgress, game.secretsFound.length]);

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

  useEffect(() => {
    if (!game.settings.music || !hasStarted) return undefined;
    const timer = window.setInterval(() => playSound(game.currentArea === "ruins" ? "puzzle" : game.currentArea === "forest" ? "transition" : "tap"), 4200);
    return () => window.clearInterval(timer);
  }, [game.currentArea, game.settings.music, hasStarted, playSound]);

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
        if (levelInfo.level >= 4 && !current.achievements.includes("explorerSupreme")) {
          const achievement = achievementCatalog.explorerSupreme;
          setAchievementToasts((items) => [...items, { ...achievement, toastId: crypto.randomUUID() }]);
          window.setTimeout(() => setAchievementToasts((items) => items.slice(1)), 3600);
        }
      }
      return {
        ...current,
        achievements: [
          ...current.achievements,
          ...(leveled && levelInfo.level >= 2 && !current.achievements.includes("growingAdventurer") ? ["growingAdventurer"] : []),
          ...(leveled && levelInfo.level >= 4 && !current.achievements.includes("explorerSupreme") ? ["explorerSupreme"] : []),
        ],
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

  useEffect(() => {
    const timer = window.setInterval(() => {
      setGame((current) => hasStarted ? { ...current, stats: { ...current.stats, playTime: current.stats.playTime + 1 } } : current);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [hasStarted]);

  const nearbyNpc = useMemo(() => areaNpcs.find((npc) => distance(game.player.position, npc) < 8), [areaNpcs, game.player.position]);
  const nearbyCollectible = useMemo(
    () => area.collectibles.find((item) => !game.collectedIds.includes(item.id) && distance(game.player.position, item) < 5.2),
    [area.collectibles, game.collectedIds, game.player.position],
  );
  const nearbyInspectable = useMemo(() => area.inspectables?.find((item) => distance(game.player.position, item) < 6), [area.inspectables, game.player.position]);
  const nearbyEncounter = useMemo(() => areaEncounters.find((item) => distance(game.player.position, item) < 6), [areaEncounters, game.player.position]);
  const nearbyGuardian = useMemo(
    () => game.currentArea === guardianTrial.area && !game.dungeonProgress.vaultOpen && distance(game.player.position, guardianTrial) < 7,
    [game.currentArea, game.dungeonProgress.vaultOpen, game.player.position],
  );
  const nearbyFinalTrial = useMemo(
    () => game.currentArea === constellationTrial.area
      && !game.sanctuaryProgress.finalTrialComplete
      && game.sanctuaryProgress.moonSeal
      && game.sanctuaryProgress.riverSeal
      && game.sanctuaryProgress.treeSeal
      && game.sanctuaryProgress.observatoryReached
      && distance(game.player.position, constellationTrial) < 7,
    [game.currentArea, game.player.position, game.sanctuaryProgress],
  );
  const nearbyPuzzle = useMemo(
    () => [shrinePuzzle, ...ruinsPuzzles].find((candidate) => game.currentArea === candidate.area && !game.completedPuzzles.includes(candidate.id) && distance(game.player.position, candidate) < 6),
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
      const inventory = reward.item && !current.inventory[reward.item] ? addItem(current.inventory, reward.item, 1) : current.inventory;
      return {
        ...current,
        inventory,
        completedQuests: [...current.completedQuests, questId],
        player: {
          ...current.player,
          coins: current.player.coins + reward.coins,
          badge: reward.badge ?? current.player.badge,
          perks: reward.perk && !current.player.perks.includes(reward.perk) ? [...current.player.perks, reward.perk] : current.player.perks,
        },
        stats: { ...current.stats, questsCompleted: current.stats.questsCompleted + 1, npcsHelped: current.stats.npcsHelped + 1, coinsFound: current.stats.coinsFound + reward.coins },
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
    if (zone.requires && zone.to === "ruins" && !game.gateUnlocked) {
      if (!game.inventory[zone.requires]) {
        pushToast(`${zone.label} needs the Old Forest Key.`, "info");
        return;
      }
      setGame((current) => ({ ...current, gateUnlocked: true }));
      updateQuestStep("echoesRuins", "unlock-gate");
      unlockAchievement("gatekeeper");
      pushToast("Ruins Gate unlocked", "quest");
    }
    if (zone.requires && zone.to === "sanctuary" && !game.sanctuaryProgress.vaultOpened) {
      if (!game.inventory[zone.requires] || !game.dungeonProgress.vaultOpen) {
        pushToast("The Sealed Vault needs the Star Compass and a completed Guardian trial.", "info");
        return;
      }
      setGame((current) => ({ ...current, sanctuaryProgress: { ...current.sanctuaryProgress, vaultOpened: true } }));
      updateQuestStep("lastLight", "open-vault");
      pushToast("Sealed Vault opened", "quest");
    }
    setGame((current) => {
      const discoveredLocations = current.discoveredLocations.includes(zone.to) ? current.discoveredLocations : [...current.discoveredLocations, zone.to];
      const nextTransitionCount = current.transitionCount + 1;
      const timeStates = ["Day", "Sunset", "Night"];
      return {
        ...current,
        currentArea: zone.to,
        currentRoom: zone.to === "ruins" ? "entrance" : zone.to === "sanctuary" ? "vaultPassage" : null,
        discoveredLocations,
        transitionCount: nextTransitionCount,
        timeState: current.settings.timeCycle ? timeStates[nextTransitionCount % timeStates.length] : current.timeState,
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
    if (zone.to === "ruins") {
      updateQuestStep("echoesRuins", "enter-ruins");
    }
    if (zone.to === "sanctuary") {
      acceptQuest("lastLight");
      updateQuestStep("lastLight", "enter-sanctuary");
      unlockAchievement("starfall");
    }
  }, [acceptQuest, game.dungeonProgress.vaultOpen, game.gateUnlocked, game.inventory, game.sanctuaryProgress.vaultOpened, playSound, pushToast, unlockAchievement, updateQuestStep]);

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
      const room = current.currentArea === "ruins"
        ? ruinsRooms.find((entry) => distance(candidate, entry) < 14)?.id ?? current.currentRoom
        : current.currentArea === "sanctuary"
          ? sanctuaryRooms.find((entry) => distance(candidate, entry) < 14)?.id ?? current.currentRoom
          : current.currentRoom;
      const discoveredLocations = room && !current.discoveredLocations.includes(room) ? [...current.discoveredLocations, room] : current.discoveredLocations;
      const foundAllRooms = ruinsRooms.every((entry) => discoveredLocations.includes(entry.id));
      const foundAllMajor = ["village", "forest", "ruins", "sanctuary", "heart"].every((id) => discoveredLocations.includes(id));
      return {
        ...current,
        achievements: [
          ...current.achievements,
          ...(foundAllRooms && !current.achievements.includes("ruinsExplorer") ? ["ruinsExplorer"] : []),
          ...(foundAllMajor && !current.achievements.includes("masterExplorer") ? ["masterExplorer"] : []),
        ],
        currentRoom: room,
        discoveredLocations,
        player: { ...current.player, position: candidate },
        stats: { ...current.stats, stepsTaken: current.stats.stepsTaken + 1, areasDiscovered: discoveredLocations.length },
      };
    });
  }, [area.transitionZones, areaTransition, game.player.perks, game.player.position, transitionArea]);

  const collectNearbyItem = useCallback(() => {
    if (!nearbyCollectible) return false;
    setGame((current) => {
      if (current.collectedIds.includes(nearbyCollectible.id)) return current;
      const inventory = addItem(current.inventory, nearbyCollectible.itemId, nearbyCollectible.quantity);
      return {
        ...current,
        achievements: hasAncientRelics(inventory) && !current.achievements.includes("relicHunter") ? [...current.achievements, "relicHunter"] : current.achievements,
        collectedIds: [...current.collectedIds, nearbyCollectible.id],
        inventory,
        player: { ...current.player, coins: current.player.coins + (nearbyCollectible.itemId === "coin" ? nearbyCollectible.quantity : 0) },
        stats: {
          ...current.stats,
          itemsFound: current.stats.itemsFound + nearbyCollectible.quantity,
          coinsFound: current.stats.coinsFound + (nearbyCollectible.itemId === "coin" ? nearbyCollectible.quantity : 0),
          secretsFound: nearbyCollectible.secret ? current.stats.secretsFound + 1 : current.stats.secretsFound,
        },
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
    if (nearbyCollectible.runeFragment) updateQuestStep("echoesRuins", "rune-fragments");
    if (nearbyCollectible.itemId === "moonTablet") updateQuestStep("echoesRuins", "star-compass");
    if (nearbyCollectible.seal) {
      updateQuestStep("lastLight", nearbyCollectible.seal);
      setGame((current) => ({
        ...current,
        sanctuaryProgress: { ...current.sanctuaryProgress, [nearbyCollectible.itemId]: true },
      }));
    }
    if (nearbyCollectible.nightOnly && game.timeState === "Night") unlockAchievement("nightWanderer");
    if (nearbyCollectible.marker) updateQuestStep("woodsWhispers", "markers");
    if (nearbyCollectible.itemId === "moonberry" && game.quests.pipsMoonberries) updateQuestStep("pipsMoonberries", "moonberries", nearbyCollectible.quantity);
    playSound("pickup");
    return true;
  }, [game.quests.pipsMoonberries, game.timeState, nearbyCollectible, playSound, pushToast, unlockAchievement, updateQuestStep]);

  const inspectNearby = useCallback(() => {
    if (!nearbyInspectable) return false;
    setInspect(nearbyInspectable);
    setGame((current) => ({
      ...current,
      inspectedIds: current.inspectedIds.includes(nearbyInspectable.id) ? current.inspectedIds : [...current.inspectedIds, nearbyInspectable.id],
      discoveredLocations: nearbyInspectable.id === "abandoned-camp" && !current.discoveredLocations.includes("camp") ? [...current.discoveredLocations, "camp"] : current.discoveredLocations,
      lore: nearbyInspectable.inscription && !current.lore.includes(nearbyInspectable.id) ? [...current.lore, nearbyInspectable.id] : current.lore,
      secretsFound: nearbyInspectable.secret && !current.secretsFound.includes(nearbyInspectable.id) ? [...current.secretsFound, nearbyInspectable.id] : current.secretsFound,
      stats: { ...current.stats, secretsFound: nearbyInspectable.secret ? current.stats.secretsFound + 1 : current.stats.secretsFound },
    }));
    if (nearbyInspectable.questStep) updateQuestStep(nearbyInspectable.questStep.questId, nearbyInspectable.questStep.stepId);
    if (nearbyInspectable.id === "observatory-map") {
      setGame((current) => ({ ...current, sanctuaryProgress: { ...current.sanctuaryProgress, observatoryReached: true } }));
      updateQuestStep("lastLight", "observatory");
    }
    if (nearbyInspectable.inscription) updateQuestStep("memoryFragments", "inscriptions");
    if (nearbyInspectable.secret) unlockAchievement("secretSeeker");
    return true;
  }, [nearbyInspectable, unlockAchievement, updateQuestStep]);

  const interact = useCallback(() => {
    if (nearbyCollectible) return collectNearbyItem();
    if (nearbyPuzzle) {
      setPuzzle({ puzzle: nearbyPuzzle, selected: [] });
      return true;
    }
    if (nearbyEncounter) {
      setEncounter({ ...nearbyEncounter, log: [nearbyEncounter.description] });
      return true;
    }
    if (nearbyGuardian) {
      setGuardianPanel(true);
      setGame((current) => ({
        ...current,
        guardian: current.guardian ?? { round: 0, input: [], pattern: guardianTrial.pattern, energy: current.player.energy, message: "The Stone Guardian raises three glowing symbols." },
      }));
      return true;
    }
    if (nearbyFinalTrial) {
      setGame((current) => ({
        ...current,
        finalTrial: current.finalTrial ?? { stage: 0, selected: [], stages: constellationTrial.stages, message: "The constellation gate waits for the old patterns." },
      }));
      return true;
    }
    if (nearbyInspectable) return inspectNearby();
    if (!nearbyNpc) {
      pushToast("Nothing nearby wants attention right now.", "info");
      return false;
    }
    if (nearbyNpc.questId) acceptQuest(nearbyNpc.questId, nearbyNpc.questId === "missingLantern" ? "talk-rowan" : null);
    if (nearbyNpc.id === "mira" && game.completedQuests.includes("woodsWhispers")) acceptQuest("echoesRuins");
    if (nearbyNpc.givesItem && !game.inventory[nearbyNpc.givesItem]) {
      setGame((current) => ({ ...current, inventory: addItem(current.inventory, nearbyNpc.givesItem, 1) }));
      pushToast(`${itemCatalog[nearbyNpc.givesItem].name} added to inventory`, "item");
    }
    if (nearbyNpc.id === "rowan" && game.inventory.lantern && !game.completedQuests.includes("missingLantern")) completeQuest("missingLantern");
    if (nearbyNpc.id === "mira" && game.quests.woodsWhispers?.completedSteps.length >= 4 && !game.completedQuests.includes("woodsWhispers")) {
      updateQuestStep("woodsWhispers", "return-mira");
      completeQuest("woodsWhispers");
    }
    if (nearbyNpc.id === "mira" && game.inventory.starCompass && game.quests.echoesRuins?.completedSteps.length >= 7 && !game.completedQuests.includes("echoesRuins")) {
      updateQuestStep("echoesRuins", "return-mira");
      completeQuest("echoesRuins");
    }
    if (nearbyNpc.id === "pip" && game.quests.pipsMoonberries?.completedSteps.includes("moonberries") && !game.completedQuests.includes("pipsMoonberries")) {
      updateQuestStep("pipsMoonberries", "return-pip");
      completeQuest("pipsMoonberries");
    }
    if (nearbyNpc.id === "elyra" && game.quests.memoryFragments?.completedSteps.includes("inscriptions") && !game.completedQuests.includes("memoryFragments")) {
      updateQuestStep("memoryFragments", "return-elyra");
      completeQuest("memoryFragments");
      unlockAchievement("loreKeeper");
    }
    setDialogue({ npc: nearbyNpc, index: 0 });
    return true;
  }, [acceptQuest, collectNearbyItem, completeQuest, game.completedQuests, game.inventory, game.quests.echoesRuins, game.quests.memoryFragments, game.quests.pipsMoonberries, game.quests.woodsWhispers, inspectNearby, nearbyCollectible, nearbyEncounter, nearbyFinalTrial, nearbyGuardian, nearbyInspectable, nearbyNpc, nearbyPuzzle, pushToast, unlockAchievement, updateQuestStep]);

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
    setPuzzle((current) => current ? { ...current, selected: [...current.selected, runeId].slice(0, current.puzzle.sequence.length), message: "" } : current);
  }, []);

  const submitPuzzle = useCallback(() => {
    if (!puzzle) return;
    const solved = puzzle.puzzle.sequence.every((rune, index) => puzzle.selected[index] === rune);
    if (!solved) {
      setPuzzle((current) => ({ ...current, selected: [], message: "The stones dim. Try the clue again." }));
      return;
    }
    setGame((current) => {
      const isShrine = puzzle.puzzle.id === shrinePuzzle.id;
      const discovered = isShrine ? "shrine" : puzzle.puzzle.id;
      return {
        ...current,
        completedPuzzles: current.completedPuzzles.includes(puzzle.puzzle.id) ? current.completedPuzzles : [...current.completedPuzzles, puzzle.puzzle.id],
        inventory: isShrine ? addItem(addItem(current.inventory, shrinePuzzle.rewardItem, 1), "ancientCoin", 1) : addItem(current.inventory, "echoCrystal", 1),
        secretsFound: isShrine && !current.secretsFound.includes("shrine-chest") ? [...current.secretsFound, "shrine-chest"] : current.secretsFound,
        discoveredLocations: current.discoveredLocations.includes(discovered) ? current.discoveredLocations : [...current.discoveredLocations, discovered],
        dungeonProgress: {
          ...current.dungeonProgress,
          echoesSolved: puzzle.puzzle.id === "hallEchoes" ? true : current.dungeonProgress.echoesSolved,
          waterRedirected: puzzle.puzzle.id === "floodedChamber" ? true : current.dungeonProgress.waterRedirected,
        },
        stats: { ...current.stats, puzzlesSolved: current.stats.puzzlesSolved + 1 },
      };
    });
    pushToast(`${puzzle.puzzle.name} solved`, "quest");
    if (puzzle.puzzle.id === shrinePuzzle.id) {
      unlockAchievement("puzzleSolver");
      unlockAchievement("secretSeeker");
    }
    if (puzzle.puzzle.id === "hallEchoes") updateQuestStep("echoesRuins", "hall-echoes");
    playSound("puzzle");
    setPuzzle(null);
  }, [playSound, pushToast, puzzle, unlockAchievement, updateQuestStep]);

  const consumeInventoryItem = useCallback((itemId) => {
    if (itemId === "starTonic" && game.inventory.starTonic) {
      setGame((current) => ({
        ...current,
        inventory: removeItem(current.inventory, "starTonic", 1),
        player: { ...current.player, health: current.player.maxHealth, energy: current.player.maxEnergy },
      }));
      pushToast("Star Tonic restored health and energy.", "item");
      return;
    }
    if (itemId === "travelerSnack" && game.inventory.travelerSnack) {
      setGame((current) => ({
        ...current,
        inventory: removeItem(current.inventory, "travelerSnack", 1),
        player: { ...current.player, energy: Math.min(current.player.maxEnergy, current.player.energy + 2) },
      }));
      pushToast("Traveler Snack restored energy.", "item");
      return;
    }
    if (itemId === "moonberryTonic" && game.inventory.moonberryTonic) {
      setGame((current) => ({
        ...current,
        inventory: removeItem(current.inventory, "moonberryTonic", 1),
        player: { ...current.player, energy: current.player.maxEnergy },
      }));
      pushToast("Moonberry Tonic restored full energy.", "item");
      return;
    }
    if (itemId !== "moonberry" || !game.inventory.moonberry) return;
    setGame((current) => ({
      ...current,
      inventory: removeItem(current.inventory, "moonberry", 1),
      player: { ...current.player, energy: Math.min(current.player.maxEnergy, current.player.energy + 1) },
    }));
    pushToast("Moonberry restored 1 energy.", "item");
  }, [game.inventory.moonberry, game.inventory.moonberryTonic, game.inventory.starTonic, game.inventory.travelerSnack, pushToast]);

  const chooseDialogue = useCallback((npcId, choice) => {
    setGame((current) => ({ ...current, dialogueChoices: { ...current.dialogueChoices, [npcId]: choice.id } }));
    setDialogue({ npc: npcs.find((npc) => npc.id === npcId), index: 0, response: choice.response });
  }, []);

  const craftRecipe = useCallback((recipe) => {
    setGame((current) => {
      if (current.craftedRecipes.includes(recipe.id)) return current;
      const missing = Object.entries(recipe.materials).some(([id, qty]) => (current.inventory[id] ?? 0) < qty);
      if (missing) return current;
      const spent = Object.entries(recipe.materials).reduce((inventory, [id, qty]) => removeItem(inventory, id, qty), current.inventory);
      const nextCrafted = [...current.craftedRecipes, recipe.id];
      const inventory = addItem(spent, recipe.result, 1);
      return {
        ...current,
        craftedRecipes: nextCrafted,
        inventory,
        player: { ...current.player, badge: recipe.id === "explorerPack" ? "Explorer Pack" : current.player.badge },
        stats: { ...current.stats, itemsCrafted: current.stats.itemsCrafted + 1 },
        achievements: [
          ...current.achievements,
          ...(nextCrafted.length >= 3 && !current.achievements.includes("masterCrafter") ? ["masterCrafter"] : []),
          ...(hasAncientRelics(inventory) && !current.achievements.includes("relicHunter") ? ["relicHunter"] : []),
        ],
      };
    });
    pushToast(`Crafted ${recipe.name}`, "item");
    playSound("pickup");
  }, [playSound, pushToast]);

  const guardianAction = useCallback((action) => {
    const symbols = ["Moon", "Tree", "River"];
    if (!game.guardian) return;
    if (action === "observe") {
      setGame((current) => ({ ...current, guardian: { ...current.guardian, message: "Its chest repeats: Moon, Tree, River. The answer is alignment, not force." } }));
      return;
    }
    if (action === "defend" || action === "calm" || action === "useRune") {
      setGame((current) => ({
        ...current,
        player: { ...current.player, energy: Math.max(0, current.player.energy - (current.player.perks.includes("Steady Spirit") ? 0 : 1)) },
        guardian: { ...current.guardian, message: action === "useRune" ? "The Rune Fragment glows, confirming the pattern." : "The Guardian waits for symbols." },
      }));
      return;
    }
    if (!symbols.includes(action)) return;
    setGame((current) => {
      const input = [...current.guardian.input, action];
      const correct = guardianTrial.pattern[input.length - 1] === action;
      if (!correct) {
        return {
          ...current,
          player: { ...current.player, energy: Math.max(0, current.player.energy - 1) },
          guardian: { ...current.guardian, input: [], message: "The wrong symbol dims. Energy slips away." },
        };
      }
      if (input.length < guardianTrial.pattern.length) return { ...current, guardian: { ...current.guardian, input, message: "Correct. Continue the pattern." } };
      const round = current.guardian.round + 1;
      if (round < guardianTrial.rounds) return { ...current, guardian: { ...current.guardian, round, input: [], message: `Round ${round + 1}. The pattern returns.` } };
      const inventory = addItem(addItem(current.inventory, "starCompass", 1), "guardianShard", 1);
      return {
        ...current,
        guardian: null,
        dungeonProgress: { ...current.dungeonProgress, vaultOpen: true },
        solvedEncounters: current.solvedEncounters.includes("stoneGuardian") ? current.solvedEncounters : [...current.solvedEncounters, "stoneGuardian"],
        inventory,
        completedPuzzles: current.completedPuzzles.includes("guardianTrial") ? current.completedPuzzles : [...current.completedPuzzles, "guardianTrial"],
        achievements: hasAncientRelics(inventory) && !current.achievements.includes("relicHunter") ? [...current.achievements, "relicHunter"] : current.achievements,
        stats: { ...current.stats, creaturesCalmed: current.stats.creaturesCalmed + 1, puzzlesSolved: current.stats.puzzlesSolved + 1 },
      };
    });
    const nextRoundComplete = game.guardian.input.length === guardianTrial.pattern.length - 1 && guardianTrial.pattern[game.guardian.input.length] === action;
    if (nextRoundComplete && game.guardian.round === guardianTrial.rounds - 1) {
      updateQuestStep("echoesRuins", "guardian");
      updateQuestStep("echoesRuins", "star-compass");
      unlockAchievement("patternBreaker");
      pushToast("Stone Guardian trial complete", "quest");
      playSound("achievement");
      setGuardianPanel(false);
    }
  }, [game.guardian, playSound, pushToast, unlockAchievement, updateQuestStep]);

  const finalTrialSelect = useCallback((symbol) => {
    setGame((current) => current.finalTrial ? {
      ...current,
      finalTrial: { ...current.finalTrial, selected: [...current.finalTrial.selected, symbol].slice(0, current.finalTrial.stages[current.finalTrial.stage].sequence.length), message: "" },
    } : current);
  }, []);

  const finalTrialReset = useCallback(() => {
    setGame((current) => current.finalTrial ? { ...current, finalTrial: { ...current.finalTrial, selected: [], message: "The stars reset and wait." } } : current);
  }, []);

  const finalTrialSubmit = useCallback(() => {
    setGame((current) => {
      if (!current.finalTrial) return current;
      const stage = current.finalTrial.stages[current.finalTrial.stage];
      const solved = stage.sequence.every((symbol, index) => current.finalTrial.selected[index] === symbol);
      if (!solved) {
        return {
          ...current,
          player: { ...current.player, energy: Math.max(0, current.player.energy - 1) },
          finalTrial: { ...current.finalTrial, selected: [], message: "The constellation dims. Try the clue again." },
        };
      }
      const nextStage = current.finalTrial.stage + 1;
      if (nextStage < current.finalTrial.stages.length) {
        return { ...current, finalTrial: { ...current.finalTrial, stage: nextStage, selected: [], message: "A new constellation wakes." } };
      }
      return {
        ...current,
        completedPuzzles: current.completedPuzzles.includes("constellationTrial") ? current.completedPuzzles : [...current.completedPuzzles, "constellationTrial"],
        finalTrial: null,
        sanctuaryProgress: { ...current.sanctuaryProgress, finalTrialComplete: true },
        stats: { ...current.stats, puzzlesSolved: current.stats.puzzlesSolved + 1 },
      };
    });
    updateQuestStep("lastLight", "final-trial");
    unlockAchievement("constellationKeeper");
    pushToast("Constellation Trial complete", "quest");
    playSound("achievement");
  }, [playSound, pushToast, unlockAchievement, updateQuestStep]);

  const chooseFinalRestoration = useCallback((choice) => {
    const badge = { preserve: "Starbound Keeper", share: "Village Starbearer", renew: "Wildlight Explorer" }[choice];
    setGame((current) => {
      const completedQuests = current.completedQuests.includes("lastLight") ? current.completedQuests : [...current.completedQuests, "lastLight"];
      const completedCollections = collections.every((collection) => collection.items.every((id) => current.inventory[id]));
      const achievements = [
        ...current.achievements,
        ...(completedCollections && !current.achievements.includes("masterCollector") ? ["masterCollector"] : []),
        ...(completedQuests.length >= Object.keys(questCatalog).length && !current.achievements.includes("questKeeper") ? ["questKeeper"] : []),
      ];
      return {
        ...current,
        achievements,
        finalChoice: choice,
        storyComplete: true,
        quests: {
          ...current.quests,
          lastLight: current.quests.lastLight ? {
            ...current.quests.lastLight,
            completedSteps: [...new Set([...current.quests.lastLight.completedSteps, "final-choice", "return-village"])],
          } : current.quests.lastLight,
        },
        player: { ...current.player, badge, coins: current.player.coins + questCatalog.lastLight.reward.coins, perks: current.player.perks.includes("Collector's Instinct") ? current.player.perks : [...current.player.perks, "Collector's Instinct"] },
        completedQuests,
        stats: { ...current.stats, questsCompleted: current.completedQuests.includes("lastLight") ? current.stats.questsCompleted : current.stats.questsCompleted + 1, coinsFound: current.stats.coinsFound + questCatalog.lastLight.reward.coins },
      };
    });
    awardXp(questCatalog.lastLight.reward.xp);
    updateQuestStep("lastLight", "final-choice");
    unlockAchievement("whisperwoodRestored");
    pushToast(`Sanctuary restored: ${choice}`, "quest");
  }, [awardXp, pushToast, unlockAchievement, updateQuestStep]);

  const continuePostGame = useCallback(() => {
    setGame((current) => ({ ...current, postGame: true, storyComplete: false }));
    unlockAchievement("newBeginning");
  }, [unlockAchievement]);

  const updateCustomization = useCallback((key, value) => {
    setGame((current) => ({ ...current, customization: { ...current.customization, [key]: value } }));
  }, []);

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
    areaNpcs,
    areaTransition,
    cycleTrackedQuest,
    dialogue,
    encounter,
    encounterAction,
    finalTrial: game.finalTrial,
    game,
    inspect,
    interact,
    levelToasts,
    movePlayer,
    nearbyCollectible,
    nearbyEncounter,
    nearbyGuardian,
    nearbyInspectable,
    nearbyNpc,
    nearbyPuzzle,
    paused,
    puzzle,
    pushToast,
    recipes,
    recoverAtCamp,
    continuePostGame,
    resetAdventure,
    selectRune,
    setActivePanel,
    setDialogue,
    setEncounter,
    setInspect,
    setPaused,
    setPuzzle,
    setGuardianPanel,
    startAdventure,
    submitPuzzle,
    toasts,
    updateSetting,
    consumeInventoryItem,
    chooseDialogue,
    chooseFinalRestoration,
    craftRecipe,
    currentRoom,
    finalTrialReset,
    finalTrialSelect,
    finalTrialSubmit,
    guardianAction,
    guardianPanel,
    updateCustomization,
    worldProgress,
  };
}
