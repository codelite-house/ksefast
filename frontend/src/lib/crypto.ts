/**
 * Reads ASN.1 DER length at offset. Returns [length, nextOffset].
 */
function readDerLength(buf: Uint8Array, offset: number): [number, number] {
  const first = buf[offset];
  if (first < 0x80) return [first, offset + 1];
  const numBytes = first & 0x7f;
  let len = 0;
  for (let i = 1; i <= numBytes; i++) len = len * 256 + buf[offset + i];
  return [len, offset + 1 + numBytes];
}

/**
 * Extracts SubjectPublicKeyInfo (SPKI) from a DER-encoded X.509 certificate.
 * Returns SPKI bytes — format required by Web Crypto API importKey('spki', ...).
 *
 * X.509 DER structure:
 *   SEQUENCE (Certificate)
 *     SEQUENCE (TBSCertificate)
 *       [0] version (optional)
 *       INTEGER  serialNumber
 *       SEQUENCE signature
 *       SEQUENCE issuer
 *       SEQUENCE validity
 *       SEQUENCE subject
 *       SEQUENCE subjectPublicKeyInfo  ← extract this
 *     SEQUENCE signatureAlgorithm
 *     BIT STRING signatureValue
 */
function extractSpkiFromCertDer(certDer: Uint8Array): Uint8Array {
  let pos = 0;

  // Certificate SEQUENCE
  pos++; // tag 0x30
  [, pos] = readDerLength(certDer, pos);

  // TBSCertificate SEQUENCE
  pos++; // tag 0x30
  const [tbsLen, tbsDataStart] = readDerLength(certDer, pos);
  pos = tbsDataStart;
  void tbsLen;

  // Skip optional version [0] EXPLICIT
  if (certDer[pos] === 0xa0) {
    pos++;
    const [vLen, vNext] = readDerLength(certDer, pos);
    pos = vNext + vLen;
  }

  // Skip: serialNumber, signature, issuer, validity, subject (5 fields)
  for (let i = 0; i < 5; i++) {
    pos++; // tag
    const [fLen, fNext] = readDerLength(certDer, pos);
    pos = fNext + fLen;
  }

  // subjectPublicKeyInfo SEQUENCE — extract the whole TLV
  const spkiStart = pos;
  pos++; // tag 0x30
  const [spkiContentLen, spkiContentStart] = readDerLength(certDer, pos);

  return certDer.slice(spkiStart, spkiContentStart + spkiContentLen);
}

/**
 * Szyfrowanie tokena KSeF w przeglądarce algorytmem RSA-OAEP SHA-256.
 * Payload: `{token}|{timestampMs}`
 *
 * Bez zewnętrznych bibliotek:
 *  - minimalny parser ASN.1 DER do ekstrakcji SPKI z certyfikatu X.509
 *  - Web Crypto API (natywne API przeglądarki) do szyfrowania RSA-OAEP
 *
 * Token NIGDY nie opuszcza przeglądarki w formie plaintext.
 */
export async function encryptTokenWithChallenge(
  token: string,
  timestampMs: number,
  certificateBase64: string,
): Promise<string> {
  // 1. Dekoduj certyfikat DER (base64 → bytes)
  const certBytes = Uint8Array.from(atob(certificateBase64), (c) =>
    c.charCodeAt(0),
  );

  // 2. Wyciągnij SubjectPublicKeyInfo z certyfikatu X.509
  const spkiBytes = extractSpkiFromCertDer(certBytes);

  // 3. Zaimportuj klucz publiczny RSA do Web Crypto API
  // spkiBytes.buffer może być SharedArrayBuffer — kopiujemy do czystego ArrayBuffer
  const spkiBuffer = spkiBytes.buffer.slice(
    spkiBytes.byteOffset,
    spkiBytes.byteOffset + spkiBytes.byteLength,
  ) as ArrayBuffer;
  const cryptoKey = await crypto.subtle.importKey(
    "spki",
    spkiBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );

  // 4. Zaszyfruj payload RSA-OAEP SHA-256
  const payload = `${token}|${timestampMs}`;
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    cryptoKey,
    new TextEncoder().encode(payload),
  );

  // 5. Zwróć zaszyfrowany payload jako Base64
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}
