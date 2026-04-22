"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { LocationPhotoCarousel } from "@/components/location/location-photo-carousel";
import type { LocationPhoto } from "@/lib/locations";

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
      className="grid gap-8 grid-cols-2"
      aria-label={`Photo gallery (${photos.length})`}
    >
      {photos.map((photo, index) => (
        <button
          key={photo.id}
          type="button"
          onClick={() => handleOpenCarousel(index)}
          className="card overflow-hidden border bg-card text-left shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          <div className="card-body gap-2 p-4">
            <header>
              {photo.title ? (
                <h3 className="text-lg font-medium text-card-foreground">
                  {photo.title}
                </h3>
              ) : null}
              {photo.caption ? (
                <p className="text-sm text-muted-foreground">
                  Caption: {photo.caption}
                </p>
              ) : null}
            </header>

            <div className="space-y-1">
              {photo.photographer ? (
                <p className="text-sm text-muted-foreground">
                  Photographer: {photo.photographer}
                </p>
              ) : null}
              {photo.photoDate ? (
                <p className="text-sm text-muted-foreground">
                  Year: {photo.photoDate}
                </p>
              ) : null}
              {photo.direction ? (
                <p className="text-sm text-muted-foreground">
                  Direction: {photo.direction}
                </p>
              ) : null}
              {photo.references ? (
                <p className="text-sm text-muted-foreground">
                  References: {photo.references}
                </p>
              ) : null}
              {photo.comments ? (
                <p className="text-sm text-muted-foreground">
                  Comments: {photo.comments}
                </p>
              ) : null}
            </div>
          </div>
        </button>
      ))}
    </section>
  );
}
