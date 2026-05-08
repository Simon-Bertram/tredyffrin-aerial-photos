"use client";

interface SelectedPhotosAutoplayToggleProps {
  isAutoplayEnabled: boolean;
  onToggle: () => void;
}

export function SelectedPhotosAutoplayToggle({
  isAutoplayEnabled,
  onToggle,
}: SelectedPhotosAutoplayToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={!isAutoplayEnabled}
      aria-label={
        isAutoplayEnabled
          ? "Pause slideshow autoplay"
          : "Resume slideshow autoplay"
      }
      className="inline-flex items-center rounded-none border border-border bg-secondary-wash px-3 py-1.5 font-sans text-[11px] uppercase tracking-[0.14em] text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {isAutoplayEnabled ? "Pause slideshow" : "Resume slideshow"}
    </button>
  );
}
