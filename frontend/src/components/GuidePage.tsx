import { useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import { guides, type Guide } from "../content/guides";
import { brand } from "../theme";
import GlowCard from "./ui/GlowCard";
import { DownloadIcon } from "./ui/icons";

const listSx = { m: 0, mt: 1, pl: 3, color: "text.secondary", lineHeight: 1.7, "& li": { mt: 0.75 } } as const;

const GuidePage = ({ guide }: { guide: Guide }) => {
  useEffect(() => {
    document.title = guide.metaTitle;
  }, [guide]);

  const related = guides.filter((other) => other.slug !== guide.slug);

  return (
    <Box component="main" sx={{ py: { xs: 4, md: 8 }, maxWidth: 820, mx: "auto" }}>
      <Link href="/" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
        ← Wróć do pobierania faktur
      </Link>
      <Typography
        component="h1"
        sx={{ mt: 2, fontWeight: 800, fontSize: { xs: "1.9rem", md: "2.4rem" }, letterSpacing: "-0.02em", textWrap: "balance" }}
      >
        {guide.title}
      </Typography>
      <Typography sx={{ mt: 1.5, color: "text.secondary", fontSize: "1.08rem", lineHeight: 1.7 }}>{guide.lead}</Typography>

      <Box component="article" sx={{ mt: 4 }}>
      <GlowCard sx={{ p: { xs: 2.5, sm: 4 }, display: "grid", gap: 3.5 }}>
        {guide.sections.map((section) => (
          <Box component="section" key={section.heading}>
            <Typography component="h2" sx={{ fontWeight: 800, fontSize: "1.2rem", mb: 1 }}>
              {section.heading}
            </Typography>
            {section.paragraphs?.map((paragraph) => (
              <Typography key={paragraph} sx={{ color: "text.secondary", lineHeight: 1.7, mt: 1 }}>
                {paragraph}
              </Typography>
            ))}
            {section.steps && (
              <Box component="ol" sx={listSx}>
                {section.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </Box>
            )}
            {section.bullets && (
              <Box component="ul" sx={listSx}>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </GlowCard>
      </Box>

      <GlowCard
        sx={{
          mt: 3,
          p: { xs: 2.5, sm: 3.5 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: "1.2rem" }}>Pobierz faktury z KSeF teraz</Typography>
          <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
            Za darmo, bez rejestracji. Cały miesiąc w jednej paczce ZIP.
          </Typography>
        </Box>
        <Button
          href="/#pobierz"
          variant="contained"
          color="secondary"
          size="large"
          startIcon={<DownloadIcon />}
          sx={{ flexShrink: 0, color: "#04210f", background: brand.gradientCta }}
        >
          Pobierz faktury
        </Button>
      </GlowCard>

      <Box component="nav" aria-label="Inne poradniki" sx={{ mt: 5 }}>
        <Typography component="h2" sx={{ fontWeight: 800, fontSize: "1.05rem" }}>
          Inne poradniki
        </Typography>
        <Box component="ul" sx={listSx}>
          {related.map((other) => (
            <li key={other.slug}>
              <Link href={`/${other.slug}`}>{other.linkLabel}</Link>
            </li>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default GuidePage;
