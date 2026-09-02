export function GameToast({ toasts }) {
  if (!toasts.length) return null;

  return (
    <div aria-live="polite" className="toast-stack">
      {toasts.map((toast) => (
        <div className="game-toast" key={toast.id}>
          <strong>{toast.type === "quest" ? "Quest" : toast.type === "item" ? "Collected" : "PixelQuest"}</strong>
          <div>{toast.message}</div>
        </div>
      ))}
    </div>
  );
}
