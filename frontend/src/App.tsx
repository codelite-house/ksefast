import { Analytics } from "@vercel/analytics/react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import theme from "./theme";
import AppHeader from "./components/AppHeader";
import AppFooter from "./components/AppFooter";
import DownloadForm from "./components/DownloadForm";
import QAPanel from "./components/QAPanel";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 6, px: { xs: 2, sm: 3 } }}>
        <AppHeader />

        <Box
          component="main"
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 380px" },
            gap: 4,
            alignItems: "flex-start",
          }}
        >
          <DownloadForm />
          <QAPanel />
        </Box>

        <AppFooter />
      </Container>
      <Analytics />
    </ThemeProvider>
  );
}

export default App;
