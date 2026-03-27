import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

export default function AppHeader() {
  return (
    <Box component="header" sx={{ mb: 5 }}>
      <Chip
        label="KSeFast"
        size="small"
        color="primary"
        variant="outlined"
        sx={{ mb: 1.5, letterSpacing: "0.08em", textTransform: "uppercase" }}
      />
      <Typography variant="h3" component="h1" fontWeight={700}>
        Pobierz faktury z KSeF
      </Typography>
    </Box>
  );
}
