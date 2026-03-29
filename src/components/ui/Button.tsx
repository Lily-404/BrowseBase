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
        <div className={s.Star} style={{ color: starColor }}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.5248 3.15838C10.5656 2.4022 11.1831 1.75 12 1.75C12.8169 1.75 13.4344 2.4022 13.4752 3.15836C13.6966 7.25635 16.727 10.2914 20.8187 10.5134C21.5854 10.555 22.25 11.1807 22.25 12.0119C22.25 12.8463 21.5806 13.4727 20.8113 13.5108C16.7255 13.7132 13.6966 16.7437 13.4752 20.8416C13.4344 21.5978 12.8169 22.25 12 22.25C11.1831 22.25 10.5656 21.5978 10.5248 20.8416C10.3034 16.7434 7.2739 13.7126 3.18751 13.5107C2.41877 13.4728 1.75 12.8469 1.75 12.0132C1.75 11.1794 2.41879 10.5537 3.18717 10.5155C7.27028 10.3124 10.3032 7.26175 10.5248 3.15838ZM12.0004 6.01235C11.0373 8.86655 8.848 11.0618 5.99104 12.0117C8.84653 12.9562 11.0364 15.1398 12 17.9892C12.9654 15.1345 15.1615 12.9482 18.0247 12.0066C15.1626 11.0555 12.9661 8.86773 12.0004 6.01235Z"
            />
          </svg>
        </div>
      )}
    </button>
  );
};