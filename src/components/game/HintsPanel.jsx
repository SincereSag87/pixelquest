import { X } from "lucide-react";

export function HintsPanel({ game, onClose, progress }) {
  const hints = [
    ["Whisperwood Village", progress.areas["Whisperwood Village"] < 100 ? "A familiar errand still echoes near the campfire." : "Village story threads are complete."],
    ["Old Forest Path", progress.areas["Old Forest Path"] < 100 ? "One secret remains near running water or old stone." : "The forest has shared its best secrets."],
    ["Ancient Ruins", progress.areas["Ancient Ruins"] < 100 ? "An inscription or vault clue has not been discovered." : "The ruins are well understood."],
    ["Starfall Sanctuary", progress.areas["Starfall Sanctuary"] < 100 ? "A hidden relic lies beyond the garden." : "The sanctuary glows with restored memory."],
  ];
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="hints-title" className="game-panel" role="dialog">
        <div className="panel-header">
          <h2 id="hints-title">Explorer Hints</h2>
          <button aria-label="Close hints" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        {game.settings.completionHints ? hints.map(([area, hint]) => <article className="quest-card" key={area}><h3>{area}</h3><p>{hint}</p></article>) : <p className="muted">Completion hints are disabled in Settings.</p>}
      </section>
    </div>
  );
}
