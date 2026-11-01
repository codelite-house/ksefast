import { useEffect, useState } from "react";
import Box from "@mui/material/Box";

import { blink } from "../animations";
import { prefersReducedMotion, useReveal } from "../hooks/useReveal";
import { brand } from "../theme";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const CIPHER_LENGTH = 44;

// Wartości poglądowe – to nie jest prawdziwy token ani prawdziwy szyfrogram.
const SAMPLE_TOKEN = "20261101-EU-A1B2C3D4E5-F6A7B8C9D0-12|nip-1234563218|••••••••";

const randomCipher = () =>
  Array.from({ length: CIPHER_LENGTH }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

/** Poglądowa wizualizacja: jawny token (u Ciebie) → szyfrogram (to jedyne, co widzi serwer). */
const TokenScramble = () => {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [cipher, setCipher] = useState("kX9f2Lq0VbT7mZr4Ns8Yw1HcDa6PjEu3GoQi5Ft+/Rxy=");

  useEffect(() => {
    if (!visible || prefersReducedMotion()) return;
    const id = window.setInterval(() => setCipher(randomCipher()), 90);
    return () => window.clearInterval(id);
  }, [visible]);

  return (
    <Box ref={ref} sx={{ display: "grid", gap: 1.5, fontFamily: "ui-monospace, 'Cascadia Code', Consolas, monospace" }}>
      <Box>
        <Box sx={{ fontFamily: "inherit", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: brand.green, mb: 0.5 }}>
          U Ciebie · jawny token
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: "12px",
            fontSize: 12.5,
            wordBreak: "break-all",
            color: "#bbf7d0",
            bgcolor: "rgba(34,197,94,.08)",
            border: "1px solid rgba(34,197,94,.3)",
          }}
        >
          {SAMPLE_TOKEN}
        </Box>
      </Box>

      <Box sx={{ textAlign: "center", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "text.secondary" }}>
        ↓ szyfrowanie RSA-OAEP w przeglądarce ↓
      </Box>

      <Box>
        <Box sx={{ fontFamily: "inherit", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: brand.amber, mb: 0.5 }}>
          Do serwera · szyfrogram
        </Box>
        <Box
          aria-label="Przykładowy szyfrogram, który widzi serwer"
          sx={{
            p: 1.5,
            borderRadius: "12px",
            fontSize: 12.5,
            wordBreak: "break-all",
            color: "#fed7aa",
            bgcolor: "rgba(251,146,60,.08)",
            border: "1px solid rgba(251,146,60,.3)",
            minHeight: 54,
          }}
        >
          {cipher}
          <Box
            component="span"
            aria-hidden="true"
            sx={{ display: "inline-block", width: 7, height: 14, ml: 0.5, verticalAlign: "-2px", bgcolor: brand.amber, animation: `${blink} 1s steps(1) infinite` }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default TokenScramble;
