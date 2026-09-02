import { useEffect, useRef } from "react";

const keyMap = {
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
};

export function usePlayerMovement({ enabled, movePlayer, onInteract, onShortcut }) {
  const keysRef = useRef(new Set());
  const mobileRef = useRef(new Set());

  useEffect(() => {
    const onKeyDown = (event) => {
      const direction = keyMap[event.code];
      if (direction) {
        event.preventDefault();
        keysRef.current.add(direction);
        return;
      }

      if (event.code === "KeyE") onInteract();
      if (event.code === "KeyI") onShortcut("inventory");
      if (event.code === "KeyQ") onShortcut("quests");
      if (event.code === "KeyM") onShortcut("map");
      if (event.code === "Escape") onShortcut("pause");
    };

    const onKeyUp = (event) => {
      const direction = keyMap[event.code];
      if (direction) keysRef.current.delete(direction);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [onInteract, onShortcut]);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();

    const tick = (now) => {
      const elapsed = Math.min((now - previous) / 16.67, 2);
      previous = now;

      if (enabled) {
        const active = new Set([...keysRef.current, ...mobileRef.current]);
        let dx = 0;
        let dy = 0;
        if (active.has("up")) dy -= 1;
        if (active.has("down")) dy += 1;
        if (active.has("left")) dx -= 1;
        if (active.has("right")) dx += 1;
        if (dx || dy) movePlayer(dx, dy, elapsed);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled, movePlayer]);

  return {
    press(direction) {
      mobileRef.current.add(direction);
    },
    release(direction) {
      mobileRef.current.delete(direction);
    },
  };
}
