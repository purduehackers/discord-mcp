import type { CSSProperties, ReactNode } from "react";

export interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

export interface ToolRowProps {
  children: ReactNode;
  delay?: number;
  detail?: string;
}

export interface ShellProps {
  children: ReactNode;
  step: string;
  title: string;
}

export interface MessageProps {
  name: string;
  initials: string;
  color: string;
  children: ReactNode;
  time?: string;
  bot?: boolean;
}

export interface DitherFieldProps {
  frame?: number;
}
