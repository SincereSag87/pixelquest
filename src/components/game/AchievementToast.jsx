export function AchievementToast({ achievements }) {
  if (!achievements.length) return null;

  return (
    <div aria-live="polite" className="toast-stack achievement-stack">
      {achievements.map((achievement) => (
        <div className="achievement-toast" key={achievement.toastId}>
          <strong>{achievement.icon} Achievement unlocked: {achievement.name}</strong>
          <div>{achievement.description}</div>
        </div>
      ))}
    </div>
  );
}
