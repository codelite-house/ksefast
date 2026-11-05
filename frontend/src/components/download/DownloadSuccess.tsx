import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { confetti, popIn, pulseRing } from "../../animations";
import { formatCountdown, useCountdown } from "../../hooks/useCountdown";
import type { DownloadResult } from "../../hooks/useDownloadInvoices";
import { brand } from "../../theme";
import { AlertIcon, CheckIcon, CoffeeIcon, DownloadIcon, RefreshIcon } from "../ui/icons";

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
  result: DownloadResult;
  onReset: () => void;
  onDownloadMissing: () => void;
}

const pluralizeInvoices = (count: number) => {
  if (count === 1) return "fakturę";
  const lastTwo = count % 100;
  const last = count % 10;
  return last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14) ? "faktury" : "faktur";
};

const partialReason = (result: DownloadResult): string => {
  switch (result.stopReason?.kind) {
    case "rateLimited":
      return "KSeF pozwala pobrać najwyżej 64 faktury na godzinę i wstrzymał dalsze pobieranie.";
    case "cancelled":
      return "Pobieranie zostało zatrzymane.";
    case "error":
      return "Połączenie z KSeF przerwało się w trakcie pobierania.";
    default:
      return "Części faktur KSeF nie udostępnił (np. są jeszcze przetwarzane).";
  }
};

const PartialSummary = ({ result, onDownloadMissing }: Omit<DownloadSuccessProps, "onReset">) => {
  const waitSeconds = useCountdown(result.resumeAt);
  const missingCount = result.missing.length;

  return (
    <>
      <Box
        sx={{
          mx: "auto",
          width: 84,
          height: 84,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          color: brand.amber,
          border: "2px solid",
          borderColor: brand.amber,
          animation: `${popIn} .55s ease`,
        }}
      >
        <AlertIcon sx={{ fontSize: 40 }} />
      </Box>

      <Typography component="h3" sx={{ mt: 2.5, fontWeight: 800, fontSize: "1.45rem", letterSpacing: "-0.02em" }}>
        Pobrano {result.invoiceCount} z {result.totalCount} {pluralizeInvoices(result.totalCount)}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
        {partialReason(result)} Paczka <b>{result.fileName}</b> zawiera wszystko, co już pobrano, a lista {missingCount}{" "}
        brakujących jest w pliku <b>BRAKUJACE.txt</b>.
      </Typography>

      <Box sx={{ mt: 3, display: "flex", gap: 1.25, justifyContent: "center", flexWrap: "wrap" }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={onDownloadMissing}
          disabled={waitSeconds > 0}
          startIcon={<DownloadIcon />}
          sx={{ color: "#04210f", background: brand.gradientCta, px: 2.5, fontVariantNumeric: "tabular-nums" }}
        >
          {waitSeconds > 0
            ? `Dociągnij brakujące za ${formatCountdown(waitSeconds)}`
            : `Dociągnij brakujące (${missingCount})`}
        </Button>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
        Nie zamykaj karty, jeśli chcesz dociągnąć resztę – lista brakujących jest tylko w tej karcie.
      </Typography>
    </>
  );
};

const DownloadSuccess = ({ result, onReset, onDownloadMissing }: DownloadSuccessProps) => {
  const partial = result.missing.length > 0;

  return (
    <Box role="status" sx={{ position: "relative", textAlign: "center", py: 2 }}>
      {partial ? (
        <PartialSummary result={result} onDownloadMissing={onDownloadMissing} />
      ) : (
        <>
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
            Gotowe! Pobrano {result.invoiceCount} {pluralizeInvoices(result.invoiceCount)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Paczka <b>{result.fileName}</b> jest już w folderze pobranych plików. Powstała w Twojej przeglądarce, a serwer niczego nie zapisał.
          </Typography>
        </>
      )}

      <Box sx={{ mt: partial ? 1.5 : 3, display: "flex", gap: 1.25, justifyContent: "center", flexWrap: "wrap" }}>
        <Button
          variant={partial ? "outlined" : "contained"}
          color="secondary"
          onClick={onReset}
          startIcon={<RefreshIcon />}
          sx={partial ? { px: 2.5 } : { color: "#04210f", background: brand.gradientCta, px: 2.5 }}
        >
          Pobierz kolejny miesiąc
        </Button>
        {!partial && (
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
        )}
      </Box>
      {!partial && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
          Zaoszczędziłeś właśnie sporo czasu – kawa jest dobrowolna, narzędzie zostaje darmowe.
        </Typography>
      )}
    </Box>
  );
};

export default DownloadSuccess;
