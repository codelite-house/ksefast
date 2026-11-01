import Box from "@mui/material/Box";

import { monthLabels } from "../../lib/monthLabels";
import { brand } from "../../theme";

interface MonthPickerProps {
  value: string;
  onChange: (label: string) => void;
}

const MonthPicker = ({ value, onChange }: MonthPickerProps) => (
  <Box
    role="radiogroup"
    aria-label="Okres (miesiąc)"
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "repeat(4, 1fr)", sm: "repeat(6, 1fr)" },
      rowGap: 1.25,
      columnGap: 0.75,
    }}
  >
    {monthLabels.map((month, index) => {
      const [name, year] = month.label.split(" ");
      const selected = month.label === value;
      const tag = index === 0 ? "bieżący" : index === 1 ? "poprzedni" : null;

      return (
        <Box
          key={month.label}
          component="button"
          type="button"
          role="radio"
          aria-checked={selected}
          aria-label={month.label}
          onClick={() => onChange(month.label)}
          sx={{
            position: "relative",
            cursor: "pointer",
            font: "inherit",
            color: selected ? "#f0f9ff" : "text.secondary",
            px: 0.5,
            py: 0.9,
            borderRadius: "12px",
            border: "1px solid",
            borderColor: selected ? brand.sky : brand.line,
            bgcolor: selected ? "rgba(56,189,248,.16)" : "rgba(255,255,255,.02)",
            boxShadow: selected ? "0 0 0 3px rgba(56,189,248,.16), 0 10px 24px -14px rgba(56,189,248,.8)" : "none",
            transform: selected ? "translateY(-1px)" : "none",
            transition: "all .18s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            lineHeight: 1.15,
            "&:hover": { borderColor: "rgba(56,189,248,.5)", color: "text.primary" },
            "&:focus-visible": { outline: `2px solid ${brand.sky}`, outlineOffset: 2 },
          }}
        >
          <Box component="span" sx={{ fontWeight: 800, fontSize: "0.98rem" }}>
            {name.slice(0, 3)}
          </Box>
          <Box component="span" sx={{ fontSize: "0.74rem", opacity: 0.8 }}>
            {year}
          </Box>
          {tag && (
            <Box
              component="span"
              sx={{
                position: "absolute",
                top: -8,
                right: 6,
                px: 0.75,
                borderRadius: 999,
                fontSize: "0.62rem",
                fontWeight: 800,
                letterSpacing: ".03em",
                color: "#04210f",
                background: index === 1 ? brand.gradientText : brand.gradientFast,
              }}
            >
              {tag}
            </Box>
          )}
        </Box>
      );
    })}
  </Box>
);

export default MonthPicker;
