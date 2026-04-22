import { KsefApiError, apiFetch } from "./apiClient";
import type { ContactSubmissionRequest } from "../types";

function mapContactError(error: unknown): Error {
  if (!(error instanceof KsefApiError)) {
    return new Error("Nie udalo sie wyslac wiadomosci. Sprobuj ponownie za chwile.");
  }

  if (error.status === 400) {
    return new Error("Sprawdz pola formularza i sprobuj ponownie.");
  }

  if (error.status === 401 || error.status === 403) {
    return new Error("Brak uprawnien do wyslania wiadomosci. Sprobuj ponownie pozniej.");
  }

  if (error.status !== undefined && error.status >= 500) {
    return new Error("Formularz kontaktowy jest chwilowo niedostepny. Sprobuj ponownie pozniej.");
  }

  return new Error(error.message || "Nie udalo sie wyslac wiadomosci. Sprobuj ponownie za chwile.");
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
