import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import { brand } from "../theme";
import TokenScramble from "./TokenScramble";
import GlowCard from "./ui/GlowCard";
import { ArchiveIcon, BrowserIcon, CodeIcon, LockIcon, ServerIcon } from "./ui/icons";
import Reveal from "./ui/Reveal";
import Section, { GradientText } from "./ui/Section";

const POINTS = [
  {
    icon: LockIcon,
    title: "Token szyfrowany lokalnie",
    text: "RSA-OAEP w Twojej przeglądarce, kluczem publicznym KSeF. Serwer pośredniczący widzi tylko zaszyfrowany blob.",
  },
  {
    icon: ServerIcon,
    title: "Serwer bez pamięci",
    text: "Nie loguje, nie zapisuje, nie ma bazy danych. Istnieje wyłącznie dlatego, że API KSeF blokuje CORS.",
  },
  {
    icon: ArchiveIcon,
    title: "ZIP i PDF powstają u Ciebie",
    text: "Paczka jest składana w pamięci przeglądarki, a PDF generuje oficjalna biblioteka Ministerstwa Finansów.",
  },
  {
    icon: CodeIcon,
    title: "Kod do sprawdzenia",
    text: "Całość jest open source – nie musisz nam wierzyć na słowo.",
  },
] as const;

const Node = ({
  icon: Icon,
  title,
  note,
  accent,
}: {
  icon: typeof LockIcon;
  title: string;
  note: string;
  accent: string;
}) => (
  <Box sx={{ textAlign: "center", flex: 1, minWidth: 0 }}>
    <Box
      sx={{
        mx: "auto",
        width: 52,
        height: 52,
        borderRadius: "16px",
        display: "grid",
        placeItems: "center",
        color: accent,
        bgcolor: "rgba(255,255,255,.04)",
        border: "1px solid",
        borderColor: accent,
      }}
    >
      <Icon sx={{ fontSize: 26 }} />
    </Box>
    <Typography sx={{ mt: 1, fontWeight: 700, fontSize: "0.86rem" }}>{title}</Typography>
    <Typography sx={{ color: "text.secondary", fontSize: "0.74rem", lineHeight: 1.35 }}>{note}</Typography>
  </Box>
);

const Wire = ({ from, to }: { from: string; to: string }) => (
  <Box
    aria-hidden="true"
    sx={{
      flex: "0 0 36px",
      height: 2,
      mt: "26px",
      alignSelf: "flex-start",
      backgroundImage: `linear-gradient(90deg, ${from}, ${to})`,
      backgroundSize: "200% 100%",
      opacity: 0.8,
    }}
  />
);

const PrivacySection = () => (
  <Section
    id="prywatnosc"
    eyebrow="Prywatność"
    title={
      <>
        Serwer widzi tylko <GradientText fast>zaszyfrowany blob</GradientText>
      </>
    }
    subtitle="To proste: nie mamy dostępu do Twojego tokena w jawnej postaci i niczego nie przechowujemy. Wszystko kończy się na Twoim urządzeniu."
  >
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1.05fr) minmax(0, 1fr)" }, gap: { xs: 3, lg: 5 }, alignItems: "stretch" }}>
      <Box sx={{ display: "grid", gap: 2.5, alignContent: "start" }}>
        {POINTS.map(({ icon: Icon, title, text }, index) => (
          <Reveal key={title} delay={index * 110}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box
                sx={{
                  flexShrink: 0,
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  display: "grid",
                  placeItems: "center",
                  color: brand.green,
                  bgcolor: "rgba(34,197,94,.1)",
                  border: "1px solid rgba(34,197,94,.28)",
                }}
              >
                <Icon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>{title}</Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.6, mt: 0.25 }}>{text}</Typography>
              </Box>
            </Box>
          </Reveal>
        ))}
        <Reveal delay={450}>
          <Typography variant="body2" color="text.secondary">
            Kod aplikacji jest publiczny:{" "}
            <Link href="https://github.com/codelitehouse/ksefast" target="_blank" rel="noreferrer" sx={{ fontWeight: 700 }}>
              github.com/codelitehouse/ksefast
            </Link>
          </Typography>
        </Reveal>
      </Box>

      <Reveal delay={150}>
        <GlowCard sx={{ p: { xs: 2.5, sm: 3.5 }, height: "100%" }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", mb: 2.5 }}>Droga Twojego tokena</Typography>

          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, mb: 3 }}>
            <Node icon={BrowserIcon} title="Twoja przeglądarka" note="jawny token, ZIP, PDF" accent={brand.green} />
            <Wire from={brand.green} to={brand.amber} />
            <Node icon={ServerIcon} title="Serwer pośredniczący" note="tylko szyfrogram, bez zapisu" accent={brand.amber} />
            <Wire from={brand.amber} to={brand.sky} />
            <Node icon={LockIcon} title="KSeF (MF)" note="odszyfrowuje swoim kluczem" accent={brand.sky} />
          </Box>

          <TokenScramble />

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
            Wartości poglądowe. Prawdziwy szyfrogram jest za każdym razem inny.
          </Typography>
        </GlowCard>
      </Reveal>
    </Box>
  </Section>
);

export default PrivacySection;
