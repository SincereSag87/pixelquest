import { X } from "lucide-react";

export function SettingsPanel({ onClose, onReset, onUpdate, settings }) {
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="settings-title" className="game-panel" role="dialog">
        <div className="panel-header">
          <h2 id="settings-title">Settings</h2>
          <button aria-label="Close settings" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        <label className="setting-row"><span>Music</span><input checked={settings.music} onChange={(event) => onUpdate("music", event.target.checked)} type="checkbox" /></label>
        <label className="setting-row"><span>Sound Effects</span><input checked={settings.sfx} onChange={(event) => onUpdate("sfx", event.target.checked)} type="checkbox" /></label>
        <label className="setting-row"><span>Volume</span><input max="1" min="0" onChange={(event) => onUpdate("volume", Number(event.target.value))} step="0.05" type="range" value={settings.volume} /></label>
        <label className="setting-row"><span>Reduced Effects</span><input checked={settings.reducedEffects} onChange={(event) => onUpdate("reducedEffects", event.target.checked)} type="checkbox" /></label>
        <label className="setting-row"><span>Show Interaction Prompts</span><input checked={settings.showPrompts} onChange={(event) => onUpdate("showPrompts", event.target.checked)} type="checkbox" /></label>
        <button className="quest-button ghost" onClick={onReset} type="button">Reset Adventure</button>
      </section>
    </div>
  );
}
