import { X } from "lucide-react";
import { collections } from "../../data/collectionData";
import { itemCatalog } from "../../data/itemData";

export function CollectionsPanel({ game, onClose, progress }) {
  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="collections-title" className="game-panel" role="dialog">
        <div className="panel-header">
          <h2 id="collections-title">Collections</h2>
          <button aria-label="Close collections" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        <WorldProgress progress={progress} />
        {collections.map((collection) => {
          const found = collection.items.filter((id) => game.inventory[id]);
          return (
            <article className="quest-card" key={collection.id}>
              <h3>{collection.name}</h3>
              <p>{collection.type}: {found.length} / {collection.items.length}</p>
              <div className="collection-list">
                {collection.items.map((id) => <span key={id}>{game.inventory[id] ? itemCatalog[id].name : "???"}</span>)}
              </div>
              <p className="muted">Reward: {collection.reward}</p>
            </article>
          );
        })}
        <article className="quest-card">
          <h3>Secrets</h3>
          <p>{game.secretsFound.length} / {progress.totalSecrets}</p>
          <div className="collection-list">
            {Array.from({ length: progress.totalSecrets }, (_, index) => <span key={index}>{game.secretsFound[index] ?? "???"}</span>)}
          </div>
        </article>
      </section>
    </div>
  );
}

export function WorldProgress({ progress }) {
  return (
    <section className="world-progress">
      <h3>Adventure Progress</h3>
      <strong>{progress.total}%</strong>
      <div className="stats-grid">
        {Object.entries(progress.areas).map(([area, value]) => <span key={area}>{area} <strong>{value}%</strong></span>)}
      </div>
    </section>
  );
}
