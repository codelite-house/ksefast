import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

import { useReveal } from "../../hooks/useReveal";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  sx?: SxProps<Theme>;
}

/** Element wjeżdża łagodnie (fade + slide), gdy pojawi się w viewporcie. */
const Reveal = ({ children, delay = 0, sx }: RevealProps) => {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <Box
      ref={ref}
      sx={[
        {
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(28px)",
          transition: `opacity .7s ease ${delay}ms, transform .8s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
};

export default Reveal;
