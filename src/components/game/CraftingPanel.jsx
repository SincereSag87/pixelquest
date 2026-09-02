import { X } from "lucide-react";
import { itemCatalog } from "../../data/itemData";

export function CraftingPanel({ crafted, inventory, onClose, onCraft, recipes }) {
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="craft-title" className="game-panel" role="dialog">
        <div className="panel-header">
          <h2 id="craft-title">Crafting</h2>
          <button aria-label="Close crafting" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        <div className="craft-grid">
          {recipes.map((recipe) => {
            const missing = Object.entries(recipe.materials).filter(([id, qty]) => (inventory[id] ?? 0) < qty);
            return (
              <article className="quest-card" key={recipe.id}>
                <h3>{recipe.name}</h3>
                <p>{recipe.effect}</p>
                <ul className="objective-list">
                  {Object.entries(recipe.materials).map(([id, qty]) => (
                    <li key={id}><span>{itemCatalog[id].name}</span><span>{inventory[id] ?? 0} / {qty}</span></li>
                  ))}
                </ul>
                <button className="quest-button secondary" disabled={missing.length > 0 || crafted.includes(recipe.id)} onClick={() => onCraft(recipe)} type="button">
                  {crafted.includes(recipe.id) ? "Crafted" : missing.length ? "Missing materials" : "Craft"}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
