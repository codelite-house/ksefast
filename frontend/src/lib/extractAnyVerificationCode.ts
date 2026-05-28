// Bardziej uniwersalny parser: szuka <KodKreskowy>, <kodKreskowy>, <Barcode>, <barcode>, <VerificationCode>, <verificationCode>

// Patterns are static (one per tag name), hoisted to module level to avoid re-creation on each call.
const VERIFICATION_CODE_PATTERNS: ReadonlyArray<RegExp> = [
  /<KodKreskowy>([^<]{20,})<\/KodKreskowy>/,
  /<kodKreskowy>([^<]{20,})<\/kodKreskowy>/,
  /<VerificationCode>([^<]{20,})<\/VerificationCode>/,
  /<verificationCode>([^<]{20,})<\/verificationCode>/,
];

const ALPHANUMERIC_PATTERN = /^[A-Za-z0-9_\-=]+$/;

export const extractAnyVerificationCode = (xml: string): string | null => {
  // Szukaj tylko wartości z tagów KodKreskowy, kodKreskowy, VerificationCode, verificationCode
  for (const re of VERIFICATION_CODE_PATTERNS) {
    const match = re.exec(xml);
    if (match && ALPHANUMERIC_PATTERN.test(match[1])) {
      return match[1];
    }
  }
  return null;
};
