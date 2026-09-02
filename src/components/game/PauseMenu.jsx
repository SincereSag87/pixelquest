import { X } from "lucide-react";

export function PauseMenu({ onHelp, onReset, onResume, onTitle }) {
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="pause-title" className="game-panel" role="dialog">
        <div className="panel-header">
          <h2 id="pause-title">Paused</h2>
          <button aria-label="Resume game" className="close-button" onClick={onResume} type="button"><X size={20} /></button>
        </div>
        <div className="pause-actions">
          <button className="quest-button" onClick={onResume} type="button">Resume</button>
          <button className="quest-button secondary" onClick={onHelp} type="button">How to Play</button>
          <button className="quest-button ghost" onClick={onReset} type="button">Restart Adventure</button>
          <button className="quest-button ghost" onClick={onTitle} type="button">Return to Title</button>
        </div>
      </section>
    </div>
  );
}
