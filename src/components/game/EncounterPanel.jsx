import { X } from "lucide-react";

export function EncounterPanel({ encounter, energy, onAction, onClose }) {
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="encounter-title" className="game-panel" role="dialog">
        <div className="panel-header">
          <h2 id="encounter-title">{encounter.name}</h2>
          <button aria-label="Close encounter" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        <div className="encounter-avatar">{encounter.icon}</div>
        <div aria-live="polite" className="dialogue-text">
          {encounter.log.map((line) => <p key={line}>{line}</p>)}
        </div>
        <div className="dialogue-actions">
          <button className="quest-button secondary" onClick={() => onAction("observe")} type="button">Observe</button>
          <button className="quest-button secondary" disabled={energy < 1} onClick={() => onAction("defend")} type="button">Defend</button>
          <button className="quest-button" onClick={() => onAction("calm")} type="button">Calm</button>
          <button className="quest-button ghost" onClick={() => onAction("use")} type="button">Use Item</button>
          <button className="quest-button ghost" onClick={() => onAction("flee")} type="button">Flee</button>
        </div>
      </section>
    </div>
  );
}
