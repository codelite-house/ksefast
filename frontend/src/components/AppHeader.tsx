import Box from "@mui/material/Box";
import logo from "../images/logo.png";

export default function AppHeader() {
  return (
    <Box component="header" sx={{ mb: 5 }}>
      <Box
        component="img"
        src={logo}
        alt="KSeFast – szybkie pobieranie faktur z KSeF"
        sx={{
          maxWidth: 340,
          width: "100%",
        }}
      />
    </Box>
  );
}
