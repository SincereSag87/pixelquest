export function Player({ position }) {
  return (
    <div
      aria-label="Explorer player character"
      className="entity player"
      role="img"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      <span className="player-hat" />
      <span className="player-head" />
      <span className="player-body" />
    </div>
  );
}
