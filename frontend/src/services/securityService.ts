import { apiFetch } from "./apiClient";
import type { EnvironmentName, PublicCertificateInfo } from "../types";

/**
 * GET /security/public-key-certificates
 * Zwraca listę certyfikatów klucza publicznego KSeF.
 * Certyfikat z usage "KsefTokenEncryption" służy do szyfrowania tokena RSA-OAEP.
 */
export function getPublicCertificates(
  environment: EnvironmentName,
): Promise<PublicCertificateInfo[]> {
  return apiFetch<PublicCertificateInfo[]>(
    `/security/certificates?environment=${environment}`,
  );
}
