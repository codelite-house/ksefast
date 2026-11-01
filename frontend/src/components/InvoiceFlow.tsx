import Box from "@mui/material/Box";

import { flyInvoice, shine, streak, zipPulse } from "../animations";
import { brand } from "../theme";
import { DownloadIcon } from "./ui/icons";

const CYCLE_SECONDS = 7;

// Każda karta ma własny pas (y0 → y1), obrót startowy i format (XML / PDF).
const INVOICES = [
  { y0: -78, y1: -6, rot: -8, badge: "XML" },
  { y0: 4, y1: 6, rot: 5, badge: "PDF" },
  { y0: 82, y1: 10, rot: -4, badge: "XML" },
  { y0: -30, y1: -2, rot: 9, badge: "PDF" },
  { y0: 52, y1: 0, rot: -7, badge: "XML" },
  { y0: -56, y1: 4, rot: 3, badge: "PDF" },
] as const;

const STREAKS = [
  { top: "34%", delay: 0, width: "34%" },
  { top: "50%", delay: 1.3, width: "42%" },
  { top: "66%", delay: 2.4, width: "30%" },
] as const;

const MiniInvoice = ({ badge }: { badge: string }) => (
  <Box
    sx={{
      width: 74,
      height: 96,
      p: 1,
      borderRadius: "8px",
      border: "1px solid rgba(56,189,248,.35)",
      background: "linear-gradient(160deg, #123256 0%, #0b1c34 100%)",
      boxShadow: "0 10px 30px -10px rgba(56,189,248,.55)",
      display: "flex",
      flexDirection: "column",
      gap: 0.6,
    }}
  >
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Box sx={{ width: 22, height: 5, borderRadius: 1, bgcolor: "rgba(56,189,248,.8)" }} />
      <Box
        sx={{
          fontSize: 8,
          fontWeight: 800,
          px: 0.6,
          borderRadius: 0.75,
          color: badge === "PDF" ? "#fed7aa" : "#bbf7d0",
          bgcolor: badge === "PDF" ? "rgba(251,146,60,.25)" : "rgba(34,197,94,.25)",
        }}
      >
        {badge}
      </Box>
    </Box>
    {[100, 82, 92, 60].map((width, index) => (
      <Box
        key={index}
        sx={{ height: 4, width: `${width}%`, borderRadius: 1, bgcolor: "rgba(148,163,184,.3)" }}
      />
    ))}
    <Box
      sx={{
        mt: "auto",
        height: 7,
        width: "55%",
        alignSelf: "flex-end",
        borderRadius: 1,
        bgcolor: "rgba(34,197,94,.55)",
      }}
    />
  </Box>
);

/** Dekoracyjna animacja hero: faktury z KSeF lecą do jednej paczki ZIP. */
const InvoiceFlow = () => (
  <Box
    aria-hidden="true"
    sx={{
      position: "relative",
      height: 250,
      width: "100%",
      maxWidth: 560,
      overflow: "hidden",
    }}
  >
    {STREAKS.map((item) => (
      <Box
        key={item.top}
        sx={{
          position: "absolute",
          top: item.top,
          left: "16%",
          width: item.width,
          height: 2,
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${brand.amber}, #fde68a)`,
          animation: `${streak} 2.8s ease-in ${item.delay}s infinite`,
          opacity: 0,
        }}
      />
    ))}

    {INVOICES.map((invoice, index) => (
      <Box
        key={index}
        sx={{
          position: "absolute",
          top: "calc(50% - 48px)",
          left: 0,
          opacity: 0,
          "--y0": `${invoice.y0}px`,
          "--y1": `${invoice.y1}px`,
          "--rot": `${invoice.rot}deg`,
          animation: `${flyInvoice} ${CYCLE_SECONDS}s cubic-bezier(.5,.05,.4,1) ${
            (index * CYCLE_SECONDS) / INVOICES.length
          }s infinite`,
        }}
      >
        <MiniInvoice badge={invoice.badge} />
      </Box>
    ))}

    <Box
      sx={{
        position: "absolute",
        top: "calc(50% - 62px)",
        right: 16,
        width: 124,
        height: 124,
        borderRadius: "28px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        color: "#04210f",
        background: `linear-gradient(145deg, ${brand.sky}, ${brand.green})`,
        // Opóźnienie dobrane tak, by błysk paczki wypadał w momencie lądowania kolejnej faktury.
        animation: `${zipPulse} ${CYCLE_SECONDS / INVOICES.length}s ease-in-out 0.63s infinite`,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          height: "24%",
          left: "calc(50% - 3px)",
          width: 6,
          opacity: 0.35,
          background:
            "repeating-linear-gradient(180deg, #04210f 0 6px, transparent 6px 12px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          width: "40%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent)",
          animation: `${shine} 3.4s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: "relative",
          width: 46,
          height: 46,
          borderRadius: "50%",
          bgcolor: "#f0fdf4",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 6px 18px rgba(4,33,15,.35)",
        }}
      >
        <DownloadIcon sx={{ fontSize: 26, color: "#047857" }} />
      </Box>
      <Box sx={{ position: "relative", fontSize: 12, fontWeight: 800, letterSpacing: ".06em" }}>
        FAKTURY.ZIP
      </Box>
    </Box>
  </Box>
);

export default InvoiceFlow;
