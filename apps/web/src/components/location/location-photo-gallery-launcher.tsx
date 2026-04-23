"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { LocationPhotoCarousel } from "@/components/location/location-photo-carousel";
import { getPhotoMetadataItems, type LocationPhoto } from "@/lib/locations";

interface LocationPhotoGalleryLauncherProps {
  photos: LocationPhoto[];
}

export function LocationPhotoGalleryLauncher({
  photos,
}: LocationPhotoGalleryLauncherProps) {
  const [isCarouselOpen, setIsCarouselOpen] = React.useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState(0);

  if (photos.length === 0) return null;

  const handleOpenCarousel = (index: number) => {
    setSelectedPhotoIndex(index);
    setIsCarouselOpen(true);
  };

  const handleCloseCarousel = () => {
    setIsCarouselOpen(false);
  };

  if (isCarouselOpen) {
    return (
      <section className="space-y-4">
        <div className="flex justify-end">
          <Button
            className="bg-[color-mix(in_srgb,var(--secondary-container)_55%,var(--surface))] dark:bg-[color-mix(in_srgb,var(--secondary-fixed)_50%,var(--surface))]"
            type="button"
            variant="outline"
            onClick={handleCloseCarousel}
            aria-label="Close photo carousel"
          >
            Back to photo gallery
          </Button>
        </div>
        <LocationPhotoCarousel
          photos={photos}
          initialPhotoIndex={selectedPhotoIndex}
        />
      </section>
    );
  }

  return (
    <section
      className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
      aria-label={`Photo gallery (${photos.length})`}
    >
      {photos.map((photo, index) => (
        <button
          key={photo.id}
          type="button"
          onClick={() => handleOpenCarousel(index)}
          className="card overflow-hidden border border-border bg-card text-left shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`Open photo ${index + 1}: ${photo.title || photo.alt}`}
        >
          <figure className="aspect-4/3 bg-muted/40">
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </figure>
          <div className="card-body">
            <header className="space-y-1">
              {photo.title ? (
                <h3 className="card-title">{photo.title}</h3>
              ) : null}
              {photo.caption ? (
                <p className="text-sm text-muted-foreground">
                  <span className="italic">Caption:</span> {photo.caption}
                </p>
              ) : null}
            </header>

            <div className="space-y-1">
              {getPhotoMetadataItems(photo).map((item) => (
                <p key={item.key} className="text-sm text-muted-foreground">
                  <span className="italic">{item.label}:</span> {item.value}
                </p>
              ))}
            </div>
          </div>
        </button>
      ))}
    </section>
  );
}
