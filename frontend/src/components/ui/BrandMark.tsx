import { useId } from "react";
import Box from "@mui/material/Box";

import { brand } from "../../theme";

interface BrandMarkProps {
  size?: number;
  showWordmark?: boolean;
}

/**
 * Znak KSeFast: dokument ze strzałką pobierania + pomarańczowe smugi prędkości.
 * Wektor – ostry na każdym ekranie i bez ciężkiego PNG. Docelowe logo podmieniasz tutaj.
 */
const BrandMark = ({ size = 40, showWordmark = true }: BrandMarkProps) => {
  const uid = useId().replace(/:/g, "");

  return (
    <Box
      sx={{ display: "inline-flex", alignItems: "center", gap: 1.25, lineHeight: 1 }}
    >
      <svg
        width={size * 1.1}
        height={size}
        viewBox="0 0 52 48"
        role="img"
        aria-label="KSeFast"
      >
        <defs>
          <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={brand.sky} />
            <stop offset="1" stopColor={brand.green} />
          </linearGradient>
          <linearGradient id={`${uid}-fast`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f97316" stopOpacity="0" />
            <stop offset="1" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <path
          d="M1 15h11M0 24h12M3 33h9"
          stroke={`url(#${uid}-fast)`}
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />
        <rect x="11" y="2" width="40" height="44" rx="11" fill={`url(#${uid}-bg)`} />
        <path
          d="M22 11h10l6 6v18a2 2 0 0 1-2 2H22a2 2 0 0 1-2-2V13a2 2 0 0 1 2-2z"
          fill="#fff"
          fillOpacity="0.96"
        />
        <path d="M32 11v5a1 1 0 0 0 1 1h5" fill="#bae6fd" />
        <path
          d="M29 20v10m-4.5-4.5L29 30l4.5-4.5"
          stroke="#0b4a6a"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showWordmark && (
        <Box
          component="span"
          sx={{
            fontSize: size * 0.62,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            fontStyle: "italic",
            color: "#f8fafc",
          }}
        >
          KSe
          <Box
            component="span"
            sx={{
              background: brand.gradientFast,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              pr: "0.08em",
            }}
          >
            Fast
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BrandMark;
