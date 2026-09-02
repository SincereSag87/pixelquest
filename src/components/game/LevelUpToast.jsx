export function LevelUpToast({ levels }) {
  if (!levels.length) return null;
  return (
    <div aria-live="polite" className="toast-stack level-stack">
      {levels.map((level) => (
        <div className="achievement-toast" key={level.id}>
          <strong>Level Up: Level {level.level}</strong>
          <div>Max energy increased. New paths feel a little easier.</div>
        </div>
      ))}
    </div>
  );
}
