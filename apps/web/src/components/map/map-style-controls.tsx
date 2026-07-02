"use client";

import { RotateCcw } from "lucide-react";
import { useCallback } from "react";

import { cn } from "@/lib/utils";

import type { MapStyleControlProps } from "@/components/map/map-types";
import { useMap } from "@/components/ui/map";

const positionClasses = {
  "top-left": "top-2 left-2 sm:top-3 sm:left-3",
  "top-right": "top-2 right-2 sm:top-3 sm:right-3",
  "bottom-left": "bottom-2 left-2 sm:bottom-3 sm:left-3",
  "bottom-right": "bottom-10 right-2 sm:bottom-12 sm:right-3",
};

function MapStyleControls({
  options,
  selectedStyle,
  onStyleChange,
  onResetView,
  className,
  position = "top-right",
}: MapStyleControlProps) {
  const { map } = useMap();

  const handleResetView = useCallback(() => {
    onResetView?.();
    map?.easeTo({ pitch: 0, bearing: 0, duration: 500 });
  }, [map, onResetView]);

  return (
    <div
      className={cn(
        "absolute z-20 flex items-center gap-1 p-1 sm:gap-1.5 sm:p-1.5",
        "bg-surface/80 backdrop-blur-xl",
        "ring-1 ring-inset ring-[color-mix(in_srgb,var(--outline-variant)_20%,transparent)]",
        "shadow-[0_18px_36px_color-mix(in_srgb,var(--on-surface)_6%,transparent)]",
        positionClasses[position],
        className,
      )}
    >
      {options.map((option) => {
        const isActive = selectedStyle === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onStyleChange(option.id)}
            className={cn(
              "px-2 py-1 text-[10px] font-sans font-semibold uppercase tracking-[0.14em] sm:px-2.5 sm:text-[11px]",
              "transition-colors duration-150",
              isActive
                ? "bg-primary text-primary-foreground"
                : cn(
                    "text-on-surface-variant",
                    "hover:bg-surface-container hover:text-on-surface",
                  ),
            )}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
      <span
        aria-hidden
        className="mx-0.5 h-4 w-px bg-[color-mix(in_srgb,var(--outline-variant)_35%,transparent)]"
      />
      <button
        type="button"
        onClick={handleResetView}
        className={cn(
          "p-1 transition-colors duration-150 sm:p-1.5",
          "text-on-surface-variant",
          "hover:bg-surface-container hover:text-on-surface",
        )}
        aria-label="Reset map view"
      >
        <RotateCcw className="size-3 sm:size-3.5" strokeWidth={1.75} />
      </button>
    </div>
  );
}

export { MapStyleControls };
