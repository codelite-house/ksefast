import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { brand } from "../../theme";

export interface Choice<T extends string> {
  value: T;
  title: string;
  description: string;
  icon: ReactNode;
}

interface ChoiceCardsProps<T extends string> {
  label: string;
  value: T;
  options: readonly Choice<T>[];
  onChange: (value: T) => void;
}

/** Duże, czytelne karty wyboru (radio) – zamiast list rozwijanych dla 2–3 opcji. */
const ChoiceCards = <T extends string>({ label, value, options, onChange }: ChoiceCardsProps<T>) => (
  <Box
    role="radiogroup"
    aria-label={label}
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: `repeat(${options.length}, 1fr)` },
      gap: 1.25,
    }}
  >
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <Box
          key={option.value}
          component="button"
          type="button"
          role="radio"
          aria-checked={selected}
          onClick={() => onChange(option.value)}
          sx={{
            cursor: "pointer",
            font: "inherit",
            textAlign: "left",
            color: "text.primary",
            p: 1.5,
            borderRadius: "14px",
            border: "1px solid",
            borderColor: selected ? brand.sky : brand.line,
            bgcolor: selected ? "rgba(56,189,248,.12)" : "rgba(255,255,255,.02)",
            boxShadow: selected ? "0 0 0 3px rgba(56,189,248,.14)" : "none",
            display: "flex",
            gap: 1.25,
            alignItems: "flex-start",
            transition: "all .18s ease",
            "&:hover": { borderColor: "rgba(56,189,248,.5)" },
            "&:focus-visible": { outline: `2px solid ${brand.sky}`, outlineOffset: 2 },
          }}
        >
          <Box
            sx={{
              flexShrink: 0,
              width: 34,
              height: 34,
              borderRadius: "10px",
              display: "grid",
              placeItems: "center",
              color: selected ? "#04210f" : brand.sky,
              background: selected ? brand.gradientCta : "rgba(56,189,248,.1)",
              transition: "all .18s ease",
            }}
          >
            {option.icon}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.25 }}>
              {option.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35, display: "block", mt: 0.25 }}>
              {option.description}
            </Typography>
          </Box>
        </Box>
      );
    })}
  </Box>
);

export default ChoiceCards;
