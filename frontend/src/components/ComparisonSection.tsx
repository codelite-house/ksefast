import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { growX, popIn } from "../animations";
import { useReveal } from "../hooks/useReveal";
import { brand } from "../theme";
import GlowCard from "./ui/GlowCard";
import { CheckIcon, ClockIcon } from "./ui/icons";
import Reveal from "./ui/Reveal";
import Section, { GradientText } from "./ui/Section";

const ROWS = [
  { feature: "Pobieranie wielu faktur", portal: "Ręcznie (po jednej)", ksefast: "Automatycznie (ZIP)" },
  { feature: "Podgląd faktury (PDF)", portal: "Często wymaga klikania", ksefast: "Generowany od razu" },
  { feature: "Cena", portal: "Darmowy", ksefast: "Darmowy (kawa opcjonalnie)" },
  { feature: "Otwartość na pomysły", portal: "Nie", ksefast: "Tak, czytamy każdy mail" },
] as const;

interface RaceBarProps {
  label: string;
  value: string;
  /** Szerokość paska względem najwolniejszego wariantu (0–1). */
  width: number;
  seconds: number;
  active: boolean;
  winner?: boolean;
}

const RaceBar = ({ label, value, width, seconds, active, winner = false }: RaceBarProps) => (
  <Box>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.75, gap: 2 }}>
      <Typography sx={{ fontWeight: 700 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 800, color: winner ? brand.green : brand.amber, display: "flex", alignItems: "center", gap: 0.75 }}>
        <ClockIcon sx={{ fontSize: 18 }} />
        {value}
      </Typography>
    </Box>
    <Box sx={{ height: 16, borderRadius: 999, bgcolor: "rgba(148,163,184,.12)", overflow: "hidden", position: "relative" }}>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          width: `${Math.max(width, 0.04) * 100}%`,
          borderRadius: 999,
          transformOrigin: "left",
          transform: active ? undefined : "scaleX(0)",
          animation: active ? `${growX} ${seconds}s cubic-bezier(.4,.1,.3,1) both` : "none",
          background: winner
            ? brand.gradientCta
            : "repeating-linear-gradient(135deg, #f59e0b 0 12px, #d97706 12px 24px)",
        }}
      />
    </Box>
  </Box>
);

const ComparisonSection = () => {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <Section
      id="porownanie"
      eyebrow="Porównanie"
      title={
        <>
          Ile czasu <GradientText>oddajemy Ci</GradientText> co miesiąc
        </>
      }
      subtitle="Rzuć okiem i porównaj, ile czasu oszczędzasz z KSeFast względem ręcznego pobierania z portalu."
    >
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1.1fr)" }, gap: 3, alignItems: "stretch" }}>
        <Reveal>
          <GlowCard sx={{ p: { xs: 2.5, sm: 3.5 }, height: "100%", display: "flex", alignItems: "center" }}>
            <Box ref={ref} sx={{ display: "grid", gap: 3, width: "100%" }}>
              <RaceBar
                label="Portal MF – ręcznie"
                value="kilka–kilkanaście minut"
                width={1}
                seconds={4.5}
                active={visible}
              />
              <RaceBar label="KSeFast" value="ok. 30 sekund" width={0.06} seconds={0.6} active={visible} winner />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: "16px",
                  bgcolor: "rgba(34,197,94,.08)",
                  border: "1px solid rgba(34,197,94,.28)",
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    color: "#04210f",
                    background: brand.gradientCta,
                    animation: visible ? `${popIn} .5s ease 1s both` : "none",
                    opacity: visible ? undefined : 0,
                  }}
                >
                  <CheckIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontWeight: 600 }}>
                  Oszczędź średnio 15 minut przy każdym rozliczeniu miesięcznym.
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Czasy orientacyjne – zależą od liczby faktur i obciążenia KSeF.
              </Typography>
            </Box>
          </GlowCard>
        </Reveal>

        <Reveal delay={140}>
          <GlowCard sx={{ p: { xs: 1.5, sm: 2.5 }, height: "100%", overflowX: "auto" }}>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", minWidth: 380 }}>
              <Box component="thead">
                <Box component="tr">
                  {["Funkcja", "Portal MF", "KSeFast"].map((heading, index) => (
                    <Box
                      component="th"
                      key={heading}
                      scope="col"
                      sx={{
                        textAlign: "left",
                        px: 1.5,
                        py: 1.25,
                        fontSize: "0.78rem",
                        letterSpacing: ".08em",
                        textTransform: "uppercase",
                        color: index === 2 ? brand.green : "text.secondary",
                        borderBottom: "1px solid",
                        borderColor: brand.line,
                      }}
                    >
                      {heading}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {ROWS.map((row) => (
                  <Box
                    component="tr"
                    key={row.feature}
                    sx={{ transition: "background-color .2s", "&:hover": { bgcolor: "rgba(56,189,248,.05)" } }}
                  >
                    <Box component="th" scope="row" sx={{ textAlign: "left", px: 1.5, py: 1.6, fontWeight: 600, borderBottom: "1px solid", borderColor: brand.line }}>
                      {row.feature}
                    </Box>
                    <Box component="td" sx={{ px: 1.5, py: 1.6, color: "text.secondary", borderBottom: "1px solid", borderColor: brand.line }}>
                      {row.portal}
                    </Box>
                    <Box component="td" sx={{ px: 1.5, py: 1.6, fontWeight: 700, borderBottom: "1px solid", borderColor: brand.line }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <CheckIcon sx={{ fontSize: 18, color: brand.green, flexShrink: 0 }} />
                        {row.ksefast}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </GlowCard>
        </Reveal>
      </Box>
    </Section>
  );
};

export default ComparisonSection;
