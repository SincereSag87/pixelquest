import { Lock, MapPin, X } from "lucide-react";
import { mapLocations } from "../../data/worldData";

export function MapPanel({ onClose, onLocked }) {
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="map-title" className="game-panel" role="dialog">
        <div className="panel-header">
          <h2 id="map-title">Whisperwood Map</h2>
          <button aria-label="Close map" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        <div className="map-grid">
          {mapLocations.map((location) => {
            const locked = location.status === "Locked" || location.status === "Coming Soon";
            return (
              <button
                className={`map-location ${location.id === "village" ? "current" : ""}`}
                key={location.id}
                onClick={() => locked && onLocked(location)}
                type="button"
              >
                {locked ? <Lock size={18} /> : <MapPin size={18} />}
                <strong>{location.name}</strong>
                <span>{location.status}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
