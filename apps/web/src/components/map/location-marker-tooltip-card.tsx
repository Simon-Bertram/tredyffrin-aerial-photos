"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";

import type { MapLocationRecord } from "@/lib/locations";
import { cn } from "@/lib/utils";

interface LocationMarkerTooltipCardProps {
  location: MapLocationRecord;
  detailPath: string;
  isOnImagery: boolean;
  onNavigate?: (path: string) => void;
}

export function LocationMarkerTooltipCard({
  location,
  detailPath,
  isOnImagery,
  onNavigate,
}: LocationMarkerTooltipCardProps) {
  const hasPhotos = location.photos.length > 0;
  const multiplePhotos = location.photos.length > 1;

  const maxPhotoIndex = Math.max(location.photos.length - 1, 0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    setCurrentPhotoIndex((prev) => Math.min(prev, maxPhotoIndex));
  }, [maxPhotoIndex]);

  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigate) {
      return;
    }

    event.preventDefault();
    onNavigate(detailPath);
  };

  const goToNextPhoto = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (location.photos.length === 0) {
      return;
    }
    setCurrentPhotoIndex((prev) => (prev + 1) % location.photos.length);
  };

  const goToPrevPhoto = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (location.photos.length === 0) {
      return;
    }
    setCurrentPhotoIndex(
      (prev) => (prev - 1 + location.photos.length) % location.photos.length,
    );
  };

  const activePhoto =
    location.photos[currentPhotoIndex] ?? location.photos[0];
  const activePreviewSrc =
    activePhoto?.previewSrc ?? activePhoto?.src;
  const activePhotoDirection = activePhoto?.direction ?? "Direction unknown";
  const activePhotoDate = activePhoto?.photoDate ?? "Date unknown";
  return (
    <article
      data-testid="location-preview-card"
      className={cn(
        "bg-surface-container-lowest relative overflow-hidden",
        "ring-1 ring-inset ring-[color-mix(in_srgb,var(--outline-variant)_20%,transparent)]",
        "shadow-[0_32px_48px_color-mix(in_srgb,var(--on-surface)_6%,transparent)]",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        "focus-within:ring-offset-background",
      )}
    >
      <a
        href={detailPath}
        onClick={handleLinkClick}
        aria-label={`Open details for ${location.name}`}
        className="absolute inset-0 z-10 outline-none"
      >
        <span className="sr-only">Open details for {location.name}</span>
      </a>

      <div className="relative h-52 bg-surface-dim sm:h-60">
        {multiplePhotos ? (
          <>
            <img
              src={activePreviewSrc}
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
                "absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-none p-1.5",
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
                "absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-none p-1.5",
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
            src={
              location.photos[0].previewSrc ?? location.photos[0].src
            }
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
            "mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-[10px] tracking-[0.02em] sm:text-[11px]",
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
