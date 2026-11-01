import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import { floaty } from "../animations";
import { brand } from "../theme";
import GlowCard from "./ui/GlowCard";
import { CoffeeIcon } from "./ui/icons";

const SupportCard = () => (
  <GlowCard
    sx={{
      p: { xs: 2.5, sm: 3.5 },
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      gap: 3,
      background:
        "linear-gradient(160deg, rgba(251,146,60,.10) 0%, rgba(10,20,38,.72) 55%)",
    }}
  >
    <Box>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "16px",
          display: "grid",
          placeItems: "center",
          color: brand.amber,
          bgcolor: "rgba(251,146,60,.12)",
          border: "1px solid rgba(251,146,60,.35)",
          animation: `${floaty} 3.2s ease-in-out infinite`,
        }}
      >
        <CoffeeIcon sx={{ fontSize: 30 }} />
      </Box>
      <Typography component="h3" sx={{ mt: 2.5, fontWeight: 800, fontSize: "1.45rem", letterSpacing: "-0.02em" }}>
        Wesprzyj projekt
      </Typography>
      <Typography sx={{ mt: 1, color: "text.secondary", lineHeight: 1.65 }}>
        Jeśli KSeFast zaoszczędził Twój czas, pomóż nam rozwijać projekt. Dziękujemy za każdą kawę!
      </Typography>
    </Box>

    <Box>
      <Button
        variant="contained"
        size="large"
        href="https://buycoffee.to/codelitehouse"
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<CoffeeIcon />}
        sx={{ color: "#2a1200", background: brand.gradientFast, boxShadow: "0 14px 34px -14px rgba(251,146,60,.8)" }}
      >
        Postaw kawę
      </Button>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Masz pomysł, jak możemy działać lepiej? Napisz na{" "}
        <Link href="mailto:contact@codelitehouse.com">contact@codelitehouse.com</Link>
      </Typography>
    </Box>
  </GlowCard>
);

export default SupportCard;
