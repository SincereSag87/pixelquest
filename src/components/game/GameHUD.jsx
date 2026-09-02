import { Backpack, CircleHelp, Heart, Map, Pause, ScrollText, Star, Trophy } from "lucide-react";
import { quests } from "../../data/questData";

export function GameHUD({ game, onPanel, onPause }) {
  const activeQuest = game.completedQuests.includes("missingLantern")
    ? "Village Hero"
    : quests.missingLantern.name;

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
        <span className="stat-pill">{game.player.coins} coins</span>
        <span className="stat-pill">{game.player.xp} / 100 XP</span>
        <span className="quest-pill"><Trophy size={17} /> {activeQuest}</span>
      </div>
      <nav className="hud-actions" aria-label="Game panels">
        <button aria-label="Inventory" className="icon-button" onClick={() => onPanel("inventory")} type="button"><Backpack size={19} /></button>
        <button aria-label="Quest Log" className="icon-button" onClick={() => onPanel("quests")} type="button"><ScrollText size={19} /></button>
        <button aria-label="Map" className="icon-button" onClick={() => onPanel("map")} type="button"><Map size={19} /></button>
        <button aria-label="Help" className="icon-button" onClick={() => onPanel("help")} type="button"><CircleHelp size={19} /></button>
        <button aria-label="Pause" className="icon-button" onClick={onPause} type="button"><Pause size={19} /></button>
      </nav>
    </header>
  );
}
