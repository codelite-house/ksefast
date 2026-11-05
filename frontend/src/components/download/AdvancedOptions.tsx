import { useState } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import type { ContextIdentifierType, DateType, SubjectChoice } from "../../types";
import { brand } from "../../theme";
import { ChevronDownIcon } from "../ui/icons";

interface AdvancedOptionsProps {
  contextType: ContextIdentifierType;
  subjectType: SubjectChoice;
  dateType: DateType;
  onContextTypeChange: (value: ContextIdentifierType) => void;
  onSubjectTypeChange: (value: SubjectChoice) => void;
  onDateTypeChange: (value: DateType) => void;
}

const AdvancedOptions = ({
  contextType,
  subjectType,
  dateType,
  onContextTypeChange,
  onSubjectTypeChange,
  onDateTypeChange,
}: AdvancedOptionsProps) => {
  const [open, setOpen] = useState(false);
  const changed = contextType !== "Nip" || dateType !== "Invoicing" || subjectType === "Subject3" || subjectType === "SubjectAuthorized";

  return (
    <Box>
      <ButtonBase
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="opcje-zaawansowane"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          px: 0.5,
          py: 0.5,
          borderRadius: 1,
          color: "text.secondary",
          "&:hover": { color: "text.primary" },
        }}
      >
        <ChevronDownIcon
          sx={{ fontSize: 18, transition: "transform .25s", transform: open ? "rotate(180deg)" : "none" }}
        />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Opcje zaawansowane
        </Typography>
        {changed && (
          <Box
            component="span"
            aria-label="zmienione ustawienia"
            sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: brand.amber }}
          />
        )}
      </ButtonBase>

      <Collapse in={open} id="opcje-zaawansowane">
        <Box sx={{ display: "grid", gap: 2, pt: 2 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "minmax(0, 1fr) minmax(0, 1fr)" }, gap: 2 }}>
            <TextField
              select
              label="Rodzaj identyfikatora"
              value={contextType}
              onChange={(event) => onContextTypeChange(event.target.value as ContextIdentifierType)}
              fullWidth
            >
              <MenuItem value="Nip">NIP</MenuItem>
              <MenuItem value="InternalId">InternalId</MenuItem>
              <MenuItem value="NipVatUe">NIP VAT UE</MenuItem>
              <MenuItem value="PeppolId">Peppol ID</MenuItem>
            </TextField>
            <TextField
              select
              label="Typ daty"
              value={dateType}
              onChange={(event) => onDateTypeChange(event.target.value as DateType)}
              fullWidth
            >
              <MenuItem value="Invoicing">Przyjęcie w KSeF</MenuItem>
              <MenuItem value="Issue">Data wystawienia</MenuItem>
              <MenuItem value="PermanentStorage">Trwały zapis</MenuItem>
            </TextField>
          </Box>
          <TextField
            select
            label="Rola w wyszukiwaniu"
            value={subjectType}
            onChange={(event) => onSubjectTypeChange(event.target.value as SubjectChoice)}
            fullWidth
          >
            <MenuItem value="Subject1">Podmiot 1 / sprzedawca</MenuItem>
            <MenuItem value="Subject2">Podmiot 2 / nabywca</MenuItem>
            <MenuItem value="Both">Podmiot 1 + 2 (sprzedaż i zakupy)</MenuItem>
            <MenuItem value="Subject3">Podmiot 3</MenuItem>
            <MenuItem value="SubjectAuthorized">Podmiot upoważniony</MenuItem>
          </TextField>
        </Box>
      </Collapse>
    </Box>
  );
};

export default AdvancedOptions;
