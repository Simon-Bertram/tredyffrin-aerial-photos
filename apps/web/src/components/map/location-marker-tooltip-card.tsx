"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";

import type { LocationRecord } from "@/lib/locations";
import { cn } from "@/lib/utils";

interface LocationMarkerTooltipCardProps {
  location: LocationRecord;
  detailPath: string;
  isOnImagery: boolean;
  activePhotoIndex?: number;
  onNavigate?: (path: string) => void;
}

export function LocationMarkerTooltipCard({
  location,
  detailPath,
  isOnImagery,
  activePhotoIndex = 0,
  onNavigate,
}: LocationMarkerTooltipCardProps) {
  const hasPhotos = location.photos.length > 0;
  const multiplePhotos = location.photos.length > 1;

  const maxPhotoIndex = Math.max(location.photos.length - 1, 0);
  const initialPhotoIndex = Math.min(
    Math.max(activePhotoIndex, 0),
    maxPhotoIndex,
  );
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(initialPhotoIndex);

  useEffect(() => {
    setCurrentPhotoIndex(initialPhotoIndex);
  }, [initialPhotoIndex]);

  const navigateToDetail = () => {
    if (onNavigate) {
      onNavigate(detailPath);
      return;
    }

    if (typeof window !== "undefined") {
      window.location.assign(detailPath);
    }
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    navigateToDetail();
  };

  const goToNextPhoto = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev + 1) % location.photos.length);
  };

  const goToPrevPhoto = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentPhotoIndex(
      (prev) => (prev - 1 + location.photos.length) % location.photos.length,
    );
  };

  const activePhoto =
    location.photos[currentPhotoIndex] ?? location.photos[0];
  const activePhotoDirection = activePhoto?.direction ?? "Direction unknown";
  const activePhotoDate = activePhoto?.photoDate ?? "Date unknown";
  return (
    <article
      role="link"
      tabIndex={0}
      onClick={navigateToDetail}
      onKeyDown={handleCardKeyDown}
      aria-label={`Open details for ${location.name}`}
      data-testid="location-preview-card"
      className={cn(
        "bg-surface-container-lowest overflow-hidden cursor-pointer",
        "ring-1 ring-inset ring-[color-mix(in_srgb,var(--outline-variant)_20%,transparent)]",
        "shadow-[0_32px_48px_color-mix(in_srgb,var(--on-surface)_6%,transparent)]",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background outline-none",
      )}
    >
      <div className="relative h-60 bg-surface-dim">
        {multiplePhotos ? (
          <>
            <img
              src={activePhoto?.src}
              alt={activePhoto?.alt ?? `Preview image for ${location.name}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <button
              type="button"
              aria-label="Previous photo"
              data-testid="slider-prev-button"
              onClick={goToPrevPhoto}
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 rounded-none p-1.5",
                "bg-on-surface/75 text-surface",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "focus-visible:ring-offset-background outline-none",
              )}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              data-testid="slider-next-button"
              onClick={goToNextPhoto}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 rounded-none p-1.5",
                "bg-on-surface/75 text-surface",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "focus-visible:ring-offset-background outline-none",
              )}
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </>
        ) : hasPhotos ? (
          <img
            src={location.photos[0].src}
            alt={location.photos[0].alt}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-container font-display italic text-on-surface-variant">
            No plate on file
          </div>
        )}

      </div>

      <div className="space-y-2 px-4 pt-4 pb-4">
        <h3 className="font-display text-[1.05rem] font-normal leading-tight text-on-surface">
          {location.name}
        </h3>
        <p className="text-xs leading-relaxed text-on-surface-variant">
          {location.shortDescription}
        </p>

        <div
          className={cn(
            "mt-3 flex items-center gap-2 font-sans text-[11px] tracking-[0.02em]",
            isOnImagery
              ? cn(
                  "bg-on-surface/88 text-surface",
                  "px-2 py-1.5 backdrop-blur-md",
                  "shadow-[0_6px_18px_color-mix(in_srgb,var(--on-surface)_30%,transparent)]",
                )
              : "text-on-surface-variant",
          )}
        >
          <Camera className="size-3.5 shrink-0" strokeWidth={1.75} />
          <span>{activePhotoDirection}</span>
          <span aria-hidden="true" className="opacity-60">
            &middot;
          </span>
          <span>{activePhotoDate}</span>
          {multiplePhotos && (
            <>
              <span aria-hidden="true" className="opacity-60">
                &middot;
              </span>
              <span className="tabular-nums">
                {currentPhotoIndex + 1}&thinsp;/&thinsp;
                {location.photos.length}
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
