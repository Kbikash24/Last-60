import type { ReactNode, SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const TimerIcon = (p: IconProps) => (
  <Icon {...p}>
    <line x1="10" x2="14" y1="2" y2="2" />
    <line x1="12" x2="15" y1="14" y2="11" />
    <circle cx="12" cy="14" r="8" />
  </Icon>
);

export const GaugeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 14 4-4" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </Icon>
);

export const TargetIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3" />
    <line x1="12" x2="12" y1="1" y2="5" />
    <line x1="12" x2="12" y1="19" y2="23" />
    <line x1="1" x2="5" y1="12" y2="12" />
    <line x1="19" x2="23" y1="12" y2="12" />
  </Icon>
);

export const BoltIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
  </Icon>
);

export const SkullIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="9" cy="12" r="1" />
  </Icon>
);

export const CrownIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m2 6 5 4 5-7 5 7 5-4-2.5 12h-15z" />
    <path d="M5 21h14" />
  </Icon>
);

export const GamepadIcon = (p: IconProps) => (
  <Icon {...p}>
    <line x1="6" x2="10" y1="11" y2="11" />
    <line x1="8" x2="8" y1="9" y2="13" />
    <line x1="15" x2="15.01" y1="12" y2="12" />
    <line x1="18" x2="18.01" y1="10" y2="10" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.98 3.59C2.6 9.42 2 14.46 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.41-1.41A2 2 0 0 1 9.83 16h4.34a2 2 0 0 1 1.41.59L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.55-.6-6.58-.68-7.26A4 4 0 0 0 17.32 5z" />
  </Icon>
);

export const WarningIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Icon>
);

export const StarIcon = (p: IconProps) => (
  <Icon {...p} fill="currentColor">
    <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
  </Icon>
);

export const BarsIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </Icon>
);

export const TrophyIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </Icon>
);

export const FlameIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </Icon>
);

export const PlayIcon = (p: IconProps) => (
  <Icon {...p} fill="currentColor">
    <polygon points="6 3 20 12 6 21 6 3" />
  </Icon>
);

export const FlagIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 22V4" />
    <path d="M4 4h13l-2 4 2 4H4" />
  </Icon>
);

export const RetryIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </Icon>
);

export const ShareIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
  </Icon>
);

export const HomeIcon = (p: IconProps) => (
  <Icon {...p} fill="currentColor">
    <path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z" />
  </Icon>
);

export const BurstIcon = (p: IconProps) => (
  <Icon {...p} fill="currentColor" strokeWidth="1">
    <polygon points="12 1 14 8 21 5 16 11 23 12 16 13 21 19 14 16 12 23 10 16 3 19 8 13 1 12 8 11 3 5 10 8" />
  </Icon>
);
