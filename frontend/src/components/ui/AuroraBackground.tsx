import Box from "@mui/material/Box";

import { driftA, driftB } from "../../animations";

/** Stałe tło strony: powoli dryfujące poświaty + delikatna siatka zanikająca ku dołowi. */
const AuroraBackground = () => (
  <Box
    aria-hidden="true"
    sx={{
      position: "fixed",
      inset: 0,
      zIndex: -1,
      overflow: "hidden",
      pointerEvents: "none",
      background: "linear-gradient(180deg, #07111f 0%, #030712 100%)",
    }}
  >
    <Box
      sx={{
        position: "absolute",
        top: "-18%",
        left: "-10%",
        width: "62vw",
        height: "62vw",
        maxWidth: 900,
        maxHeight: 900,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(56,189,248,.28) 0%, rgba(56,189,248,0) 65%)",
        filter: "blur(30px)",
        animation: `${driftA} 26s ease-in-out infinite`,
        willChange: "transform",
      }}
    />
    <Box
      sx={{
        position: "absolute",
        top: "8%",
        right: "-14%",
        width: "55vw",
        height: "55vw",
        maxWidth: 820,
        maxHeight: 820,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(34,197,94,.18) 0%, rgba(34,197,94,0) 65%)",
        filter: "blur(36px)",
        animation: `${driftB} 32s ease-in-out infinite`,
        willChange: "transform",
      }}
    />
    <Box
      sx={{
        position: "absolute",
        bottom: "-22%",
        left: "28%",
        width: "50vw",
        height: "50vw",
        maxWidth: 760,
        maxHeight: 760,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(251,146,60,.12) 0%, rgba(251,146,60,0) 65%)",
        filter: "blur(40px)",
        animation: `${driftA} 38s ease-in-out infinite reverse`,
        willChange: "transform",
      }}
    />
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(148,163,184,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.06) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 80%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 80%)",
      }}
    />
  </Box>
);

export default AuroraBackground;
