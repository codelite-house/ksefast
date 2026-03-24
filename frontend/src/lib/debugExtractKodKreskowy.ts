// Debug helper: extract all possible <KodKreskowy> and <kodKreskowy> and log them
export function debugExtractKodKreskowy(xml: string): string[] {
  const matches = Array.from(xml.matchAll(/<(KodKreskowy|kodKreskowy)>([^<]+)<\/(KodKreskowy|kodKreskowy)>/g));
  return matches.map(m => m[2]);
}
