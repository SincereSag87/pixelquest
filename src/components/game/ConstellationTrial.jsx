import { X } from "lucide-react";

const symbols = ["Moon", "River", "Tree", "Star"];

export function ConstellationTrial({ onClose, onReset, onSelect, onSubmit, trial }) {
  const stage = trial.stages[trial.stage] ?? trial.stages.at(-1);
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="constellation-title" className="game-panel constellation-panel" role="dialog">
        <div className="panel-header">
          <h2 id="constellation-title">Constellation Trial</h2>
          <button aria-label="Close constellation trial" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        <div className="constellation-nodes" aria-hidden="true">
          {symbols.map((symbol) => <span key={symbol}>{symbol.slice(0, 1)}</span>)}
        </div>
        <p><strong>Stage:</strong> {Math.min(trial.stage + 1, trial.stages.length)} / {trial.stages.length}</p>
        <p><strong>Clue:</strong> {stage.clue}</p>
        <p aria-live="polite"><strong>Selected Path:</strong> {trial.selected.join(" -> ") || "None"}</p>
        {trial.message ? <p className="muted">{trial.message}</p> : null}
        <div className="rune-grid">
          {symbols.map((symbol) => <button className="rune-button" key={symbol} onClick={() => onSelect(symbol)} type="button">{symbol}</button>)}
        </div>
        <div className="dialogue-actions">
          <button className="quest-button secondary" onClick={onReset} type="button">Reset</button>
          <button className="quest-button" onClick={onSubmit} type="button">Submit</button>
        </div>
      </section>
    </div>
  );
}
