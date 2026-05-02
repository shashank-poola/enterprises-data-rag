import type { AnalyticsSummary } from "@/types";
import { request } from "./client";

export function apiAnalyticsSummary() {
  return request<AnalyticsSummary>("/api/v1/analytics/summary");
}
