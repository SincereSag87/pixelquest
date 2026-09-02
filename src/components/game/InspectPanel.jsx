import { X } from "lucide-react";

export function InspectPanel({ inspect, onClose }) {
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="inspect-title" className="game-panel" role="dialog">
        <div className="panel-header">
          <h2 id="inspect-title">{inspect.title}</h2>
          <button aria-label="Close inspection" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        <p className="dialogue-text">{inspect.text}</p>
      </section>
    </div>
  );
}
