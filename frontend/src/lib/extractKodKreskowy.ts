// Minimalny parser XML do wyciągania <KodKreskowy> lub <kodKreskowy> z XML faktury
export function extractKodKreskowy(xml: string): string | null {
  // Szukaj wielkości liter: KodKreskowy lub kodKreskowy
  const match = xml.match(/<(KodKreskowy|kodKreskowy)>([^<]+)<\/(KodKreskowy|kodKreskowy)>/);
  return match ? match[2] : null;
}
