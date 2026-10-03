import { useCallback, useEffect, useState } from "react";

export function useQuery<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const run = useCallback(() => { setLoading(true); fn().then(setData).finally(() => setLoading(false)); }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(run, [run]);
  return { data, loading, refetch: run };
}
