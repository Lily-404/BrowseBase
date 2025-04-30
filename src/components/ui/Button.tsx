import React from "react";
import s from "./Button.module.css";
import clsx from "clsx";
import { ButtonProps } from "../../types/button";

export const ButtonLED = () => <span className={s.LED} />;

export const Button = ({
  color = "default",
  block,
  selected,
  className,
  disabled,
  children,
  showStar,
  starColor = "#575757",
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
      {showStar && (
        <div className={s.Star}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 3l2 4.5L14 9l-4.5 2L8 15l-1.5-4L2 9l4-1.5L8 3z"
              fill={starColor}
            />
          </svg>
        </div>
      )}
    </button>
  );
};