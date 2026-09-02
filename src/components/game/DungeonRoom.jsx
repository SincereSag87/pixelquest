export function DungeonRoom({ room }) {
  if (!room) return null;
  return (
    <div className="room-indicator" aria-live="polite">
      <strong>{room.name}</strong>
      <span>Ancient Ruins</span>
    </div>
  );
}
