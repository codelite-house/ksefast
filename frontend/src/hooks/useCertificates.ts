import { useQuery } from "@tanstack/react-query";
import { getPublicCertificates } from "../services/securityService";
import type { EnvironmentName } from "../types";

/**
 * Pobiera certyfikaty klucza publicznego KSeF.
 * Dane są cachowane przez 5 minut — certyfikaty zmieniają się rzadko.
 * Używany do pre-fetch przed formularzem i do szyfrowania tokena.
 */
export const useCertificates = (environment: EnvironmentName) =>
  useQuery({
    queryKey: ["ksef", "certificates", environment],
    queryFn: () => getPublicCertificates(environment),
    staleTime: 5 * 60 * 1000,
  });
