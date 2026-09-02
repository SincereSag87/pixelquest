import { useCallback, useState } from "react";
import { AchievementToast } from "./components/game/AchievementToast";
import { AreaTransition } from "./components/game/AreaTransition";
import { CharacterPanel } from "./components/game/CharacterPanel";
import { CollectionsPanel } from "./components/game/CollectionsPanel";
import { CraftingPanel } from "./components/game/CraftingPanel";
import { DayNightIndicator } from "./components/game/DayNightIndicator";
import { DialoguePanel } from "./components/game/DialoguePanel";
import { DungeonRoom } from "./components/game/DungeonRoom";
import { EncounterPanel } from "./components/game/EncounterPanel";
import { GameHUD } from "./components/game/GameHUD";
import { GameToast } from "./components/game/GameToast";
import { GameWorld } from "./components/game/GameWorld";
import { GuardianEncounter } from "./components/game/GuardianEncounter";
import { HelpPanel } from "./components/game/HelpPanel";
import { InspectPanel } from "./components/game/InspectPanel";
import { InventoryPanel } from "./components/game/InventoryPanel";
import { LevelUpToast } from "./components/game/LevelUpToast";
import { MapPanel } from "./components/game/MapPanel";
import { MobileControls } from "./components/game/MobileControls";
import { PauseMenu } from "./components/game/PauseMenu";
import { PuzzlePanel } from "./components/game/PuzzlePanel";
import { QuestLog } from "./components/game/QuestLog";
import { RecoveryPanel } from "./components/game/RecoveryPanel";
import { SettingsPanel } from "./components/game/SettingsPanel";
import { TitleScreen } from "./components/game/TitleScreen";
import { areas, mapLocations } from "./data/worldData";
import { useGameState } from "./hooks/useGameState";
import { loadSave, useHasSave } from "./hooks/useLocalSave";
import { usePlayerMovement } from "./hooks/usePlayerMovement";

