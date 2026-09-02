import { Backpack, CircleHelp, Heart, Map, Pause, ScrollText, Settings, Star, Trophy, UserRound, Zap } from "lucide-react";

export function GameHUD({ game, onCycleQuest, onPanel, onPause, trackedQuest }) {
  const questName = trackedQuest.catalog?.name ?? "Explore Whisperwood";
  const objective = trackedQuest.step?.label ?? "Find your next lead";
  const progress = trackedQuest.total > 1 ? `${trackedQuest.count} / ${trackedQuest.total}` : "";

  return (
    <header className="hud" aria-label="Game status">
      <div className="hud-stats">
        <span className="stat-pill"><Star size={17} /> {game.player.name}</span>
        <span className="stat-pill">Lv {game.player.level}</span>
        <span className="stat-pill" aria-label={`${game.player.health} health`}>
          {Array.from({ length: game.player.health }, (_, index) => (
            <Heart fill="currentColor" key={index} size={16} />
          ))}
        </span>
        <span className="stat-pill"><Zap size={16} /> {game.player.energy} / {game.player.maxEnergy}</span>
        <span className="stat-pill">{game.player.coins} coins</span>
        <span className="stat-pill">{game.player.xp} / 100 XP</span>
        <button className="quest-pill tracked-quest" onClick={onCycleQuest} type="button">
          <Trophy size={17} />
          <span><strong>{questName}</strong><small>{objective} {progress}</small></span>
        </button>
      </div>
      <nav className="hud-actions" aria-label="Game panels">
        <button aria-label="Character" className="icon-button" onClick={() => onPanel("character")} type="button"><UserRound size={19} /></button>
        <button aria-label="Inventory" className="icon-button" onClick={() => onPanel("inventory")} type="button"><Backpack size={19} /></button>
        <button aria-label="Quest Log" className="icon-button" onClick={() => onPanel("quests")} type="button"><ScrollText size={19} /></button>
        <button aria-label="Map" className="icon-button" onClick={() => onPanel("map")} type="button"><Map size={19} /></button>
        <button aria-label="Settings" className="icon-button" onClick={() => onPanel("settings")} type="button"><Settings size={19} /></button>
        <button aria-label="Help" className="icon-button" onClick={() => onPanel("help")} type="button"><CircleHelp size={19} /></button>
        <button aria-label="Pause" className="icon-button" onClick={onPause} type="button"><Pause size={19} /></button>
      </nav>
    </header>
  );
}
