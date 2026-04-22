import { KsefApiError, apiFetch } from "./apiClient";
import type { ContactSubmissionRequest } from "../types";

function mapContactError(error: unknown): Error {
  if (!(error instanceof KsefApiError)) {
    return new Error("Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę.");
  }

  if (error.status === 400) {
    return new Error("Sprawdź pola formularza i spróbuj ponownie.");
  }

  if (error.status === 401 || error.status === 403) {
    return new Error("Brak uprawnień do wysłania wiadomości. Spróbuj ponownie później.");
  }

  if (error.status !== undefined && error.status >= 500) {
    return new Error("Formularz kontaktowy jest chwilowo niedostępny. Spróbuj ponownie później.");
  }

  return new Error(error.message || "Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę.");
}

export async function submitContactMessage(body: ContactSubmissionRequest): Promise<void> {
  try {
    await apiFetch<void>("/contact/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw mapContactError(error);
  }
}
