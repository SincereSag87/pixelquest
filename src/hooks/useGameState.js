import { useCallback, useEffect, useMemo, useState } from "react";
import { achievements as achievementCatalog } from "../data/achievementData";
import { itemCatalog } from "../data/itemData";
import { npcs } from "../data/npcData";
import { quests as questCatalog } from "../data/questData";
import { collectibles, obstacles, WORLD_BOUNDS } from "../data/worldData";
import { SAVE_KEY, clearSave, loadSave } from "./useLocalSave";

export const initialState = {
  player: {
    name: "Explorer",
    level: 1,
    health: 3,
    coins: 0,
    xp: 0,
    position: { x: 50, y: 62 },
  },
  inventory: {},
  collectedIds: [],
  quests: {},
  completedQuests: [],
  achievements: [],
};

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function isBlocked(position) {
  return obstacles.some((obstacle) => {
    const halfW = obstacle.width / 2;
    const halfH = obstacle.height / 2;
    return (
      position.x >= obstacle.x - halfW &&
      position.x <= obstacle.x + halfW &&
      position.y >= obstacle.y - halfH &&
      position.y <= obstacle.y + halfH
    );
  });
}

function addItemToInventory(inventory, itemId, quantity) {
  const existing = inventory[itemId] ?? 0;
  return { ...inventory, [itemId]: existing + quantity };
}

function makeToast(message, type = "info") {
  return { id: crypto.randomUUID(), message, type };
}

