import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

const directions = [
  ["up", ArrowUp, "Move up"],
  ["left", ArrowLeft, "Move left"],
  ["right", ArrowRight, "Move right"],
  ["down", ArrowDown, "Move down"],
];

export function MobileControls({ controls, onInteract }) {
  const bind = (direction) => ({
    onPointerDown: (event) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      controls.press(direction);
    },
    onPointerUp: () => controls.release(direction),
    onPointerCancel: () => controls.release(direction),
    onPointerLeave: () => controls.release(direction),
  });

  return (
    <>
      <div aria-label="Movement controls" className="mobile-controls">
        {directions.map(([direction, Icon, label]) => (
          <button aria-label={label} className={direction} key={direction} type="button" {...bind(direction)}>
            <Icon size={22} />
          </button>
        ))}
      </div>
      <button aria-label="Interact" className="mobile-interact" onClick={onInteract} type="button">E</button>
    </>
  );
}
