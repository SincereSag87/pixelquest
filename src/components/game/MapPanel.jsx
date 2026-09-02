import { Lock, MapPin, X } from "lucide-react";
import { mapLocations } from "../../data/worldData";

export function MapPanel({ currentArea, discoveredLocations, onClose, onLocked }) {
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="map-title" className="game-panel" role="dialog">
        <div className="panel-header">
          <h2 id="map-title">Whisperwood Map</h2>
          <button aria-label="Close map" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        <div className="map-grid">
          {mapLocations.map((location) => {
            const locked = location.status === "locked";
            const discovered = discoveredLocations.includes(location.id) || discoveredLocations.includes(location.area);
            return (
              <button
                className={`map-location ${location.area === currentArea ? "current" : ""}`}
                key={location.id}
                onClick={() => locked && onLocked(location)}
                type="button"
              >
                {locked ? <Lock size={18} /> : <MapPin size={18} />}
                <strong>{location.name}</strong>
                <span>{locked ? "locked" : discovered ? "discovered" : "undiscovered"}</span>
                {location.area === currentArea ? <small>Player nearby</small> : null}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
