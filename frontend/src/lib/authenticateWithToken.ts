import { encryptTokenWithChallenge } from "./crypto";
import type {
  ContextIdentifierType,
  InitTokenAuthRequest,
  KsefAuthStatusResponse,
  KsefChallengeResponse,
  KsefInitAuthResponse,
  KsefTokensResponse,
  PublicCertificateInfo,
} from "../types";

const AUTH_POLL_MAX_ATTEMPTS = 20;
const AUTH_POLL_INTERVAL_MS = 1000;

/**
 * Operacje KSeF potrzebne do logowania tokenem. Frontend dostarcza implementację
 * przez proxy (przeglądarka nie może wołać KSeF bezpośrednio – CORS), CLI woła KSeF wprost.
 */
export interface TokenAuthApi {
  getPublicCertificates: () => Promise<PublicCertificateInfo[]>;
  getChallenge: () => Promise<KsefChallengeResponse>;
  initTokenAuth: (body: InitTokenAuthRequest) => Promise<KsefInitAuthResponse>;
  getAuthStatus: (
    referenceNumber: string,
    authToken: string,
  ) => Promise<KsefAuthStatusResponse>;
  redeemToken: (authToken: string) => Promise<KsefTokensResponse>;
}

export interface TokenAuthParams {
  token: string;
  contextType: ContextIdentifierType;
  contextValue: string;
}

export interface TokenAuthOptions {
  pollMaxAttempts?: number;
  pollIntervalMs?: number;
}

const pollUntilAuthorized = async (
  api: TokenAuthApi,
  referenceNumber: string,
  authToken: string,
  maxAttempts: number,
  intervalMs: number,
): Promise<void> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await api.getAuthStatus(referenceNumber, authToken);

    if (result.status.code === 200) return;

    if (result.status.code !== 100) {
      const details = result.status.details?.length
        ? ` (${result.status.details.join(", ")})`
        : "";
      const detailsText = result.status.details?.join(" ").toLowerCase() ?? "";
      const tokenHint =
        detailsText.includes("token") &&
        detailsText.includes("nie został znaleziony")
          ? " Sprawdź, czy używasz tokena z właściwego środowiska (demo/prod) i czy token jest nadal aktywny."
          : "";
      throw new Error(
        `KSeF authentication failed: ${result.status.description}${details}${tokenHint}`,
      );
    }

    await new Promise<void>((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`KSeF authentication timed out after ${maxAttempts} attempts.`);
};

/**
 * Logowanie do KSeF tokenem:
 * certyfikaty → challenge → RSA-OAEP → init → polling → redeem.
 * Zwraca accessToken i refreshToken.
 */
export const authenticateWithToken = async (
  api: TokenAuthApi,
  params: TokenAuthParams,
  options: TokenAuthOptions = {},
): Promise<KsefTokensResponse> => {
  const certificates = await api.getPublicCertificates();
  const encryptionCert = certificates.find((c) =>
    (c.usage ?? []).some((u) => u.toLowerCase() === "kseftokenencryption"),
  );
  if (!encryptionCert) {
    throw new Error("KSeF token encryption certificate not found.");
  }

  const challenge = await api.getChallenge();

  const encryptedToken = await encryptTokenWithChallenge(
    params.token,
    challenge.timestampMs,
    encryptionCert.certificate,
  );

  const initResponse = await api.initTokenAuth({
    challenge: challenge.challenge,
    contextIdentifier: {
      type: params.contextType,
      value: params.contextValue,
    },
    encryptedToken,
    authorizationPolicy: null,
  });

  await pollUntilAuthorized(
    api,
    initResponse.referenceNumber,
    initResponse.authenticationToken.token,
    options.pollMaxAttempts ?? AUTH_POLL_MAX_ATTEMPTS,
    options.pollIntervalMs ?? AUTH_POLL_INTERVAL_MS,
  );

  return api.redeemToken(initResponse.authenticationToken.token);
};
