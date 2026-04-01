import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import logo from "../images/logo.png";

export default function AppHeader() {
  return (
    <Box
      component="header"
      sx={{ mb: 2, display: "flex", justifyContent: "center" }}
    >
      <Box sx={{ maxWidth: 760, width: "100%", textAlign: "center" }}>
        <Box
          sx={{
            maxWidth: 680,
            width: "100%",
            overflow: "hidden",
            aspectRatio: "1536 / 520",
            mx: "auto",
          }}
        >
        <Box
          component="img"
          src={logo}
          alt="KSeFast – szybkie pobieranie faktur z KSeF"
          sx={{ width: "100%", display: "block", mt: "-12%" }}
        />
        </Box>
        <Typography
          component="h1"
          variant="h5"
          sx={{
            mt: 1,
            fontWeight: 800,
            fontSize: { xs: "1.15rem", sm: "1.45rem" },
            lineHeight: 1.25,
          }}
        >
          Darmowe pobieranie faktur z KSeF (XML i PDF)
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mt: 0.5,
            fontSize: { xs: "0.96rem", sm: "1.03rem" },
            letterSpacing: "0.035em",
            color: "rgba(255,255,255,0.82)",
          }}
        >
          Mniej klikania, szybsza wysyłka dokumentów do księgowości.
        </Typography>
      </Box>
    </Box>
  );
}
