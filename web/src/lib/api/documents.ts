import type { Document } from "@/types";
import { authHeader, request } from "./client";

export function apiListDocuments() {
  return request<{ documents: Document[]; total: number }>("/api/v1/documents");
}

export function apiUploadDocument(file: File) {
  const form = new FormData();
  form.append("file", file);
  return request<Document>("/api/v1/documents", {
    method: "POST",
    headers: authHeader(), // no Content-Type — browser sets multipart boundary
    body: form,
  });
}

export async function apiDeleteDocument(id: string): Promise<void> {
  await fetch(`/api/v1/documents/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
}
