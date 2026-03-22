import { apiFetch } from "./apiClient";
import type {
  EnvironmentName,
  KsefChallengeResponse,
  InitTokenAuthRequest,
  KsefInitAuthResponse,
  KsefAuthStatusResponse,
  KsefTokensResponse,
} from "../types";

/**
 * POST /auth/challenge
 * Krok 1 autoryzacji: pobierz challenge i timestampMs do zaszyfrowania tokena.
 */
export function getChallenge(
  environment: EnvironmentName,
): Promise<KsefChallengeResponse> {
  return apiFetch<KsefChallengeResponse>(
    `/auth/challenge?environment=${environment}`,
    {
      method: "POST",
    },
  );
}

/**
 * POST /auth/token  (proxy → POST /auth/ksef-token w KSeF v2)
 * Krok 2 autoryzacji: zainicjuj autoryzację zaszyfrowanym tokenem.
 * Zwraca referenceNumber i tymczasowy authenticationToken.
 */
export function initTokenAuth(
  environment: EnvironmentName,
  body: InitTokenAuthRequest,
): Promise<KsefInitAuthResponse> {
  return apiFetch<KsefInitAuthResponse>(
    `/auth/token?environment=${environment}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

/**
 * GET /auth/status  (proxy → GET /auth/{referenceNumber} w KSeF v2)
 * Krok 3 autoryzacji: sprawdź status (polling), aż status.code === 200.
 */
export function getAuthStatus(
  environment: EnvironmentName,
  referenceNumber: string,
  authToken: string,
): Promise<KsefAuthStatusResponse> {
  return apiFetch<KsefAuthStatusResponse>(
    `/auth/status?environment=${environment}&referenceNumber=${encodeURIComponent(referenceNumber)}`,
    { headers: { Authorization: `Bearer ${authToken}` } },
  );
}

/**
 * POST /auth/redeem  (proxy → POST /auth/token/redeem w KSeF v2)
 * Krok 4 autoryzacji: wymień tymczasowy authToken na accessToken + refreshToken.
 */
export function redeemToken(
  environment: EnvironmentName,
  authToken: string,
): Promise<KsefTokensResponse> {
  return apiFetch<KsefTokensResponse>(
    `/auth/redeem?environment=${environment}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}` },
    },
  );
}
