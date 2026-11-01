import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { popIn } from "../../animations";
import { brand } from "../../theme";
import { CheckIcon } from "../ui/icons";

interface SectionTitleProps {
  index: number;
  title: string;
  done: boolean;
  hint?: string;
}

/** Nagłówek sekcji formularza: numer zamienia się w „ptaszek", gdy sekcja jest uzupełniona. */
const SectionTitle = ({ index, title, done, hint }: SectionTitleProps) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5 }}>
    <Box
      key={done ? "done" : "todo"}
      sx={{
        width: 28,
        height: 28,
        flexShrink: 0,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        fontSize: 13,
        fontWeight: 800,
        border: "1px solid",
        borderColor: done ? "rgba(34,197,94,.7)" : brand.line,
        bgcolor: done ? brand.green : "rgba(148,163,184,.1)",
        color: done ? "#04210f" : "text.secondary",
        transition: "background-color .3s, border-color .3s",
        animation: done ? `${popIn} .45s ease` : "none",
      }}
    >
      {done ? <CheckIcon sx={{ fontSize: 16 }} /> : index}
    </Box>
    <Typography component="h3" sx={{ fontWeight: 700, fontSize: "1.02rem" }}>
      {title}
    </Typography>
    {hint && (
      <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
        {hint}
      </Typography>
    )}
  </Box>
);

export default SectionTitle;