export default function App() {
  const [screen, setScreen] = useState("title");
  const [hasSave, refreshHasSave] = useHasSave();
  const gameState = useGameState();
  const {
    activePanel,
    activeTrackedQuest,
    achievementToasts,
    area,
    areaNpcs,
    areaTransition,
    chooseDialogue,
    cycleTrackedQuest,
    craftRecipe,
    currentRoom,
    dialogue,
    encounter,
    encounterAction,
    game,
    guardianAction,
    guardianPanel,
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
    recipes,
    recoverAtCamp,
    resetAdventure,
    selectRune,
    setActivePanel,
    setDialogue,
    setEncounter,
    setGuardianPanel,
    setInspect,
    setPaused,
    setPuzzle,
    startAdventure,
    submitPuzzle,
    toasts,
    updateSetting,
    consumeInventoryItem,
    worldProgress,
  } = gameState;

  const openPanel = useCallback((panel) => {
    setActivePanel(panel);
    setPaused(false);
  }, [setActivePanel, setPaused]);

  const closePanel = useCallback(() => {
    setActivePanel(null);
  }, [setActivePanel]);

  const start = useCallback((mode) => {
    startAdventure(mode);
    refreshHasSave();
    setScreen("game");
  }, [refreshHasSave, startAdventure]);

  const shortcut = useCallback((target) => {
    if (screen !== "game") return;
    if (target === "pause") {
      setPaused((current) => !current);
      setActivePanel(null);
      return;
    }
    openPanel(target);
  }, [openPanel, screen, setActivePanel, setPaused]);

  const controls = usePlayerMovement({
    enabled: screen === "game" && !paused && !activePanel && !dialogue && !encounter && !puzzle && !inspect && !guardianPanel,
    movePlayer,
    onInteract: interact,
    onShortcut: shortcut,
  });

  const returnToTitle = () => {
    setPaused(false);
    setActivePanel(null);
    setDialogue(null);
    refreshHasSave();
    setScreen("title");
  };

  const restart = () => {
    if (resetAdventure()) {
      refreshHasSave();
      setScreen("game");
    }
  };

  const saveSummary = hasSave ? summarizeSave(loadSave()) : null;

  return (
    <div className={`app-shell ${game.timeState.toLowerCase()} ${game.settings.reducedEffects ? "reduced-effects" : ""}`}>
      {screen === "title" ? (
        <TitleScreen
          hasSave={hasSave}
          onContinue={() => start("continue")}
          onHelp={() => openPanel("help")}
          onStart={() => start("new")}
          saveSummary={saveSummary}
        />
      ) : (
        <main className="game-layout">
          <GameHUD game={game} onCycleQuest={cycleTrackedQuest} onPanel={openPanel} onPause={() => setPaused(true)} trackedQuest={activeTrackedQuest} />
          <DayNightIndicator timeState={game.timeState} />
          <DungeonRoom room={currentRoom} />
          <GameWorld
            area={area}
            areaNpcs={areaNpcs}
            collectedIds={game.collectedIds}
            game={game}
            nearbyCollectible={nearbyCollectible}
            nearbyEncounter={nearbyEncounter}
            nearbyInspectable={nearbyInspectable}
            nearbyNpc={nearbyNpc}
            nearbyPuzzle={nearbyPuzzle}
            player={game.player}
          />
          <MobileControls controls={controls} onInteract={interact} />
        </main>
      )}

      {dialogue ? (
        <DialoguePanel
          dialogue={dialogue}
          onClose={() => setDialogue(null)}
          onChoice={chooseDialogue}
          onNext={() => setDialogue((current) => ({ ...current, index: current.index + 1 }))}
        />
      ) : null}

      {activePanel === "character" ? <CharacterPanel areaName={area.name} game={game} onClose={closePanel} /> : null}
      {activePanel === "inventory" ? <InventoryPanel inventory={game.inventory} onClose={closePanel} onUse={consumeInventoryItem} /> : null}
      {activePanel === "quests" ? <QuestLog game={game} onClose={closePanel} /> : null}
      {activePanel === "map" ? (
        <MapPanel
          currentArea={game.currentArea}
          discoveredLocations={game.discoveredLocations}
          onClose={closePanel}
          onLocked={(location) => {
            pushToast(`${location.name} remains locked until the ruins open.`, "info");
          }}
          progress={worldProgress}
        />
      ) : null}
      {activePanel === "settings" ? <SettingsPanel onClose={closePanel} onReset={restart} onUpdate={updateSetting} settings={game.settings} /> : null}
      {activePanel === "crafting" ? <CraftingPanel crafted={game.craftedRecipes} inventory={game.inventory} onClose={closePanel} onCraft={craftRecipe} recipes={recipes} /> : null}
      {activePanel === "collections" ? <CollectionsPanel game={game} onClose={closePanel} progress={worldProgress} /> : null}
      {activePanel === "help" ? <HelpPanel onClose={closePanel} /> : null}
      {encounter ? <EncounterPanel encounter={encounter} energy={game.player.energy} onAction={encounterAction} onClose={() => setEncounter(null)} /> : null}
      {guardianPanel && game.guardian ? <GuardianEncounter guardian={game.guardian} onAction={guardianAction} onClose={() => setGuardianPanel(false)} /> : null}
      {puzzle ? (
        <PuzzlePanel
          onClose={() => setPuzzle(null)}
          onReset={() => setPuzzle((current) => ({ ...current, selected: [] }))}
          onSelect={selectRune}
          onSubmit={submitPuzzle}
          puzzle={puzzle}
        />
      ) : null}
      {inspect ? <InspectPanel inspect={inspect} onClose={() => setInspect(null)} /> : null}
      {game.player.health <= 0 ? <RecoveryPanel hasMoonberry={Boolean(game.inventory.moonberry)} onClose={recoverAtCamp} onRecover={recoverAtCamp} onUseItem={() => consumeInventoryItem("moonberry")} /> : null}
      {paused ? (
        <PauseMenu
          onHelp={() => openPanel("help")}
          onReset={restart}
          onResume={() => setPaused(false)}
          onTitle={returnToTitle}
        />
      ) : null}
      <AreaTransition transition={areaTransition} />
      <AchievementToast achievements={achievementToasts} />
      <LevelUpToast levels={levelToasts} />
      <GameToast toasts={toasts} />
    </div>
  );
}

function summarizeSave(save) {
  if (!save) return null;
  const areaName = areas[save.currentArea]?.name ?? "Whisperwood Village";
  const discovered = save.discoveredLocations?.length ?? 1;
  return {
    level: save.player?.level ?? 1,
    area: areaName,
    room: save.currentRoom,
    questsCompleted: save.completedQuests?.length ?? 0,
    worldPercent: Math.min(100, Math.round((discovered / mapLocations.length) * 100)),
    secrets: save.secretsFound?.length ?? 0,
    playTime: save.stats?.playTime ?? 0,
  };
}