export function useGameState({ loadExisting = false } = {}) {
  const [game, setGame] = useState(() => {
    const saved = loadExisting ? loadSave() : null;
    return saved ?? initialState;
  });
  const [hasStarted, setHasStarted] = useState(loadExisting);
  const [toasts, setToasts] = useState([]);
  const [achievementToasts, setAchievementToasts] = useState([]);
  const [dialogue, setDialogue] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [paused, setPaused] = useState(false);

  const pushToast = useCallback((message, type = "info") => {
    const toast = makeToast(message, type);
    setToasts((items) => [...items, toast]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== toast.id));
    }, 2600);
  }, []);

  const unlockAchievement = useCallback((achievementId) => {
    setGame((current) => {
      if (current.achievements.includes(achievementId)) return current;
      const achievement = achievementCatalog[achievementId];
      setAchievementToasts((items) => [...items, { ...achievement, toastId: crypto.randomUUID() }]);
      window.setTimeout(() => {
        setAchievementToasts((items) => items.slice(1));
      }, 3400);
      return { ...current, achievements: [...current.achievements, achievementId] };
    });
  }, []);

  useEffect(() => {
    if (hasStarted) localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  }, [game, hasStarted]);

  const nearbyNpc = useMemo(
    () => npcs.find((npc) => distance(game.player.position, npc) < 8),
    [game.player.position],
  );

  const nearbyCollectible = useMemo(
    () =>
      collectibles.find(
        (item) => !game.collectedIds.includes(item.id) && distance(game.player.position, item) < 5.2,
      ),
    [game.collectedIds, game.player.position],
  );

  const movePlayer = useCallback((dx, dy, elapsed) => {
    setGame((current) => {
      const speed = 0.55 * elapsed;
      const length = Math.hypot(dx, dy) || 1;
      const candidate = {
        x: Math.min(
          WORLD_BOUNDS.width - WORLD_BOUNDS.padding,
          Math.max(WORLD_BOUNDS.padding, current.player.position.x + (dx / length) * speed),
        ),
        y: Math.min(
          WORLD_BOUNDS.height - WORLD_BOUNDS.padding,
          Math.max(WORLD_BOUNDS.padding, current.player.position.y + (dy / length) * speed),
        ),
      };
      if (isBlocked(candidate)) return current;
      return { ...current, player: { ...current.player, position: candidate } };
    });
  }, []);

  const acceptQuest = useCallback((questId) => {
    setGame((current) => {
      if (current.quests[questId] || current.completedQuests.includes(questId)) return current;
      pushToast(`Quest accepted: ${questCatalog[questId].name}`, "quest");
      return {
        ...current,
        quests: {
          ...current.quests,
          [questId]: { id: questId, completedSteps: ["talk-rowan"], acceptedAt: Date.now() },
        },
      };
    });
    unlockAchievement("helpfulStranger");
  }, [pushToast, unlockAchievement]);

  const completeMissingLantern = useCallback(() => {
    setGame((current) => {
      const quest = current.quests.missingLantern;
      if (!quest || current.completedQuests.includes("missingLantern") || !current.inventory.lantern) return current;
      return {
        ...current,
        quests: {
          ...current.quests,
          missingLantern: {
            ...quest,
            completedSteps: ["talk-rowan", "search-path", "find-lantern", "return-rowan"],
          },
        },
        completedQuests: [...current.completedQuests, "missingLantern"],
        player: {
          ...current.player,
          xp: current.player.xp + questCatalog.missingLantern.reward.xp,
          coins: current.player.coins + questCatalog.missingLantern.reward.coins,
        },
      };
    });
    pushToast("Quest completed: The Missing Lantern", "quest");
    unlockAchievement("forestExplorer");
  }, [pushToast, unlockAchievement]);

  const collectNearbyItem = useCallback(() => {
    if (!nearbyCollectible) return false;
    const item = itemCatalog[nearbyCollectible.itemId];
    setGame((current) => {
      if (current.collectedIds.includes(nearbyCollectible.id)) return current;
      const inventory = addItemToInventory(current.inventory, nearbyCollectible.itemId, nearbyCollectible.quantity);
      const quest = current.quests.missingLantern;
      const completedSteps = new Set(quest?.completedSteps ?? []);
      if (nearbyCollectible.itemId === "lantern" && quest) {
        completedSteps.add("search-path");
        completedSteps.add("find-lantern");
      }

      return {
        ...current,
        collectedIds: [...current.collectedIds, nearbyCollectible.id],
        inventory,
        quests: quest
          ? {
              ...current.quests,
              missingLantern: { ...quest, completedSteps: [...completedSteps] },
            }
          : current.quests,
        player: {
          ...current.player,
          coins: current.player.coins + (nearbyCollectible.itemId === "coin" ? nearbyCollectible.quantity : 0),
        },
      };
    });
    pushToast(nearbyCollectible.label, "item");
    unlockAchievement("treasureHunter");
    if (item.id === "lantern") pushToast("Quest updated: return the lantern to Rowan", "quest");
    return true;
  }, [nearbyCollectible, pushToast, unlockAchievement]);

  const interact = useCallback(() => {
    if (nearbyCollectible) {
      collectNearbyItem();
      return;
    }

    if (!nearbyNpc) {
      pushToast("Nothing nearby wants to chat right now.", "info");
      return;
    }

    if (nearbyNpc.id === "rowan") {
      if (!game.quests.missingLantern && !game.completedQuests.includes("missingLantern")) {
        acceptQuest("missingLantern");
      } else if (game.inventory.lantern && !game.completedQuests.includes("missingLantern")) {
        completeMissingLantern();
      }
    }

    if (nearbyNpc.givesItem && !game.inventory[nearbyNpc.givesItem]) {
      setGame((current) => ({
        ...current,
        inventory: addItemToInventory(current.inventory, nearbyNpc.givesItem, 1),
      }));
      pushToast(`${itemCatalog[nearbyNpc.givesItem].name} added to inventory`, "item");
    }

    setDialogue({ npc: nearbyNpc, index: 0 });
  }, [
    acceptQuest,
    collectNearbyItem,
    completeMissingLantern,
    game.completedQuests,
    game.inventory,
    game.quests.missingLantern,
    nearbyCollectible,
    nearbyNpc,
    pushToast,
  ]);

  const startAdventure = useCallback((mode = "new") => {
    const next = mode === "continue" ? loadSave() ?? initialState : initialState;
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
    achievementToasts,
    dialogue,
    game,
    interact,
    movePlayer,
    nearbyCollectible,
    nearbyNpc,
    paused,
    pushToast,
    resetAdventure,
    setActivePanel,
    setDialogue,
    setPaused,
    startAdventure,
    toasts,
  };
}
