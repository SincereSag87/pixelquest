import { X } from "lucide-react";

export function CharacterPanel({ areaName, game, onClose }) {
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="character-title" className="game-panel" role="dialog">
        <div className="panel-header">
          <h2 id="character-title">Explorer</h2>
          <button aria-label="Close character panel" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        <div className="character-sheet">
          <div className="character-avatar" aria-hidden="true"><span className="player-hat" /><span className="player-head" /><span className="player-body" /></div>
          <div>
            <p><strong>Level:</strong> {game.player.level}</p>
            <p><strong>XP:</strong> {game.player.xp}</p>
            <p><strong>Health:</strong> {game.player.health} / {game.player.maxHealth}</p>
            <p><strong>Energy:</strong> {game.player.energy} / {game.player.maxEnergy}</p>
            <p><strong>Coins:</strong> {game.player.coins}</p>
            <p><strong>Badge:</strong> {game.player.badge}</p>
            <p><strong>Location:</strong> {areaName}</p>
          </div>
        </div>
        <h3>Perks</h3>
        <div className="perk-list">
          {game.player.perks.length ? game.player.perks.map((perk) => <span key={perk}>{perk}</span>) : <p className="muted">No perks unlocked yet.</p>}
        </div>
        <h3>Adventure Stats</h3>
        <div className="stats-grid">
          <span>Items Found <strong>{game.stats.itemsFound}</strong></span>
          <span>Steps Taken <strong>{game.stats.stepsTaken}</strong></span>
          <span>Coins Found <strong>{game.stats.coinsFound}</strong></span>
          <span>Quests Completed <strong>{game.stats.questsCompleted}</strong></span>
          <span>Puzzles Solved <strong>{game.stats.puzzlesSolved}</strong></span>
          <span>Creatures Calmed <strong>{game.stats.creaturesCalmed}</strong></span>
          <span>Areas Discovered <strong>{game.stats.areasDiscovered}</strong></span>
          <span>Items Crafted <strong>{game.stats.itemsCrafted}</strong></span>
          <span>NPCs Helped <strong>{game.stats.npcsHelped}</strong></span>
          <span>Secrets Found <strong>{game.secretsFound.length}</strong></span>
          <span>Play Time <strong>{formatTime(game.stats.playTime)}</strong></span>
        </div>
      </section>
    </div>
  );
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return hours ? `${hours}h ${remaining}m` : `${remaining}m`;
}
