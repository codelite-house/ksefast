import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { brand } from "../theme";
import InvoiceFlow from "./InvoiceFlow";
import { ArchiveIcon, CodeIcon, ShieldCheckIcon } from "./ui/icons";

const TRUST_POINTS = [
  { icon: ShieldCheckIcon, text: "Token szyfrowany w Twojej przeglądarce" },
  { icon: ArchiveIcon, text: "ZIP i PDF powstają lokalnie, serwer niczego nie zapisuje" },
  { icon: CodeIcon, text: "Otwarty kod – sprawdzisz go na GitHubie" },
] as const;

const HeroCopy = () => (
  <Box sx={{ pt: { xs: 4, md: 7 }, pb: { xs: 0, lg: 2 } }}>
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 1.75,
        py: 0.6,
        borderRadius: 999,
        border: "1px solid",
        borderColor: "rgba(56,189,248,.35)",
        bgcolor: "rgba(56,189,248,.08)",
        fontSize: "0.82rem",
        fontWeight: 700,
        letterSpacing: ".02em",
        color: "#bae6fd",
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: brand.green,
          boxShadow: "0 0 0 0 rgba(34,197,94,.7)",
          animation: "ksefastDot 1.8s ease-out infinite",
          "@keyframes ksefastDot": {
            "0%": { boxShadow: "0 0 0 0 rgba(34,197,94,.7)" },
            "100%": { boxShadow: "0 0 0 10px rgba(34,197,94,0)" },
          },
        }}
      />
      Darmowe · open source · bez konta
    </Box>

    <Typography
      component="h1"
      sx={{
        mt: 2.5,
        fontWeight: 800,
        letterSpacing: "-0.035em",
        lineHeight: 1.06,
        textWrap: "balance",
        fontSize: { xs: "2.2rem", sm: "3rem", lg: "3.15rem" },
      }}
    >
      Pobieranie faktur z KSeF
      <Box
        component="span"
        sx={{
          display: "block",
          background: brand.gradientText,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          pb: 0.5,
        }}
      >
        w 30 sekund
      </Box>
    </Typography>

    <Typography
      sx={{
        mt: 2.5,
        maxWidth: 560,
        fontSize: { xs: "1.02rem", sm: "1.14rem" },
        lineHeight: 1.6,
        color: "text.secondary",
      }}
    >
      Wklej token, wybierz miesiąc i odbierz gotową paczkę <b>ZIP</b> w{" "}
      <b>XML</b> albo <b>PDF</b> – dla siebie lub księgowej. Bez rejestracji,
      bez instalowania, bez klikania po jednej fakturze.
    </Typography>

    <Box
      component="ul"
      sx={{ mt: 3, p: 0, listStyle: "none", display: "grid", gap: 1.25 }}
    >
      {TRUST_POINTS.map(({ icon: Icon, text }) => (
        <Box
          component="li"
          key={text}
          sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "text.primary" }}
        >
          <Box
            sx={{
              flexShrink: 0,
              width: 32,
              height: 32,
              borderRadius: "10px",
              display: "grid",
              placeItems: "center",
              color: brand.green,
              bgcolor: "rgba(34,197,94,.12)",
              border: "1px solid rgba(34,197,94,.25)",
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="body2" sx={{ fontSize: "0.95rem" }}>
            {text}
          </Typography>
        </Box>
      ))}
    </Box>

    <Box sx={{ mt: { xs: 3, lg: 5 }, display: { xs: "none", sm: "block" } }}>
      <InvoiceFlow />
    </Box>
  </Box>
);

export default HeroCopy;
