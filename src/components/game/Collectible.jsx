import { itemCatalog } from "../../data/itemData";

export function Collectible({ collectible, isNearby }) {
  const item = itemCatalog[collectible.itemId];

  return (
    <div
      aria-label={`Collectible ${item.name}`}
      className="entity collectible"
      role="img"
      style={{ left: `${collectible.x}%`, top: `${collectible.y}%` }}
    >
      <span className="collectible-label">{item.name}</span>
      <span aria-hidden="true">{item.icon}</span>
      {isNearby ? <span className="interaction-prompt">Press E to collect</span> : null}
    </div>
  );
}
