import { useState, useCallback } from "react";

type UseBooleanReturn = [
  boolean,
  {
    on: () => void;
    off: () => void;
    toggle: () => void;
  }
];

/**
 * Custom hook to manage boolean state with convenient on/off/toggle functions
 */
export function useBoolean(initialValue = false): UseBooleanReturn {
  const [value, setValue] = useState(initialValue);

  const on = useCallback(() => setValue(true), []);
  const off = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue(prev => !prev), []);

  return [value, { on, off, toggle }];
}
