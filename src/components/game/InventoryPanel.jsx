import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { itemCatalog } from "../../data/itemData";

const sections = [
  ["quest", "Quest Items"],
  ["materials", "Materials"],
  ["collectibles", "Collectibles"],
];

export function InventoryPanel({ inventory, onClose, onUse }) {
  const items = useMemo(
    () =>
      Object.entries(inventory)
        .filter(([, quantity]) => quantity > 0)
        .map(([itemId, quantity]) => ({ ...itemCatalog[itemId], quantity })),
    [inventory],
  );
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? null);
  const [activeTab, setActiveTab] = useState("quest");
  const selected = items.find((item) => item.id === selectedId);

  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="inventory-title" className="game-panel" role="dialog">
        <div className="panel-header">
          <h2 id="inventory-title">Inventory</h2>
          <button aria-label="Close inventory" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        {items.length ? null : <p className="muted">Your pack is empty. Explore the village to find something useful.</p>}
        <div className="tab-row" role="tablist" aria-label="Inventory categories">
          {sections.map(([category, label]) => (
            <button className={activeTab === category ? "active" : ""} key={category} onClick={() => setActiveTab(category)} role="tab" type="button">
              {label}
            </button>
          ))}
        </div>
        <div className="item-grid">
          {items.filter((item) => item.category === activeTab).map((item) => (
            <button
              className={`item-card ${selectedId === item.id ? "selected" : ""}`}
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              type="button"
            >
              <span className="item-icon">{item.icon}</span>
              <strong>{item.name}</strong>
              <span>Qty {item.quantity}</span>
              <small>{item.rarity}</small>
            </button>
          ))}
        </div>
        {selected ? (
          <aside className="item-detail">
            <h3>{selected.name}</h3>
            <p><strong>Rarity:</strong> {selected.rarity}</p>
            <p>{selected.description}</p>
            {selected.usable ? <button className="quest-button secondary" onClick={() => onUse(selected.id)} type="button">Use item</button> : null}
          </aside>
        ) : null}
      </section>
    </div>
  );
}
