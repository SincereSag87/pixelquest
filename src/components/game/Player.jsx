export function Player({ customization, position }) {
  const outfitClass = customization?.outfit?.toLowerCase().replaceAll(" ", "-") ?? "forest-green";
  return (
    <div
      aria-label="Explorer player character"
      className={`entity player ${outfitClass}`}
      role="img"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      <span className="player-hat" />
      <span className="player-head" />
      <span className="player-body" />
      <span className="player-accessory">{customization?.accessory?.slice(0, 1) ?? ""}</span>
    </div>
  );
}
