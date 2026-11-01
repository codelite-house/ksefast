import { createTheme } from "@mui/material/styles";

export const brand = {
  sky: "#38bdf8",
  green: "#22c55e",
  amber: "#fb923c",
  ink: "#050b16",
  glass: "rgba(10, 20, 38, 0.72)",
  glassSolid: "#0a1426",
  line: "rgba(148, 163, 184, 0.16)",
  lineStrong: "rgba(56, 189, 248, 0.45)",
  gradientText: "linear-gradient(100deg, #38bdf8 0%, #22c55e 60%, #a3e635 100%)",
  gradientFast: "linear-gradient(100deg, #fbbf24 0%, #fb923c 60%, #f97316 100%)",
  gradientCta: "linear-gradient(120deg, #16a34a 0%, #22c55e 38%, #38bdf8 100%)",
} as const;

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: brand.sky },
    secondary: { main: brand.green },
    warning: { main: brand.amber },
    background: {
      default: brand.ink,
      paper: "rgba(8, 15, 28, 0.92)",
    },
    text: {
      primary: "#f1f5f9",
      secondary: "rgba(203, 213, 225, 0.78)",
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: { fontWeight: 800, letterSpacing: "-0.03em" },
    h2: { fontWeight: 800, letterSpacing: "-0.025em" },
    h3: { fontWeight: 700, letterSpacing: "-0.02em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { scrollBehavior: "smooth", scrollPaddingTop: "84px" },
        "html, body": { minHeight: "100vh", minWidth: "320px" },
        body: { backgroundColor: brand.ink, overflowX: "hidden" },
        "::selection": { background: "rgba(56, 189, 248, 0.35)" },
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": {
            animationDuration: "0.001ms !important",
            animationIterationCount: "1 !important",
            transitionDuration: "0.001ms !important",
            scrollBehavior: "auto !important",
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: { backgroundImage: "none" },
        outlined: { borderColor: brand.line },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 700 },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: { textTransform: "none" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          transition: "box-shadow .2s ease, background-color .2s ease",
          "&.Mui-focused": {
            backgroundColor: "rgba(56, 189, 248, 0.05)",
            boxShadow: "0 0 0 4px rgba(56, 189, 248, 0.14)",
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          backgroundImage: "none",
          "&::before": { display: "none" },
        },
      },
    },
  },
});

export default theme;
