// Bardziej uniwersalny parser: szuka <KodKreskowy>, <kodKreskowy>, <Barcode>, <barcode>, <VerificationCode>, <verificationCode>
export function extractAnyVerificationCode(xml: string): string | null {
  // Szukaj tylko wartości z tagów KodKreskowy, kodKreskowy, VerificationCode, verificationCode
  const tags = ["KodKreskowy", "kodKreskowy", "VerificationCode", "verificationCode"];
  for (const tag of tags) {
    const regex = new RegExp(`<${tag}>([^<]{20,})</${tag}>`, "g");
    const match = regex.exec(xml);
    if (match && /^[A-Za-z0-9_\-=]+$/.test(match[1])) {
      return match[1];
    }
  }
  return null;
}
