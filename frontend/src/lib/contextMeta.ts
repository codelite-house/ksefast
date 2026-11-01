import type { ContextIdentifierType } from "../types";

export interface ContextMeta {
  label: string;
  placeholder: string;
  helperText: string;
  validate: (value: string) => string | null;
}

export const CONTEXT_META: Record<ContextIdentifierType, ContextMeta> = {
  Nip: {
    label: "Numer NIP firmy",
    placeholder: "Wpisz NIP swojej firmy",
    helperText: "10-cyfrowy NIP podatnika",
    validate: (v) =>
      /^\d{10}$/.test(v.trim())
        ? null
        : "NIP musi składać się z dokładnie 10 cyfr",
  },
  NipVatUe: {
    label: "Numer VAT UE",
    placeholder: "np. PL1234567890",
    helperText: "Kod kraju UE (2 litery) + numer VAT UE",
    validate: (v) =>
      /^[A-Za-z]{2}[A-Za-z0-9]{2,12}$/.test(v.trim())
        ? null
        : "Nieprawidłowy format (np. PL1234567890)",
  },
  InternalId: {
    label: "Identyfikator wewnętrzny",
    placeholder: "np. 12345678",
    helperText: "Wewnętrzny identyfikator podatnika w KSeF",
    validate: (v) => (v.trim() ? null : "Wymagane"),
  },
  PeppolId: {
    label: "Peppol ID",
    placeholder: "np. iso6523-actorid-upis::0106:1234567890",
    helperText: "Identyfikator Peppol (schemat::wartość)",
    validate: (v) =>
      v.includes("::")
        ? null
        : 'Peppol ID musi zawierać separator "::" (np. iso6523-actorid-upis::0106:1234567890)',
  },
};

const NIP_WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7];

/** Suma kontrolna polskiego NIP (10 cyfr, wagi 6-5-7-2-3-4-5-6-7, mod 11). */
export const hasValidNipChecksum = (value: string) => {
  if (!/^\d{10}$/.test(value)) return false;
  const digits = value.split("").map(Number);
  const sum = NIP_WEIGHTS.reduce((acc, weight, index) => acc + weight * digits[index], 0);
  const control = sum % 11;
  return control !== 10 && control === digits[9];
};
