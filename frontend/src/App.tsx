import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import theme from "./theme";
import AppFooter from "./components/AppFooter";
import AppHeader from "./components/AppHeader";
import ComparisonSection from "./components/ComparisonSection";
import ContactPanel from "./components/ContactPanel";
import DownloadForm from "./components/DownloadForm";
import FaqSection from "./components/FaqSection";
import GuidePage from "./components/GuidePage";
import HeroCopy from "./components/HeroCopy";
import { findGuide } from "./content/guides";
import HowItWorks from "./components/HowItWorks";
import PrivacyPolicyPage from "./components/PrivacyPolicyPage";
import PrivacySection from "./components/PrivacySection";
import { PRIVACY_POLICY_PATH } from "./content/privacyPolicy";
import SupportCard from "./components/SupportCard";
import AuroraBackground from "./components/ui/AuroraBackground";
import Reveal from "./components/ui/Reveal";
import Section, { GradientText } from "./components/ui/Section";

const App = () => {
  // Kilka podstron – bez routera; nginx serwuje index.html (albo statyczny HTML poradnika) dla każdej ścieżki.
  const pathname = window.location.pathname.replace(/\/$/, "");
  const guide = findGuide(pathname);
  if (pathname === PRIVACY_POLICY_PATH || guide) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuroraBackground />
        <AppHeader />
        <Container maxWidth={false} sx={{ maxWidth: 1240, px: { xs: 2, sm: 3 } }}>
          {guide ? <GuidePage guide={guide} /> : <PrivacyPolicyPage />}
          <AppFooter />
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuroraBackground />

      <Box
        component="a"
        href="#pobierz"
        sx={{
          position: "absolute",
          left: 16,
          top: -60,
          zIndex: 30,
          px: 2,
          py: 1,
          borderRadius: "8px",
          bgcolor: "primary.main",
          color: "#04210f",
          fontWeight: 700,
          textDecoration: "none",
          "&:focus": { top: 12 },
        }}
      >
        Przejdź do formularza pobierania
      </Box>

      <AppHeader />

      <Container maxWidth={false} id="top" sx={{ maxWidth: 1240, px: { xs: 2, sm: 3 } }}>
        <Box component="main">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 560px" },
              gap: { xs: 4, lg: 7 },
              alignItems: "start",
              pt: { xs: 0, lg: 2 },
            }}
          >
            <HeroCopy />
            <Box sx={{ pt: { xs: 0, lg: 6 } }}>
              <DownloadForm />
            </Box>
          </Box>

          <HowItWorks />
          <PrivacySection />
          <ComparisonSection />
          <FaqSection />

          <Section
            id="kontakt"
            eyebrow="Kontakt"
            title={
              <>
                Napisz do nas – <GradientText fast>czytamy każdy mail</GradientText>
              </>
            }
          >
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1.25fr)" }, gap: 3 }}>
              <Reveal>
                <SupportCard />
              </Reveal>
              <Reveal delay={140}>
                <ContactPanel />
              </Reveal>
            </Box>
          </Section>
        </Box>

        <AppFooter />
      </Container>
    </ThemeProvider>
  );
};

export default App;
