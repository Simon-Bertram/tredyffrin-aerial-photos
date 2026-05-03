"use client";

import { Camera } from "lucide-react";

import { MapMarker, MarkerContent, MarkerTooltip } from "@/components/ui/map";
import type { MapVisualStyleId } from "@/components/map/map-types";
import type { LocationRecord } from "@/lib/locations";
import { cn } from "@/lib/utils";
import { LocationMarkerTooltipCard } from "@/components/map/location-marker-tooltip-card";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface MapLocationMarkerProps {
  location: LocationRecord;
  mapVisualStyle: MapVisualStyleId;
}

export function MapLocationMarker({
  location,
  mapVisualStyle,
}: MapLocationMarkerProps) {
  const detailPath = `/locations/${location.slug}`;
  const multiplePhotos = location.photos.length > 1;

  const isOnImagery = mapVisualStyle === "terrain";

  const markerLinkLabel = multiplePhotos
    ? `View details for ${location.name}, ${location.photos.length} photos`
    : `View details for ${location.name}`;

  const handleNavigateToLocation = (path: string) => {
    if (typeof window === "undefined") return;
    window.location.assign(path);
  };

  return (
    <MapMarker
      longitude={location.coordinates.longitude}
      latitude={location.coordinates.latitude}
      onClick={(e) => {
        e.stopPropagation();
        handleNavigateToLocation(detailPath);
      }}
    >
      <MarkerContent>
        <button
          type="button"
          aria-label={markerLinkLabel}
          className={cn(
            "group relative cursor-pointer rounded-none outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "focus-visible:ring-offset-background",
          )}
        >
          {/* Gentle beacon: a soft pulse in primary ink. */}
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 animate-ping motion-reduce:animate-none",
              "rounded-none bg-primary/20",
            )}
          />
          {/* The pin: a clipped, burgundy plate of ink. */}
          <span
            className={cn(
              "relative flex size-8 items-center justify-center rounded-none",
              "bg-primary text-primary-foreground",
              "shadow-[0_8px_20px_color-mix(in_srgb,var(--primary)_35%,transparent)]",
              "ring-1 ring-inset ring-[color-mix(in_srgb,white_18%,transparent)]",
              "transition-transform duration-200 group-hover:scale-[1.08]",
            )}
          >
            {multiplePhotos && (
              <span
                aria-hidden
                className={cn(
                  "absolute -right-2 -top-2 z-10 flex min-h-4 min-w-4",
                  "items-center justify-center rounded-none px-1 py-px",
                  "bg-surface text-primary font-display italic",
                  "text-[10px] leading-none tabular-nums",
                  "ring-1 ring-primary/50",
                  "shadow-[0_2px_6px_color-mix(in_srgb,var(--on-surface)_15%,transparent)]",
                )}
              >
                {location.photos.length}
              </span>
            )}
            <Camera className="size-4" strokeWidth={1.75} aria-hidden />
          </span>
        </button>
      </MarkerContent>

      <MarkerTooltip className="w-108 p-0">
        <ErrorBoundary
          fallback={
            <article className="bg-surface-container-lowest p-4">
              <h3 className="font-display text-[1.05rem] leading-tight text-on-surface">
                {location.name}
              </h3>
              <a
                href={detailPath}
                className={cn(
                  "mt-3 inline-flex text-xs underline",
                  "text-on-surface-variant hover:text-on-surface",
                )}
              >
                View details
              </a>
            </article>
          }
        >
          <LocationMarkerTooltipCard
            location={location}
            detailPath={detailPath}
            isOnImagery={isOnImagery}
            onNavigate={handleNavigateToLocation}
          />
        </ErrorBoundary>
      </MarkerTooltip>
    </MapMarker>
  );
}
