export function EndingPanel({ game, onContinue, onNew, onTitle, progress }) {
  if (!game.storyComplete) return null;
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="ending-title" className={`game-panel ending-panel ${game.finalChoice}`} role="dialog">
        <h2 id="ending-title">Adventure Complete</h2>
        <p>The sanctuary is restored by your choice to {game.finalChoice}. Whisperwood remembers the stars again.</p>
        <div className="stats-grid">
          <span>Level <strong>{game.player.level}</strong></span>
          <span>Quests Completed <strong>{game.stats.questsCompleted}</strong></span>
          <span>Secrets Found <strong>{game.secretsFound.length} / {progress.totalSecrets}</strong></span>
          <span>Creatures Calmed <strong>{game.stats.creaturesCalmed}</strong></span>
          <span>Items Crafted <strong>{game.stats.itemsCrafted}</strong></span>
          <span>Adventure Progress <strong>{progress.total}%</strong></span>
        </div>
        <div className="dialogue-actions">
          <button className="quest-button" onClick={onContinue} type="button">Continue Exploring</button>
          <button className="quest-button secondary" onClick={onNew} type="button">New Adventure</button>
          <button className="quest-button ghost" onClick={onTitle} type="button">Return to Title</button>
        </div>
      </section>
    </div>
  );
}
