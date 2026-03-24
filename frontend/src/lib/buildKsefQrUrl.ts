// Wyliczanie poprawnego QR URL do weryfikacji faktury KSeF (browser, async)

/**
 * Buduje oficjalny link QR KSeF 2.0 do weryfikacji faktury.
 * @param xml Oryginalny XML faktury (string lub Uint8Array)
 * @param nip NIP podatnika (10 cyfr, bez spacji)
 * @param issueDate Data wystawienia faktury (string YYYY-MM-DD lub Date)
 * @returns Link QR w oficjalnym formacie
 */
export async function buildKsefQrUrl(
  xml: string | Uint8Array,
  nip: string,
  issueDate: string | Date
): Promise<string> {
  // NIP: tylko cyfry, 10 znaków
  const cleanNip = nip.replace(/\D/g, '').padStart(10, '0');
  // Data: DD-MM-YYYY
  let dateObj: Date;
  if (typeof issueDate === 'string') {
    // Akceptuj format YYYY-MM-DD lub YYYYMMDD
    if (/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) {
      dateObj = new Date(issueDate);
    } else if (/^\d{8}$/.test(issueDate)) {
      dateObj = new Date(issueDate.slice(0,4) + '-' + issueDate.slice(4,6) + '-' + issueDate.slice(6,8));
    } else {
      throw new Error('Nieprawidłowy format daty');
    }
  } else {
    dateObj = issueDate;
  }
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  // Hash SHA-256 z XML, base64url
  let data: Uint8Array;
  if (typeof xml === "string") {
    data = new TextEncoder().encode(xml);
  } else {
    data = xml;
  }
  let bufferToHash: ArrayBuffer;
  if (data.buffer instanceof ArrayBuffer && !(typeof SharedArrayBuffer !== 'undefined' && data.buffer instanceof SharedArrayBuffer)) {
    bufferToHash = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  } else {
    bufferToHash = new Uint8Array(data).buffer;
  }
  const hashBuffer = await crypto.subtle.digest("SHA-256", bufferToHash);
  const hashArray = new Uint8Array(hashBuffer);
  // base64url: + → -, / → _, bez =
  const b64 = btoa(String.fromCharCode(...hashArray));
  const b64url = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  return `https://qr.ksef.mf.gov.pl/invoice/${cleanNip}/${formattedDate}/${b64url}`;
}
