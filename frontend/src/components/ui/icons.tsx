import type { ReactNode } from "react";
import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";

// Ikony liniowe (stroke) – bez dodatkowej zależności od @mui/icons-material.
const makeIcon = (children: ReactNode) => {
  const Icon = ({ sx, ...props }: SvgIconProps) => (
    <SvgIcon
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
      sx={[
        {
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 2,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </SvgIcon>
  );
  return Icon;
};

export const LockIcon = makeIcon(
  <>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>,
);

export const ShieldCheckIcon = makeIcon(
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </>,
);

export const BoltIcon = makeIcon(<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />);

export const DownloadIcon = makeIcon(
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
    <path d="M12 15V3" />
  </>,
);

export const FileTextIcon = makeIcon(
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8M16 17H8M10 9H8" />
  </>,
);

export const CodeIcon = makeIcon(
  <>
    <path d="m16 18 6-6-6-6" />
    <path d="m8 6-6 6 6 6" />
  </>,
);

export const CheckIcon = makeIcon(<path d="M20 6 9 17l-5-5" />);

export const EyeIcon = makeIcon(
  <>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </>,
);

export const EyeOffIcon = makeIcon(
  <>
    <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c6.4 0 10 8 10 8a17.6 17.6 0 0 1-2.2 3.2" />
    <path d="M6.6 6.6A17.4 17.4 0 0 0 2 12s3.6 8 10 8a10 10 0 0 0 5.4-1.6" />
    <path d="M14.1 14.1a3 3 0 1 1-4.2-4.2" />
    <path d="m2 2 20 20" />
  </>,
);

export const ClipboardIcon = makeIcon(
  <>
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </>,
);

export const CalendarIcon = makeIcon(
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </>,
);

export const GithubIcon = makeIcon(
  <>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </>,
);

export const CoffeeIcon = makeIcon(
  <>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <path d="M6 2v2M10 2v2M14 2v2" />
  </>,
);

export const ChevronDownIcon = makeIcon(<path d="m6 9 6 6 6-6" />);

export const ServerIcon = makeIcon(
  <>
    <rect x="2" y="2" width="20" height="8" rx="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" />
    <path d="M6 6h.01M6 18h.01" />
  </>,
);

export const BrowserIcon = makeIcon(
  <>
    <rect x="2" y="3" width="20" height="18" rx="2" />
    <path d="M2 9h20M6 6h.01M9 6h.01" />
  </>,
);

export const ArchiveIcon = makeIcon(
  <>
    <rect x="2" y="3" width="20" height="5" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4" />
  </>,
);

export const KeyIcon = makeIcon(
  <>
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" />
  </>,
);

export const MailIcon = makeIcon(
  <>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </>,
);

export const ClockIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </>,
);

export const RefreshIcon = makeIcon(
  <>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M8 16H3v5" />
  </>,
);

export const AlertIcon = makeIcon(
  <>
    <path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3z" />
    <path d="M12 9v4M12 17h.01" />
  </>,
);
