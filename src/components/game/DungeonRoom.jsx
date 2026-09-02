export function DungeonRoom({ areaName, room }) {
  if (!room) return null;
  return (
    <div className="room-indicator" aria-live="polite">
      <strong>{room.name}</strong>
      <span>{areaName}</span>
    </div>
  );
}
