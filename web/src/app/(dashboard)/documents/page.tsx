"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiDeleteDocument, apiListDocuments, apiUploadDocument } from "@/lib/api";
import type { Document } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  indexed: "bg-green-50 text-green-700 border-green-200",
  indexing: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-stone-50 text-stone-600 border-stone-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

const FILE_ICONS: Record<string, string> = {
  pdf: "PDF",
  csv: "CSV",
  txt: "TXT",
  md: "MD",
};

function DocumentCard({ doc, onDelete }: { doc: Document; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${doc.name}"?`)) return;
    setDeleting(true);
    await apiDeleteDocument(doc.id);
    onDelete(doc.id);
  }

  const date = new Date(doc.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-stone-600">
            {FILE_ICONS[doc.file_type] ?? doc.file_type.toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-900 truncate">{doc.name}</p>
          <p className="text-xs text-stone-400 mt-0.5">{date}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium ${STATUS_STYLES[doc.status] ?? STATUS_STYLES.pending}`}
          >
            {doc.status === "indexing" && (
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 animate-pulse" />
            )}
            {doc.status}
          </span>
          {doc.status === "indexed" && (
            <span className="text-xs text-stone-400">{doc.chunk_count} chunks</span>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-stone-400 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          {deleting ? "…" : "Delete"}
        </button>
      </div>

      {doc.error && (
        <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 truncate">{doc.error}</p>
      )}
    </div>
  );
}

function UploadZone({ onUploaded }: { onUploaded: (doc: Document) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setUploadError("");
      setUploading(true);
      for (const file of Array.from(files)) {
        try {
          const doc = await apiUploadDocument(file);
          onUploaded(doc);
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : "Upload failed");
        }
      }
      setUploading(false);
    },
    [onUploaded]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        dragging ? "border-stone-400 bg-stone-100" : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.csv,.txt,.md"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex flex-col items-center gap-2">
        {uploading ? (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-400 animate-spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <p className="text-sm text-stone-500">Uploading…</p>
          </>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-400">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div>
              <p className="text-sm font-medium text-stone-700">
                {dragging ? "Drop files here" : "Drop files or click to upload"}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">PDF, CSV, TXT, MD supported</p>
            </div>
          </>
        )}
      </div>
      {uploadError && <p className="text-xs text-red-500 mt-3">{uploadError}</p>}
    </div>
  );
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiListDocuments()
      .then((res) => setDocs(res.documents))
      .finally(() => setLoading(false));
  }, []);

  function handleUploaded(doc: Document) {
    setDocs((prev) => [doc, ...prev]);
  }

  function handleDeleted(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-stone-900">Documents</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {docs.filter((d) => d.status === "indexed").length} of {docs.length} indexed
          </p>
        </div>

        {/* Upload */}
        <div className="mb-8">
          <UploadZone onUploaded={handleUploaded} />
        </div>

        {/* Document grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-xl p-4 h-28 animate-pulse" />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-400 text-sm">No documents yet. Upload your first file above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {docs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} onDelete={handleDeleted} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
