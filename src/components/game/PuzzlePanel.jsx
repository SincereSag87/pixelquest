import { shrinePuzzle } from "../../data/puzzleData";
import { X } from "lucide-react";

export function PuzzlePanel({ onClose, onReset, onSelect, onSubmit, puzzle }) {
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="puzzle-title" className="game-panel" role="dialog">
        <div className="panel-header">
          <h2 id="puzzle-title">{shrinePuzzle.name}</h2>
          <button aria-label="Close puzzle" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        <p><strong>Clue:</strong> {shrinePuzzle.clue}</p>
        <div className="rune-grid">
          {shrinePuzzle.runes.map((rune) => (
            <button className="rune-button" key={rune.id} onClick={() => onSelect(rune.id)} type="button">
              <strong>{rune.symbol}</strong>
              <span>{rune.label}</span>
            </button>
          ))}
        </div>
        <p aria-live="polite"><strong>Selected:</strong> {puzzle.selected.join(" > ") || "None"}</p>
        {puzzle.message ? <p className="muted">{puzzle.message}</p> : null}
        <div className="dialogue-actions">
          <button className="quest-button secondary" onClick={onReset} type="button">Reset</button>
          <button className="quest-button" onClick={onSubmit} type="button">Submit</button>
        </div>
      </section>
    </div>
  );
}
