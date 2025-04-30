import { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "primary" | "secondary" | "tertiary" | "neutral" | "default";
  block?: boolean;
  selected?: boolean;
  showStar?: boolean;
  starColor?: string;
}