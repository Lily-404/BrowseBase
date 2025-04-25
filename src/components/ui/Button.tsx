import React from "react";
import s from "./Button.module.css";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "primary" | "secondary" | "tertiary" | "neutral" | "default";
  block?: boolean;
  selected?: boolean;
}

export const ButtonLED = () => <span className={s.LED} />;

export const Button = ({
  color = "default",
  block,
  selected,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(s.Button, className)}
      data-block={block}
      data-color={color}
      data-selected={selected ? "true" : undefined}
      data-disabled={disabled}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};