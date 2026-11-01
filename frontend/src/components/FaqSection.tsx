import { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { faqItems } from "../content/faqItems";
import { brand } from "../theme";
import GlowCard from "./ui/GlowCard";
import { ChevronDownIcon, MailIcon } from "./ui/icons";
import Reveal from "./ui/Reveal";
import Section from "./ui/Section";

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const FaqSection = () => {
  const [expanded, setExpanded] = useState<number | false>(0);

  return (
    <Section id="faq" eyebrow="Pytania i odpowiedzi" title="Najczęstsze pytania">
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 340px" }, gap: 3, alignItems: "start" }}>
        <Reveal>
          <GlowCard sx={{ p: { xs: 0.5, sm: 1.5 } }}>
            {faqItems.map(({ q, a }, index) => (
              <Accordion
                key={q}
                disableGutters
                square
                elevation={0}
                expanded={expanded === index}
                onChange={(_, isExpanded) => setExpanded(isExpanded ? index : false)}
                sx={{
                  border: "none",
                  borderBottom: index === faqItems.length - 1 ? "none" : `1px solid ${brand.line}`,
                }}
              >
                <AccordionSummary
                  expandIcon={<ChevronDownIcon sx={{ color: brand.sky }} />}
                  aria-controls={`faq-${index}-content`}
                  id={`faq-${index}-header`}
                  sx={{ px: { xs: 1.5, sm: 2 }, py: 0.5, "& .MuiAccordionSummary-content": { my: 1.5 } }}
                >
                  <Typography sx={{ fontWeight: 700, lineHeight: 1.4 }}>{q}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: { xs: 1.5, sm: 2 }, pt: 0, pb: 2.5 }}>
                  <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>{a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </GlowCard>
        </Reveal>
        <Reveal delay={140} sx={{ position: { lg: "sticky" }, top: 96 }}>
          <GlowCard sx={{ p: 3 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                color: brand.sky,
                bgcolor: "rgba(56,189,248,.1)",
                border: "1px solid rgba(56,189,248,.3)",
              }}
            >
              <MailIcon />
            </Box>
            <Typography sx={{ mt: 2, fontWeight: 800, fontSize: "1.2rem" }}>Nie ma tu Twojego pytania?</Typography>
            <Typography sx={{ mt: 0.75, color: "text.secondary", lineHeight: 1.6 }}>
              Napisz do nas – czytamy każdą wiadomość i chętnie dopiszemy odpowiedź.
            </Typography>
            <Button href="#kontakt" variant="outlined" sx={{ mt: 2.5 }}>
              Napisz do nas
            </Button>
          </GlowCard>
        </Reveal>
      </Box>
      {/* Statyczny, zahardkodowany obiekt (bez danych użytkownika) serializowany JSON.stringify –
          dangerouslySetInnerHTML to jedyny sposób na wstrzyknięcie JSON-LD (SEO) do <script> w Reakcie. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
    </Section>
  );
};

export default FaqSection;
