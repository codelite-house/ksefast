import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import { brand } from "../theme";
import BrandMark from "./ui/BrandMark";

const AppFooter = () => (
  <Box
    component="footer"
    sx={{
      mt: { xs: 4, md: 8 },
      py: 5,
      borderTop: "1px solid",
      borderColor: brand.line,
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      alignItems: { xs: "flex-start", md: "center" },
      justifyContent: "space-between",
      gap: 3,
    }}
  >
    <Box>
      <BrandMark size={52} variant="static" />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 520, lineHeight: 1.6 }}>
        KSeFast to niezależny projekt open source – nie jest produktem Ministerstwa Finansów. Stworzony przez{" "}
        <Link href="https://github.com/codelitehouse" target="_blank" rel="noreferrer">
          codelitehouse
        </Link>
        .
      </Typography>
    </Box>
    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
      <Link href="https://github.com/codelitehouse/ksefast" target="_blank" rel="noreferrer">
        GitHub
      </Link>{" "}
      · Generowanie PDF:{" "}
      <Link href="https://github.com/CIRFMF/ksef-pdf-generator" target="_blank" rel="noreferrer">
        CIRFMF/ksef-pdf-generator
      </Link>
    </Typography>
  </Box>
);

export default AppFooter;
