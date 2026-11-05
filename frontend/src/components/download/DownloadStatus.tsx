import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { blink, pulseRing } from "../../animations";
import { formatCountdown, useCountdown } from "../../hooks/useCountdown";
import { brand } from "../../theme";
import type { DownloadPhase, DownloadProgress } from "../../types";
import BrandMark from "../ui/BrandMark";
import { CheckIcon } from "../ui/icons";

const PHASES: { phase: DownloadPhase; label: string }[] = [
  { phase: "auth", label: "Logowanie do KSeF" },
  { phase: "metadata", label: "Wyszukiwanie faktur" },
  { phase: "download", label: "Pobieranie faktur" },
  { phase: "archive", label: "Pakowanie paczki" },
];

const RING_RADIUS = 52;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const ProgressRing = ({ percent, indeterminate }: { percent: number; indeterminate: boolean }) => (
  <Box sx={{ position: "relative", width: 132, height: 132, mx: "auto" }}>
    <svg
      width="132"
      height="132"
      viewBox="0 0 132 132"
      style={{ transform: "rotate(-90deg)" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ksefast-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={brand.sky} />
          <stop offset="1" stopColor={brand.green} />
        </linearGradient>
      </defs>
      <circle cx="66" cy="66" r={RING_RADIUS} fill="none" stroke="rgba(148,163,184,.16)" strokeWidth="9" />
      <circle
        cx="66"
        cy="66"
        r={RING_RADIUS}
        fill="none"
        stroke="url(#ksefast-ring)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={RING_LENGTH}
        strokeDashoffset={RING_LENGTH * (1 - (indeterminate ? 0.28 : percent / 100))}
        style={{
          transition: "stroke-dashoffset .5s ease",
          transformOrigin: "center",
          animation: indeterminate ? "ksefastRingSpin 1.4s linear infinite" : "none",
        }}
      />
    </svg>
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        fontWeight: 800,
        fontSize: "1.7rem",
        fontVariantNumeric: "tabular-nums",
        "@keyframes ksefastRingSpin": { to: { transform: "rotate(360deg)" } },
      }}
    >
      {indeterminate ? (
        <Box component="span" sx={{ animation: `${blink} 1.2s steps(1) infinite`, color: brand.sky }}>
          …
        </Box>
      ) : (
        `${percent}%`
      )}
    </Box>
  </Box>
);

interface DownloadStatusProps {
  progress: DownloadProgress | null;
  onCancel: () => void;
}

/** Widok w trakcie pobierania: pierścień postępu + etapy z licznikami na żywo. */
const DownloadStatus = ({ progress, onCancel }: DownloadStatusProps) => {
  const waitSeconds = useCountdown(progress?.resumeAt);
  const downloading = progress?.phase === "download" && (progress.current ?? 0) > 0;
  const currentIndex = Math.max(
    0,
    PHASES.findIndex((item) => item.phase === (progress?.phase ?? "auth")),
  );
  const total = progress?.total ?? 0;
  const current = progress?.current ?? 0;
  const hasTotal = total > 0 && (progress?.phase === "download" || progress?.phase === "archive");
  const percent = hasTotal ? Math.round((current / total) * 100) : 0;

  return (
    <Box role="status" aria-live="polite" sx={{ py: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
        <BrandMark size={84} variant="loader" />
      </Box>
      <ProgressRing percent={percent} indeterminate={!hasTotal} />

      <Typography sx={{ mt: 2, textAlign: "center", fontWeight: 700, fontSize: "1.05rem" }}>
        {progress?.message ?? "Łączenie z KSeF…"}
      </Typography>
      {progress?.resumeAt ? (
        <Typography
          variant="body2"
          sx={{ textAlign: "center", mt: 0.5, color: brand.amber, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
        >
          {waitSeconds > 0
            ? `Limit KSeF – wznowienie za ${formatCountdown(waitSeconds)}`
            : "Limit KSeF – wznawianie…"}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 0.5 }}>
          Nie zamykaj karty. KSeF pozwala pobrać 16 faktur na minutę, więc większy miesiąc zajmie kilka minut.
        </Typography>
      )}

      <Box component="ol" sx={{ listStyle: "none", p: 0, m: 0, mt: 3, display: "grid", gap: 1.25 }}>
        {PHASES.map((item, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <Box
              component="li"
              key={item.phase}
              aria-current={active ? "step" : undefined}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                opacity: done || active ? 1 : 0.4,
                transition: "opacity .3s",
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  border: "1px solid",
                  borderColor: done ? brand.green : active ? brand.sky : brand.line,
                  bgcolor: done ? brand.green : "transparent",
                  color: "#04210f",
                  animation: active ? `${pulseRing} 1.5s ease-out infinite` : "none",
                }}
              >
                {done ? (
                  <CheckIcon sx={{ fontSize: 14 }} />
                ) : active ? (
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: brand.sky }} />
                ) : null}
              </Box>
              <Typography sx={{ fontWeight: active ? 700 : 500, fontSize: "0.95rem" }}>
                {item.label}
              </Typography>
              {active && hasTotal && (
                <Typography
                  variant="body2"
                  sx={{ ml: "auto", color: brand.sky, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
                >
                  {current} / {total}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Button variant="text" color="inherit" size="small" onClick={onCancel} sx={{ opacity: 0.8 }}>
          {downloading ? "Zatrzymaj i zapisz pobrane" : "Anuluj"}
        </Button>
      </Box>
    </Box>
  );
};

export default DownloadStatus;
