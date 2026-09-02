import { useCallback, useState } from "react";
import { AchievementToast } from "./components/game/AchievementToast";
import { AreaTransition } from "./components/game/AreaTransition";
import { CharacterPanel } from "./components/game/CharacterPanel";
import { DialoguePanel } from "./components/game/DialoguePanel";
import { EncounterPanel } from "./components/game/EncounterPanel";
import { GameHUD } from "./components/game/GameHUD";
import { GameToast } from "./components/game/GameToast";
import { GameWorld } from "./components/game/GameWorld";
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
    enabled: screen === "game" && !paused && !activePanel && !dialogue && !encounter && !puzzle && !inspect,
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
    <div className={`app-shell ${game.settings.reducedEffects ? "reduced-effects" : ""}`}>
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
          <GameWorld
            area={area}
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
            pushToast(`${location.name} remains locked in Phase 2.`, "info");
          }}
        />
      ) : null}
      {activePanel === "settings" ? <SettingsPanel onClose={closePanel} onReset={restart} onUpdate={updateSetting} settings={game.settings} /> : null}
      {activePanel === "help" ? <HelpPanel onClose={closePanel} /> : null}
      {encounter ? <EncounterPanel encounter={encounter} energy={game.player.energy} onAction={encounterAction} onClose={() => setEncounter(null)} /> : null}
      {puzzle ? (
        <PuzzlePanel
          onClose={() => setPuzzle(null)}
          onReset={() => setPuzzle({ selected: [] })}
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
    questsCompleted: save.completedQuests?.length ?? 0,
    worldPercent: Math.min(100, Math.round((discovered / mapLocations.length) * 100)),
  };
}
