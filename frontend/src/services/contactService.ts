import { apiFetch } from "./apiClient";
import type { ContactSubmissionRequest } from "../types";

export function submitContactMessage(body: ContactSubmissionRequest): Promise<void> {
  return apiFetch<void>("/contact/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
