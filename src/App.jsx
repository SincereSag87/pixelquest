import { useCallback, useState } from "react";
import { AchievementToast } from "./components/game/AchievementToast";
import { DialoguePanel } from "./components/game/DialoguePanel";
import { GameHUD } from "./components/game/GameHUD";
import { GameToast } from "./components/game/GameToast";
import { GameWorld } from "./components/game/GameWorld";
import { HelpPanel } from "./components/game/HelpPanel";
import { InventoryPanel } from "./components/game/InventoryPanel";
import { MapPanel } from "./components/game/MapPanel";
import { MobileControls } from "./components/game/MobileControls";
import { PauseMenu } from "./components/game/PauseMenu";
import { QuestLog } from "./components/game/QuestLog";
import { TitleScreen } from "./components/game/TitleScreen";
import { useGameState } from "./hooks/useGameState";
import { useHasSave } from "./hooks/useLocalSave";
import { usePlayerMovement } from "./hooks/usePlayerMovement";

export default function App() {
  const [screen, setScreen] = useState("title");
  const [hasSave, refreshHasSave] = useHasSave();
  const gameState = useGameState();
  const {
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
    enabled: screen === "game" && !paused && !activePanel && !dialogue,
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

  return (
    <div className="app-shell">
      {screen === "title" ? (
        <TitleScreen
          hasSave={hasSave}
          onContinue={() => start("continue")}
          onHelp={() => openPanel("help")}
          onStart={() => start("new")}
        />
      ) : (
        <main className="game-layout">
          <GameHUD game={game} onPanel={openPanel} onPause={() => setPaused(true)} />
          <GameWorld
            collectedIds={game.collectedIds}
            nearbyCollectible={nearbyCollectible}
            nearbyNpc={nearbyNpc}
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

      {activePanel === "inventory" ? <InventoryPanel inventory={game.inventory} onClose={closePanel} /> : null}
      {activePanel === "quests" ? <QuestLog game={game} onClose={closePanel} /> : null}
      {activePanel === "map" ? (
        <MapPanel
          onClose={closePanel}
          onLocked={(location) => {
            pushToast(`${location.name} is ${location.status.toLowerCase()} in Phase 1.`, "info");
          }}
        />
      ) : null}
      {activePanel === "help" ? <HelpPanel onClose={closePanel} /> : null}
      {paused ? (
        <PauseMenu
          onHelp={() => openPanel("help")}
          onReset={restart}
          onResume={() => setPaused(false)}
          onTitle={returnToTitle}
        />
      ) : null}
      <AchievementToast achievements={achievementToasts} />
      <GameToast toasts={toasts} />
    </div>
  );
}
