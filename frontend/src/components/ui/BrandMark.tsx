import Box from "@mui/material/Box";

import logoAnimated from "../../images/logo/ksefast-logo-animated-dark.svg";
import logoLoader from "../../images/logo/ksefast-logo-loader-dark.svg";
import logoStatic from "../../images/logo/ksefast-logo-dark.svg";

type BrandMarkVariant = "animated" | "static" | "loader";

interface BrandMarkProps {
  /** Wysokość w px; szerokość wynika z proporcji logo. */
  size?: number;
  /**
   * animated – animacja wejścia (raz po załadowaniu), static – bez ruchu,
   * loader – pętla (półobroty pierścienia + paski) na czas oczekiwania.
   */
  variant?: BrandMarkVariant;
}

const SOURCES: Record<BrandMarkVariant, string> = {
  animated: logoAnimated,
  static: logoStatic,
  loader: logoLoader,
};

/** Proporcje viewBox logo (2170×770) – żeby przeglądarka zarezerwowała miejsce przed pobraniem pliku. */
const ASPECT = 2170 / 770;

/**
 * Logo KSeFast (wariant na ciemne tło). Animacje są wbudowane w pliki SVG
 * i same wyłączają się przy `prefers-reduced-motion`.
 */
const BrandMark = ({ size = 56, variant = "animated" }: BrandMarkProps) => (
  <Box
    component="img"
    src={SOURCES[variant]}
    alt="KSeFast"
    width={Math.round(size * ASPECT)}
    height={size}
    sx={{ display: "block", height: size, width: "auto", maxWidth: "100%" }}
  />
);

export default BrandMark;
