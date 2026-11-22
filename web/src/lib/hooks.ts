import { useEffect, useState } from "preact/hooks";

import { pathFromHash } from "./format";

/** Current route derived from `location.hash`, updated on navigation. */
export function useHashPath(): string {
  const [path, setPath] = useState(() => pathFromHash(location.hash));

  useEffect(() => {
    const onChange = () => setPath(pathFromHash(location.hash));

    window.addEventListener("hashchange", onChange);

    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return path;
}
