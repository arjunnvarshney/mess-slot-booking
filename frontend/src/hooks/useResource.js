import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { errorMessage } from "../services/utils";
export default function useResource(url, interval = 0) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    const load = async () => {
      if (pending || controller.signal.aborted) return;
      pending = true;
      setState((previous) => ({ ...previous, loading: true, error: "" }));
      try {
        const response = await api.get(url, { signal: controller.signal });
        if (!controller.signal.aborted)
          setState({ data: response.data, loading: false, error: "" });
      } catch (error) {
        if (!controller.signal.aborted)
          setState((previous) => ({
            ...previous,
            loading: false,
            error: errorMessage(error),
          }));
      } finally {
        pending = false;
      }
    };
    Promise.resolve().then(load);
    const timer = interval ? setInterval(load, interval) : null;
    return () => {
      controller.abort();
      if (timer) clearInterval(timer);
    };
  }, [url, version, interval]);
  return { ...state, reload };
}
