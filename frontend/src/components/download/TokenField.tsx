import { useState, type Ref } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";

import { brand } from "../../theme";
import { ClipboardIcon, EyeIcon, EyeOffIcon, LockIcon } from "../ui/icons";

interface TokenFieldProps {
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef: Ref<HTMLInputElement>;
}

const TokenField = ({ value, error, onChange, onBlur, inputRef }: TokenFieldProps) => {
  const [visible, setVisible] = useState(false);
  const canPaste = typeof navigator !== "undefined" && !!navigator.clipboard?.readText;
  const filled = value.trim().length > 0;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) onChange(text.trim());
    } catch {
      // Brak zgody na odczyt schowka – użytkownik wklei token ręcznie (Ctrl+V).
    }
  };

  return (
    <TextField
      label="Token KSeF"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      type={visible ? "text" : "password"}
      placeholder="Wklej token KSeF"
      error={!!error}
      helperText={
        error ?? (
          <>
            Zaszyfrowany lokalnie, zanim opuści przeglądarkę.{" "}
            <Link href="https://www.podatki.gov.pl/ksef/" target="_blank" rel="noopener noreferrer">
              Skąd wziąć token?
            </Link>
          </>
        )
      }
      required
      fullWidth
      inputRef={inputRef}
      slotProps={{
        htmlInput: {
          autoComplete: "off",
          spellCheck: false,
          "data-1p-ignore": true,
          "data-lpignore": "true",
        },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon
                sx={{
                  fontSize: 20,
                  transition: "color .3s",
                  color: filled ? brand.green : "text.secondary",
                }}
              />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {!filled && canPaste && (
                <Button
                  size="small"
                  onClick={handlePaste}
                  startIcon={<ClipboardIcon sx={{ fontSize: 16 }} />}
                  sx={{ mr: 0.5, whiteSpace: "nowrap" }}
                >
                  Wklej
                </Button>
              )}
              <IconButton
                size="small"
                edge="end"
                onClick={() => setVisible((current) => !current)}
                aria-label={visible ? "Ukryj token" : "Pokaż token"}
              >
                {visible ? <EyeOffIcon fontSize="small" /> : <EyeIcon fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default TokenField;
