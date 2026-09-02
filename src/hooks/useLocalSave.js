import { useCallback, useEffect, useState } from "react";

export const SAVE_KEY = "pixelquest-save-v1";

export function loadSave() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function useHasSave() {
  const [hasSave, setHasSave] = useState(() => Boolean(loadSave()));

  const refresh = useCallback(() => {
    setHasSave(Boolean(loadSave()));
  }, []);

  useEffect(() => {
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [refresh]);

  return [hasSave, refresh];
}
