import Box from "@mui/material/Box";
import logo from "../images/logo.png";

export default function AppHeader() {
  return (
    <Box
      component="header"
      sx={{ mb: 1, display: "flex", justifyContent: "center" }}
    >
      <Box
        sx={{
          maxWidth: 680,
          width: "100%",
          overflow: "hidden",
          aspectRatio: "1536 / 520",
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="KSeFast – szybkie pobieranie faktur z KSeF"
          sx={{ width: "100%", display: "block", mt: "-12%" }}
        />
      </Box>
    </Box>
  );
}
