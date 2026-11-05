import { ksefFetch } from "./apiClient";
import type { EnvironmentName, PublicCertificateInfo } from "../types";

/**
 * GET /security/public-key-certificates
 * Zwraca listę certyfikatów klucza publicznego KSeF.
 * Certyfikat z usage "KsefTokenEncryption" służy do szyfrowania tokena RSA-OAEP.
 */
export const getPublicCertificates = (
  environment: EnvironmentName,
): Promise<PublicCertificateInfo[]> =>
  ksefFetch<PublicCertificateInfo[]>(
    `/security/certificates?environment=${environment}`,
  );
