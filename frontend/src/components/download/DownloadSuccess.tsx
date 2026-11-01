import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { confetti, popIn, pulseRing } from "../../animations";
import { brand } from "../../theme";
import { CheckIcon, CoffeeIcon, RefreshIcon } from "../ui/icons";

const CONFETTI_COLORS = [brand.sky, brand.green, brand.amber, "#fde68a", "#a78bfa"];

// Stałe „losowe" wartości – konfetti ma wyglądać tak samo przy każdym renderze.
const CONFETTI = Array.from({ length: 26 }, (_, index) => {
  const angle = (index / 26) * Math.PI * 2 + (index % 3) * 0.25;
  const distance = 90 + ((index * 37) % 70);
  return {
    dx: Math.round(Math.cos(angle) * distance),
    dy: Math.round(Math.sin(angle) * distance - 20),
    rot: `${(index * 83) % 540}deg`,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    size: 6 + (index % 3) * 3,
    delay: (index % 5) * 30,
  };
});

interface DownloadSuccessProps {
  invoiceCount: number;
  fileName: string;
  onReset: () => void;
}

const pluralizeInvoices = (count: number) => {
  if (count === 1) return "fakturę";
  const lastTwo = count % 100;
  const last = count % 10;
  return last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14) ? "faktury" : "faktur";
};

const DownloadSuccess = ({ invoiceCount, fileName, onReset }: DownloadSuccessProps) => (
  <Box role="status" sx={{ position: "relative", textAlign: "center", py: 2 }}>
    <Box aria-hidden="true" sx={{ position: "absolute", left: "50%", top: 62, width: 0, height: 0 }}>
      {CONFETTI.map((piece, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            width: piece.size,
            height: piece.size * 0.55,
            borderRadius: 0.5,
            bgcolor: piece.color,
            "--dx": `${piece.dx}px`,
            "--dy": `${piece.dy}px`,
            "--rot": piece.rot,
            animation: `${confetti} 1.5s cubic-bezier(.2,.8,.3,1) ${piece.delay}ms both`,
          }}
        />
      ))}
    </Box>

    <Box
      sx={{
        mx: "auto",
        width: 84,
        height: 84,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        color: "#04210f",
        background: brand.gradientCta,
        animation: `${popIn} .55s ease, ${pulseRing} 1.6s ease-out .4s 2`,
      }}
    >
      <CheckIcon sx={{ fontSize: 44, strokeWidth: 3 }} />
    </Box>

    <Typography component="h3" sx={{ mt: 2.5, fontWeight: 800, fontSize: "1.55rem", letterSpacing: "-0.02em" }}>
      Gotowe! Pobrano {invoiceCount} {pluralizeInvoices(invoiceCount)}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
      Paczka <b>{fileName}</b> jest już w folderze pobranych plików. Powstała w Twojej przeglądarce, a serwer niczego nie zapisał.
    </Typography>

    <Box sx={{ mt: 3, display: "flex", gap: 1.25, justifyContent: "center", flexWrap: "wrap" }}>
      <Button
        variant="contained"
        color="secondary"
        onClick={onReset}
        startIcon={<RefreshIcon />}
        sx={{ color: "#04210f", background: brand.gradientCta, px: 2.5 }}
      >
        Pobierz kolejny miesiąc
      </Button>
      <Button
        variant="outlined"
        color="warning"
        href="https://buycoffee.to/codelitehouse"
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<CoffeeIcon />}
      >
        Postaw kawę
      </Button>
    </Box>
    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
      Zaoszczędziłeś właśnie sporo czasu – kawa jest dobrowolna, narzędzie zostaje darmowe.
    </Typography>
  </Box>
);

export default DownloadSuccess;
