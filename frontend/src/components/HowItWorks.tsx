import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { growX } from "../animations";
import { useReveal } from "../hooks/useReveal";
import { brand } from "../theme";
import GlowCard from "./ui/GlowCard";
import { ArchiveIcon, BoltIcon, CalendarIcon, FileTextIcon, KeyIcon } from "./ui/icons";
import Reveal from "./ui/Reveal";
import Section, { GradientText } from "./ui/Section";

const STEPS = [
  {
    icon: KeyIcon,
    title: "Wklej token KSeF",
    text: "Szyfrujemy go na Twoim komputerze, zanim cokolwiek wyślemy do sieci.",
  },
  {
    icon: CalendarIcon,
    title: "Wybierz miesiąc",
    text: "Podaj NIP i okres – np. październik – oraz format: XML albo PDF.",
  },
  {
    icon: ArchiveIcon,
    title: "Odbierz paczkę ZIP",
    text: "Wszystkie faktury w jednym pliku, gotowe do wysłania księgowej.",
  },
] as const;

const BENEFITS = [
  {
    icon: BoltIcon,
    title: "Szybkie szukanie",
    text: "Zapomnij o przeklikiwaniu rządowych portali. Znajdź fakturę w kilka sekund.",
  },
  {
    icon: ArchiveIcon,
    title: "Paczki ZIP",
    text: "Dostajesz od razu gotowy zbiór wszystkich dokumentów (XML lub PDF).",
  },
  {
    icon: FileTextIcon,
    title: "Konwersja XML do PDF",
    text: "Automatycznie zamieniamy nieczytelne pliki w przyjazne dokumenty PDF.",
  },
] as const;

const HowItWorks = () => {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <Section
      id="jak-to-dziala"
      eyebrow="Jak to działa"
      title={
        <>
          Trzy kroki. <GradientText>Zero klikania</GradientText> po jednej fakturze.
        </>
      }
    >
      <Box
        ref={ref}
        sx={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(3, minmax(0, 1fr))" },
          gap: 3,
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            display: { xs: "none", md: "block" },
            position: "absolute",
            top: 49,
            left: "16%",
            right: "16%",
            height: 2,
            transformOrigin: "left",
            background: `linear-gradient(90deg, ${brand.sky}, ${brand.green}, ${brand.amber})`,
            opacity: 0.55,
            animation: visible ? `${growX} 1.4s cubic-bezier(.3,.7,.2,1) .2s both` : "none",
            transform: visible ? undefined : "scaleX(0)",
          }}
        />
        {STEPS.map(({ icon: Icon, title, text }, index) => (
          <Reveal key={title} delay={index * 140}>
            <GlowCard sx={{ p: 3.5, height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "16px",
                    display: "grid",
                    placeItems: "center",
                    color: "#04210f",
                    background: brand.gradientCta,
                    boxShadow: "0 12px 30px -12px rgba(56,189,248,.8)",
                  }}
                >
                  <Icon sx={{ fontSize: 28 }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: "3rem",
                    fontWeight: 800,
                    lineHeight: 1,
                    color: "rgba(148,163,184,.22)",
                    letterSpacing: "-0.05em",
                  }}
                >
                  0{index + 1}
                </Typography>
              </Box>
              <Typography component="h3" sx={{ mt: 2.5, fontWeight: 700, fontSize: "1.25rem" }}>
                {title}
              </Typography>
              <Typography sx={{ mt: 1, color: "text.secondary", lineHeight: 1.6 }}>{text}</Typography>
            </GlowCard>
          </Reveal>
        ))}
      </Box>

      <Box sx={{ mt: 4, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(3, minmax(0, 1fr))" }, gap: 3 }}>
        {BENEFITS.map(({ icon: Icon, title, text }, index) => (
          <Reveal key={title} delay={index * 120}>
            <Box sx={{ display: "flex", gap: 1.75, alignItems: "flex-start", px: 1 }}>
              <Icon sx={{ fontSize: 24, color: brand.amber, mt: 0.25 }} />
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25, lineHeight: 1.55 }}>
                  {text}
                </Typography>
              </Box>
            </Box>
          </Reveal>
        ))}
      </Box>
    </Section>
  );
};

export default HowItWorks;
