import { useCallback, useState } from "react";
import { AchievementToast } from "./components/game/AchievementToast";
import { AreaTransition } from "./components/game/AreaTransition";
import { CharacterPanel } from "./components/game/CharacterPanel";
import { CollectionsPanel } from "./components/game/CollectionsPanel";
import { ConstellationTrial } from "./components/game/ConstellationTrial";
import { CraftingPanel } from "./components/game/CraftingPanel";
import { CustomizationPanel } from "./components/game/CustomizationPanel";
import { DayNightIndicator } from "./components/game/DayNightIndicator";
import { DialoguePanel } from "./components/game/DialoguePanel";
import { DungeonRoom } from "./components/game/DungeonRoom";
import { EndingPanel } from "./components/game/EndingPanel";
import { EncounterPanel } from "./components/game/EncounterPanel";
import { GameHUD } from "./components/game/GameHUD";
import { GameToast } from "./components/game/GameToast";
import { GameWorld } from "./components/game/GameWorld";
import { GuardianEncounter } from "./components/game/GuardianEncounter";
import { HelpPanel } from "./components/game/HelpPanel";
import { HintsPanel } from "./components/game/HintsPanel";
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
    chooseFinalRestoration,
    cycleTrackedQuest,
    craftRecipe,
    currentRoom,
    continuePostGame,
    dialogue,
    encounter,
    encounterAction,
    finalTrial,
    finalTrialReset,
    finalTrialSelect,
    finalTrialSubmit,
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
    updateCustomization,
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
    enabled: screen === "game" && !paused && !activePanel && !dialogue && !encounter && !puzzle && !inspect && !guardianPanel && !finalTrial && !game.storyComplete,
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
    <div className={`app-shell ${game.timeState.toLowerCase()} ${game.settings.reducedEffects ? "reduced-effects" : ""} ${game.settings.presentationMode ? "presentation-mode" : ""}`}>
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
          <DungeonRoom areaName={area.name} room={currentRoom} />
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
      {activePanel === "customize" ? <CustomizationPanel customization={game.customization} game={game} onClose={closePanel} onUpdate={updateCustomization} /> : null}
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
      {activePanel === "hints" ? <HintsPanel game={game} onClose={closePanel} progress={worldProgress} /> : null}
      {activePanel === "help" ? <HelpPanel onClose={closePanel} /> : null}
      {encounter ? <EncounterPanel encounter={encounter} energy={game.player.energy} onAction={encounterAction} onClose={() => setEncounter(null)} /> : null}
      {guardianPanel && game.guardian ? <GuardianEncounter guardian={game.guardian} onAction={guardianAction} onClose={() => setGuardianPanel(false)} /> : null}
      {finalTrial ? <ConstellationTrial onClose={finalTrialReset} onReset={finalTrialReset} onSelect={finalTrialSelect} onSubmit={finalTrialSubmit} trial={finalTrial} /> : null}
      {game.sanctuaryProgress.finalTrialComplete && !game.finalChoice ? <FinalChoicePanel onChoose={chooseFinalRestoration} /> : null}
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
      <EndingPanel game={game} onContinue={continuePostGame} onNew={restart} onTitle={returnToTitle} progress={worldProgress} />
    </div>
  );
}

function FinalChoicePanel({ onChoose }) {
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="final-choice-title" className="game-panel" role="dialog">
        <h2 id="final-choice-title">Restore the Sanctuary</h2>
        <p>The ancient force is protective, but it needs a new promise.</p>
        <div className="dialogue-actions">
          <button className="quest-button" onClick={() => onChoose("preserve")} type="button">Preserve</button>
          <button className="quest-button secondary" onClick={() => onChoose("share")} type="button">Share</button>
          <button className="quest-button ghost" onClick={() => onChoose("renew")} type="button">Renew</button>
        </div>
      </section>
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
