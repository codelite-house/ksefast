import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";

import { useScrollProgress } from "../hooks/useScrollProgress";
import { brand } from "../theme";
import BrandMark from "./ui/BrandMark";
import { GithubIcon } from "./ui/icons";

const NAV_LINKS = [
  { href: "#jak-to-dziala", label: "Jak to działa" },
  { href: "#prywatnosc", label: "Prywatność" },
  { href: "#porownanie", label: "Porównanie" },
  { href: "#faq", label: "FAQ" },
] as const;

const AppHeader = () => {
  const progressRef = useScrollProgress<HTMLDivElement>();

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        backgroundColor: "rgba(5, 11, 22, 0.66)",
        borderBottom: "1px solid",
        borderColor: brand.line,
      }}
    >
      <Box
        sx={{
          maxWidth: 1240,
          mx: "auto",
          px: { xs: 2, sm: 3 },
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Link
          href="#top"
          underline="none"
          aria-label="KSeFast – początek strony"
          sx={{ display: "flex", minWidth: 0, "& img": { height: { xs: 44, sm: 56 } } }}
        >
          <BrandMark size={56} />
        </Link>

        <Box
          component="nav"
          aria-label="Sekcje strony"
          sx={{ display: { xs: "none", md: "flex" }, gap: 0.5 }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              underline="none"
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: "10px",
                fontSize: "0.92rem",
                fontWeight: 600,
                color: "text.secondary",
                transition: "color .2s, background-color .2s",
                "&:hover": { color: "text.primary", bgcolor: "rgba(148,163,184,.1)" },
              }}
            >
              {link.label}
            </Link>
          ))}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            component="a"
            href="https://github.com/codelitehouse/ksefast"
            target="_blank"
            rel="noreferrer"
            aria-label="Kod źródłowy na GitHubie"
            sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
          >
            <GithubIcon />
          </IconButton>
          <Button
            href="#pobierz"
            variant="contained"
            color="secondary"
            size="small"
            sx={{
              px: 2,
              whiteSpace: "nowrap",
              borderRadius: 999,
              color: "#04210f",
              background: brand.gradientCta,
              boxShadow: "0 8px 24px -10px rgba(34,197,94,.7)",
            }}
          >
            Pobierz faktury
          </Button>
        </Box>
      </Box>

      <Box
        ref={progressRef}
        aria-hidden="true"
        sx={{
          position: "absolute",
          left: 0,
          bottom: -1,
          height: 2,
          width: "100%",
          transformOrigin: "left",
          transform: "scaleX(0)",
          background: `linear-gradient(90deg, ${brand.sky}, ${brand.green}, ${brand.amber})`,
        }}
      />
    </Box>
  );
};

export default AppHeader;
