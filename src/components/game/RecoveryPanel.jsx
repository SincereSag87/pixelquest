import { X } from "lucide-react";

export function RecoveryPanel({ onClose, onRecover, onUseItem, hasMoonberry }) {
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="recovery-title" className="game-panel" role="dialog">
        <div className="panel-header">
          <h2 id="recovery-title">You need a moment to recover...</h2>
          <button aria-label="Close recovery panel" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        <div className="dialogue-actions">
          <button className="quest-button" onClick={onRecover} type="button">Return to Camp</button>
          <button className="quest-button secondary" disabled={!hasMoonberry} onClick={onUseItem} type="button">Use Recovery Item</button>
        </div>
      </section>
    </div>
  );
}
