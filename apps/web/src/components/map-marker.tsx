"use client";

import { Camera } from "lucide-react";

import { MapMarker, MarkerContent, MarkerTooltip } from "@/components/ui/map";
import type { MapVisualStyleId } from "@/components/map-types";
import type { LocationRecord } from "@/lib/locations";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface MapLocationMarkerProps {
  location: LocationRecord;
  activeTab: string;
  onActiveTabChange: (nextTab: string) => void;
  mapVisualStyle: MapVisualStyleId;
}

export function MapLocationMarker({
  location,
  activeTab,
  mapVisualStyle,
}: MapLocationMarkerProps) {
  const detailPath = `/locations/${location.slug}`;
  const hasPhotos = location.photos.length > 0;
  const firstPhoto = location.photos[0];
  const multiplePhotos = location.photos.length > 1;
  const activePhotoIndex = Number(activeTab) - 1;
  const activePhoto = location.photos[activePhotoIndex] ?? location.photos[0];
  const activePhotoDirection = activePhoto?.direction ?? "Direction unknown";
  const activePhotoDate = activePhoto?.photoDate ?? "Date unknown";

  const isOnImagery = mapVisualStyle === "terrain";

  return (
    <MapMarker
      longitude={location.coordinates.longitude}
      latitude={location.coordinates.latitude}
      onClick={() => {
        window.location.href = detailPath;
      }}
    >
      <MarkerContent>
        <button
          type="button"
          aria-label={
            multiplePhotos
              ? `View details for ${location.name}, ${location.photos.length} photos`
              : `View details for ${location.name}`
          }
          className="group relative cursor-pointer rounded-none"
        >
          {/* Gentle beacon: a soft pulse in primary ink. */}
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-none bg-primary/20"
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
            <Camera className="size-4" strokeWidth={1.75} />
          </span>
        </button>
      </MarkerContent>

      <MarkerTooltip className="w-72 p-0">
        {/* Artifact preview: stacked paper, no dividers, ambient shadow. */}
        <article
          className={cn(
            "bg-surface-container-lowest overflow-hidden",
            "ring-1 ring-inset ring-[color-mix(in_srgb,var(--outline-variant)_20%,transparent)]",
            "shadow-[0_32px_48px_color-mix(in_srgb,var(--on-surface)_6%,transparent)]",
          )}
        >
          <div className="relative h-40 bg-surface-dim">
            {multiplePhotos ? (
              <Carousel>
                <CarouselContent>
                  {location.photos.map((photo) => (
                    <CarouselItem key={photo.id}>
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            ) : hasPhotos ? (
              <img
                src={firstPhoto.src}
                alt={firstPhoto.alt}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface-container font-display italic text-on-surface-variant">
                No plate on file
              </div>
            )}

            {/* Metadata chip: navy on pale-blue, per DESIGN §5. */}
            <div
              className={cn(
                "absolute left-3 top-3 px-2 py-1",
                "bg-secondary-fixed text-on-secondary-fixed",
                "font-sans text-[10px] uppercase tracking-[0.14em]",
                "backdrop-blur-sm",
              )}
            >
              Plate {location.photos.length.toString().padStart(2, "0")}
            </div>
          </div>

          <div className="space-y-2 px-4 pt-4 pb-4">
            <p className="font-display text-[1.05rem] font-normal leading-tight text-on-surface">
              {location.name}
            </p>
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
              <span aria-hidden="true" className="opacity-60">&middot;</span>
              <span>{activePhotoDate}</span>
              {multiplePhotos && (
                <>
                  <span aria-hidden="true" className="opacity-60">&middot;</span>
                  <span className="tabular-nums">
                    {activePhotoIndex + 1}&thinsp;/&thinsp;{location.photos.length}
                  </span>
                </>
              )}
            </div>
          </div>
        </article>
      </MarkerTooltip>
    </MapMarker>
  );
}
