import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { brand } from "../../theme";
import Reveal from "./Reveal";

interface SectionProps {
  id: string;
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
}

const Section = ({ id, eyebrow, title, subtitle, children }: SectionProps) => (
  <Box component="section" id={id} sx={{ py: { xs: 6, md: 10 } }}>
    <Reveal>
      <Box sx={{ maxWidth: 760, mb: { xs: 4, md: 6 } }}>
        <Typography
          sx={{
            fontSize: "0.82rem",
            fontWeight: 800,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: brand.sky,
          }}
        >
          {eyebrow}
        </Typography>
        <Typography
          component="h2"
          sx={{
            mt: 1,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            fontSize: { xs: "1.9rem", md: "2.7rem" },
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ mt: 1.5, color: "text.secondary", fontSize: "1.08rem", lineHeight: 1.6 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Reveal>
    {children}
  </Box>
);

export const GradientText = ({ children, fast = false }: { children: ReactNode; fast?: boolean }) => (
  <Box
    component="span"
    sx={{
      background: fast ? brand.gradientFast : brand.gradientText,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    }}
  >
    {children}
  </Box>
);

export default Section;
