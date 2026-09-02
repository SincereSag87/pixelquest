import { X } from "lucide-react";

const outfits = ["Forest Green", "Sunset Red", "Moon Blue", "Ruins Violet"];
const accessories = ["Traveler Scarf", "Explorer Pin", "Moonberry Charm", "Archivist Token", "Star Compass Emblem"];

export function CustomizationPanel({ customization, game, onClose, onUpdate }) {
  const badges = [...new Set(["Forest Explorer Badge", game.player.badge, ...game.player.perks])].filter(Boolean);
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="customize-title" className="game-panel" role="dialog">
        <div className="panel-header">
          <h2 id="customize-title">Customize Explorer</h2>
          <button aria-label="Close customization" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        <Picker label="Explorer Outfit" onUpdate={(value) => onUpdate("outfit", value)} options={outfits} value={customization.outfit} />
        <Picker label="Accessory" onUpdate={(value) => onUpdate("accessory", value)} options={accessories} value={customization.accessory} />
        <Picker label="Badge" onUpdate={(value) => onUpdate("badge", value)} options={badges} value={customization.badge} />
      </section>
    </div>
  );
}

function Picker({ label, onUpdate, options, value }) {
  return (
    <section>
      <h3>{label}</h3>
      <div className="tab-row">
        {options.map((option) => <button className={value === option ? "active" : ""} key={option} onClick={() => onUpdate(option)} type="button">{option}</button>)}
      </div>
    </section>
  );
}
