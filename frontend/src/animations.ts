import { keyframes } from "@mui/material/styles";

export const driftA = keyframes`
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  50%  { transform: translate3d(6vw, 8vh, 0) scale(1.15); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
`;

export const driftB = keyframes`
  0%   { transform: translate3d(0, 0, 0) scale(1.1); }
  50%  { transform: translate3d(-7vw, -6vh, 0) scale(0.95); }
  100% { transform: translate3d(0, 0, 0) scale(1.1); }
`;

// Faktura leci z lewej do paczki ZIP: --y0 (start) i --y1 (lądowanie) ustawia każda karta.
export const flyInvoice = keyframes`
  0%   { left: 0;                       opacity: 0; transform: translateY(var(--y0)) rotate(var(--rot)) scale(0.9); }
  12%  { opacity: 1; }
  70%  { left: calc(100% - 166px);      opacity: 1; transform: translateY(var(--y1)) rotate(0deg) scale(0.82); }
  86%  { left: calc(100% - 134px);      opacity: 0; transform: translateY(var(--y1)) rotate(0deg) scale(0.3); }
  100% { left: calc(100% - 134px);      opacity: 0; transform: translateY(var(--y1)) scale(0.3); }
`;

export const zipPulse = keyframes`
  0%, 62%, 100% { transform: scale(1);    box-shadow: 0 0 40px rgba(56, 189, 248, 0.25); }
  72%           { transform: scale(1.07); box-shadow: 0 0 70px rgba(34, 197, 94, 0.55); }
`;

export const streak = keyframes`
  0%   { transform: translateX(-120%); opacity: 0; }
  20%  { opacity: 1; }
  100% { transform: translateX(260%);  opacity: 0; }
`;

export const shine = keyframes`
  0%   { transform: translateX(-130%) skewX(-18deg); }
  60%, 100% { transform: translateX(260%) skewX(-18deg); }
`;

export const growX = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

export const pulseRing = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.55); }
  100% { box-shadow: 0 0 0 16px rgba(34, 197, 94, 0); }
`;

export const popIn = keyframes`
  0%   { transform: scale(0.4); opacity: 0; }
  60%  { transform: scale(1.18); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

export const blink = keyframes`
  0%, 49%  { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

export const confetti = keyframes`
  0%   { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(0.6); opacity: 0; }
`;

export const floaty = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
`;

export const scan = keyframes`
  0%   { transform: translateY(-20%); opacity: 0; }
  15%  { opacity: 1; }
  85%  { opacity: 1; }
  100% { transform: translateY(120%); opacity: 0; }
`;
