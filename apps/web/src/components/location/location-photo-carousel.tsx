"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { LocationPhoto } from "@/lib/locations";

export interface LocationPhotoCarouselProps {
  photos: LocationPhoto[];
}

export function LocationPhotoCarousel({ photos }: LocationPhotoCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi | undefined>();
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    const sync = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setSelectedIndex(api.selectedScrollSnap());
    };
    sync();
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  if (photos.length === 0) return null;

  const total = photos.length;
  const hasMultiple = total > 1;
  const currentPhoto = photos[selectedIndex] ?? photos[0];

  return (
    <section
      className="space-y-4"
      aria-label={`Aerial photographs (${total})`}
    >
      <Carousel
        setApi={setApi}
        opts={{ loop: hasMultiple }}
        className="w-full"
      >
        <CarouselContent>
          {photos.map((photo) => (
            <CarouselItem key={photo.id}>
              <figure className="overflow-hidden rounded-lg border bg-card">
                {photo.title ? (
                  <figcaption className="border-b bg-muted/50 px-4 py-2 text-sm font-medium text-card-foreground">
                    {photo.title}
                  </figcaption>
                ) : null}
                <div className="flex max-h-[70vh] items-center justify-center bg-muted/40">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    width={2400}
                    height={1800}
                    loading="lazy"
                    decoding="async"
                    className="max-h-[70vh] w-full object-contain"
                  />
                </div>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {hasMultiple ? (
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => api?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label="Previous photo"
            className="h-10 w-10 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40 [&_svg]:size-5!"
          >
            <ChevronLeft />
          </Button>
          <p
            className="min-w-12 text-center text-sm tabular-nums text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {selectedIndex + 1} / {total}
          </p>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => api?.scrollNext()}
            disabled={!canScrollNext}
            aria-label="Next photo"
            className="h-10 w-10 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40 [&_svg]:size-5!"
          >
            <ChevronRight />
          </Button>
        </div>
      ) : null}

      {currentPhoto ? (
        <div
          aria-live="polite"
          aria-atomic="true"
          className="space-y-2 text-sm"
        >
          {currentPhoto.caption ? (
            <p className="text-card-foreground">{currentPhoto.caption}</p>
          ) : null}
          {currentPhoto.photographer ||
          currentPhoto.photoDate ||
          currentPhoto.direction ||
          currentPhoto.comments ? (
            <dl className="grid gap-1 text-muted-foreground sm:grid-cols-[auto_1fr] sm:gap-x-4">
              {currentPhoto.photographer ? (
                <>
                  <dt className="font-medium text-card-foreground">
                    Photographer
                  </dt>
                  <dd>{currentPhoto.photographer}</dd>
                </>
              ) : null}
              {currentPhoto.photoDate ? (
                <>
                  <dt className="font-medium text-card-foreground">Year</dt>
                  <dd>{currentPhoto.photoDate}</dd>
                </>
              ) : null}
              {currentPhoto.direction ? (
                <>
                  <dt className="font-medium text-card-foreground">
                    Direction
                  </dt>
                  <dd>{currentPhoto.direction}</dd>
                </>
              ) : null}
              {currentPhoto.comments ? (
                <>
                  <dt className="font-medium text-card-foreground">
                    Comments
                  </dt>
                  <dd>{currentPhoto.comments}</dd>
                </>
              ) : null}
            </dl>
          ) : !currentPhoto.caption ? (
            <p className="text-muted-foreground">
              No photo metadata available.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export default LocationPhotoCarousel;
