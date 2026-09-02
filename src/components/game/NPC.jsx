export function NPC({ npc, isNearby }) {
  return (
    <div
      className="entity npc"
      style={{ left: `${npc.x}%`, top: `${npc.y}%` }}
      aria-label={`${npc.name}. ${npc.personality}`}
      role="img"
    >
      <span className="npc-label">{npc.name}</span>
      <span aria-hidden="true">{npc.icon}</span>
      {isNearby ? <span className="interaction-prompt">Press E to talk</span> : null}
    </div>
  );
}
