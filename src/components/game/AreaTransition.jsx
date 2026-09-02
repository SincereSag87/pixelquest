export function AreaTransition({ transition }) {
  if (!transition) return null;
  return (
    <div className="area-transition" aria-live="assertive">
      <strong>{transition.title}</strong>
      <span>{transition.subtitle}</span>
    </div>
  );
}
