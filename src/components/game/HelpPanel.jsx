import { X } from "lucide-react";

export function HelpPanel({ onClose }) {
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="help-title" className="game-panel" role="dialog">
        <div className="panel-header">
          <h2 id="help-title">How to Play</h2>
          <button aria-label="Close help" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        <ul className="help-list">
          <li><kbd>WASD</kbd> or <kbd>Arrow Keys</kbd> Move</li>
          <li><kbd>E</kbd> Interact / collect / talk</li>
          <li><kbd>I</kbd> Inventory</li>
          <li><kbd>Q</kbd> Quest Log</li>
          <li><kbd>M</kbd> Map</li>
          <li><kbd>Esc</kbd> Pause</li>
          <li><kbd>HUD</kbd> Crafting, Collections, Character, Settings</li>
        </ul>
      </section>
    </div>
  );
}
