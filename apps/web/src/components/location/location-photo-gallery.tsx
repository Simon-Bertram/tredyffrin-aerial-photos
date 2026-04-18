import * as React from "react";

import type { LocationPhoto } from "@/lib/locations";

const LocationPhotoLightbox = React.lazy(
  () => import("@/components/location/location-photo-lightbox"),
);

export interface LocationPhotoGalleryProps {
  photos: LocationPhoto[];
}

export function LocationPhotoGallery({ photos }: LocationPhotoGalleryProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [lightboxMounted, setLightboxMounted] = React.useState(false);

  const handleOpenAt = React.useCallback((index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
    setLightboxMounted(true);
  }, []);

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2">
        {photos.map((photo, index) => (
          <article
            key={photo.id}
            className="cursor-pointer overflow-hidden rounded-lg border bg-card outline-none transition-shadow hover:ring-2 hover:ring-ring/50 focus-visible:ring-2 focus-visible:ring-ring"
            role="button"
            tabIndex={0}
            aria-label={`View larger: ${photo.title || photo.alt}`}
            onClick={() => handleOpenAt(index)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleOpenAt(index);
              }
            }}
          >
            {photo.title ? (
              <h2 className="border-b bg-muted/50 px-4 py-2 text-sm font-medium text-card-foreground">
                {photo.title}
              </h2>
            ) : null}
            <img
              src={photo.src}
              alt={photo.alt}
              width={1200}
              height={900}
              loading="lazy"
              decoding="async"
              className="h-56 w-full object-cover"
            />
            <div className="space-y-2 p-8 text-sm">
              {photo.caption ? (
                <p className="font-medium text-card-foreground">
                  {photo.caption}
                </p>
              ) : null}
              {photo.photographer ||
              photo.photoDate ||
              photo.direction ||
              photo.comments ? (
                <dl className="grid gap-1 text-muted-foreground">
                  {photo.photographer ? (
                    <div className="flex items-center gap-2">
                      <dt className="font-medium text-card-foreground">
                        Photographer:
                      </dt>
                      <dd>{photo.photographer}</dd>
                    </div>
                  ) : null}
                  {photo.photoDate ? (
                    <div className="flex items-center gap-2">
                      <dt className="font-medium text-card-foreground">
                        Year:
                      </dt>
                      <dd>{photo.photoDate}</dd>
                    </div>
                  ) : null}
                  {photo.direction ? (
                    <div className="flex items-center gap-2">
                      <dt className="font-medium text-card-foreground">
                        Direction:
                      </dt>
                      <dd>{photo.direction}</dd>
                    </div>
                  ) : null}
                  {photo.comments ? (
                    <div className="flex items-start gap-2">
                      <dt className="font-medium text-card-foreground">
                        Comments:
                      </dt>
                      <dd>{photo.comments}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : (
                <p className="text-muted-foreground">
                  No photo metadata available.
                </p>
              )}
            </div>
          </article>
        ))}
      </section>

      {lightboxMounted ? (
        <React.Suspense
          fallback={
            <div role="status" aria-live="polite" className="sr-only">
              Loading photo viewer
            </div>
          }
        >
          <LocationPhotoLightbox
            photos={photos}
            open={isOpen}
            initialIndex={activeIndex}
            onOpenChange={setIsOpen}
          />
        </React.Suspense>
      ) : null}
    </>
  );
}
