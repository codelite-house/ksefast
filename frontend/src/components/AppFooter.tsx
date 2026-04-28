import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

const AppFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        pt: 3,
        borderTop: "1px solid",
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        KSeFast jest projektem open source.{" "}
        <Link
          href="https://github.com/codelitehouse/ksefast"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </Link>{" "}
        · Generowanie PDF:{" "}
        <Link
          href="https://github.com/CIRFMF/ksef-pdf-generator"
          target="_blank"
          rel="noreferrer"
        >
          CIRFMF/ksef-pdf-generator
        </Link>
      </Typography>
    </Box>
  );
};

export default AppFooter;
