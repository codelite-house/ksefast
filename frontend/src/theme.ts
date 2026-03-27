import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#38bdf8" },
    secondary: { main: "#22c55e" },
    background: {
      default: "#07111f",
      paper: "rgba(8, 15, 28, 0.92)",
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "html, body": {
          background: `
            radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 28%),
            linear-gradient(180deg, #08111e 0%, #030712 100%)
          `,
          minHeight: "100vh",
          minWidth: "320px",
        },
      },
    },
    MuiPaper: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: { backgroundImage: "none" },
        outlined: { borderColor: "rgba(148, 163, 184, 0.18)" },
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
  },
});

export default theme;
