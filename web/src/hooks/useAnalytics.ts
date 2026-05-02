import { useEffect, useState } from "react";
import { apiAnalyticsSummary } from "@/lib/api/analytics";
import type { AnalyticsSummary } from "@/types";

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiAnalyticsSummary()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
