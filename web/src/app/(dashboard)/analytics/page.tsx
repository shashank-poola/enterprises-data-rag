"use client";

import { useEffect, useState } from "react";
import { apiAnalyticsSummary } from "@/lib/api";
import type { AnalyticsSummary } from "@/types";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5">
      <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-semibold text-stone-900 mt-2">{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiAnalyticsSummary()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-8 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-stone-900">Analytics</h1>
          <p className="text-sm text-stone-500 mt-0.5">Workspace usage overview</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-xl p-5 h-24 animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total documents" value={data.total_documents} />
              <StatCard
                label="Indexed"
                value={data.indexed_documents}
                sub={`${data.total_documents - data.indexed_documents} pending`}
              />
              <StatCard label="Total queries" value={data.total_queries} />
              <StatCard
                label="Avg. latency"
                value={`${data.avg_latency_ms}ms`}
                sub="last 100 queries"
              />
            </div>

            {/* Recent queries */}
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100">
                <h2 className="text-sm font-medium text-stone-900">Recent queries</h2>
              </div>
              {data.recent_queries.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-stone-400">No queries yet</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="px-5 py-2.5 text-left text-xs font-medium text-stone-500">Query</th>
                      <th className="px-5 py-2.5 text-right text-xs font-medium text-stone-500 w-24">Latency</th>
                      <th className="px-5 py-2.5 text-right text-xs font-medium text-stone-500 w-36">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_queries.map((q) => (
                      <tr key={q.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                        <td className="px-5 py-3 text-stone-700 max-w-0">
                          <p className="truncate">{q.query}</p>
                        </td>
                        <td className="px-5 py-3 text-right text-stone-500 tabular-nums">{q.latency_ms}ms</td>
                        <td className="px-5 py-3 text-right text-stone-400 tabular-nums text-xs">
                          {new Date(q.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
