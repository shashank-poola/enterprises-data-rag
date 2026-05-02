import { useCallback, useEffect, useState } from "react";
import { apiListDocuments } from "@/lib/api/documents";
import type { Document } from "@/types";

export function useDocuments() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiListDocuments()
      .then((res) => setDocs(res.documents))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const addDocument = useCallback((doc: Document) => {
    setDocs((prev) => [doc, ...prev]);
  }, []);

  const removeDocument = useCallback((id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const indexedCount = docs.filter((d) => d.status === "indexed").length;

  return { docs, loading, error, indexedCount, addDocument, removeDocument };
}
