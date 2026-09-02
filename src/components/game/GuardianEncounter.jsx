import { X } from "lucide-react";

const symbols = ["Moon", "Tree", "River"];

export function GuardianEncounter({ guardian, onAction, onClose }) {
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="guardian-title" className="game-panel guardian-panel" role="dialog">
        <div className="panel-header">
          <h2 id="guardian-title">STONE GUARDIAN</h2>
          <button aria-label="Close guardian trial" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        <div className="guardian-core" aria-hidden="true">SG</div>
        <p><strong>Trial Progress:</strong> {Array.from({ length: 3 }, (_, index) => <span className="trial-dot" key={index}>{index < guardian.round ? "●" : "○"}</span>)}</p>
        <p><strong>Energy:</strong> {guardian.energy}</p>
        <p><strong>Current Pattern:</strong> {guardian.pattern.join(" -> ")}</p>
        <p aria-live="polite" className="dialogue-text">{guardian.message}</p>
        <div className="dialogue-actions">
          <button className="quest-button secondary" onClick={() => onAction("observe")} type="button">Observe</button>
          <button className="quest-button secondary" onClick={() => onAction("useRune")} type="button">Use Rune</button>
          <button className="quest-button ghost" onClick={() => onAction("defend")} type="button">Defend</button>
          <button className="quest-button ghost" onClick={() => onAction("calm")} type="button">Calm</button>
        </div>
        <div className="rune-grid">
          {symbols.map((symbol) => <button className="rune-button" key={symbol} onClick={() => onAction(symbol)} type="button">{symbol}</button>)}
        </div>
      </section>
    </div>
  );
}
