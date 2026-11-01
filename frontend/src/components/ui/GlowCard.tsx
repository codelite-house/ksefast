import { useRef, type PointerEvent, type ReactNode } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

import { brand } from "../../theme";

interface GlowCardProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
  id?: string;
}

/** Szklana karta z poświatą podążającą za kursorem (spotlight). */
const GlowCard = ({ children, sx, id }: GlowCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    element.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <Box
      id={id}
      ref={ref}
      onPointerMove={handlePointerMove}
      sx={[
        {
          position: "relative",
          isolation: "isolate",
          borderRadius: "22px",
          border: "1px solid",
          borderColor: brand.line,
          backgroundColor: brand.glass,
          backdropFilter: "blur(14px)",
          boxShadow: "0 24px 60px -30px rgba(0,0,0,.7)",
          transition: "border-color .3s ease, transform .3s ease",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            zIndex: -1,
            borderRadius: "inherit",
            background:
              "radial-gradient(420px circle at var(--mx, 50%) var(--my, -30%), rgba(56,189,248,.16), transparent 60%)",
            opacity: 0,
            transition: "opacity .3s ease",
            pointerEvents: "none",
          },
          "&:hover": { borderColor: "rgba(56, 189, 248, 0.32)" },
          "&:hover::before": { opacity: 1 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
};

export default GlowCard;
