import { useEffect } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import { PRIVACY_POLICY_UPDATED, privacyPolicySections } from "../content/privacyPolicy";
import GlowCard from "./ui/GlowCard";

const PrivacyPolicyPage = () => {
  useEffect(() => {
    document.title = "Polityka prywatności | KSeFast";
  }, []);

  return (
    <Box component="main" sx={{ py: { xs: 4, md: 8 }, maxWidth: 820, mx: "auto" }}>
      <Link href="/" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
        ← Wróć do pobierania faktur
      </Link>
      <Typography component="h1" sx={{ mt: 2, fontWeight: 800, fontSize: { xs: "1.9rem", md: "2.4rem" }, letterSpacing: "-0.02em" }}>
        Polityka prywatności
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Obowiązuje od {PRIVACY_POLICY_UPDATED}.
      </Typography>

      <GlowCard sx={{ mt: 4, p: { xs: 2.5, sm: 4 }, display: "grid", gap: 3.5 }}>
        {privacyPolicySections.map((section) => (
          <Box component="section" key={section.title}>
            <Typography component="h2" sx={{ fontWeight: 800, fontSize: "1.15rem", mb: 1 }}>
              {section.title}
            </Typography>
            {section.paragraphs.map((paragraph) => (
              <Typography key={paragraph} sx={{ color: "text.secondary", lineHeight: 1.7, mt: 1 }}>
                {paragraph}
              </Typography>
            ))}
            {section.bullets && (
              <Box component="ul" sx={{ m: 0, mt: 1, pl: 3, color: "text.secondary", lineHeight: 1.7 }}>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </GlowCard>
    </Box>
  );
};

export default PrivacyPolicyPage;
