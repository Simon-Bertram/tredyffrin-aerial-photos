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
import { LocationPhotoCard } from "@/components/location/location-photo-card";
import { LocationPhotoMetadata } from "@/components/location/location-photo-metadata";
import { useCarouselSlideState } from "@/hooks/use-carousel-slide-state";
import type { LocationPhoto } from "@/lib/locations";

export interface LocationPhotoCarouselProps {
  photos: LocationPhoto[];
  initialPhotoIndex?: number;
}

/** Prev/next stay outside `<Carousel>` so `useCarousel` context is unavailable; state comes from {@link useCarouselSlideState}. */
const carouselNavButtonClassName =
  "h-10 w-10 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40 [&_svg]:size-5!";

export function LocationPhotoCarousel({
  photos,
  initialPhotoIndex = 0,
}: LocationPhotoCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi | undefined>();
  const { canScrollPrev, canScrollNext, selectedIndex } =
    useCarouselSlideState(api);

  if (photos.length === 0) return null;

  const total = photos.length;
  const hasMultiple = total > 1;
  const initialIndex = Math.max(0, Math.min(initialPhotoIndex, total - 1));
  const currentPhoto = photos[selectedIndex] ?? photos[0];

  React.useEffect(() => {
    if (!api) return;
    api.scrollTo(initialIndex, true);
  }, [api, initialIndex]);

  return (
    <section className="space-y-4" aria-label={`Aerial photographs (${total})`}>
      <Carousel
        setApi={setApi}
        opts={{ loop: hasMultiple }}
        className="w-full"
        aria-label={`Photograph slides, ${total} ${total === 1 ? "image" : "images"}`}
      >
        <CarouselContent>
          {photos.map((photo) => (
            <CarouselItem key={photo.id}>
              <LocationPhotoCard photo={photo} layout="slideshow" />
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
            className={carouselNavButtonClassName}
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
            className={carouselNavButtonClassName}
          >
            <ChevronRight />
          </Button>
        </div>
      ) : null}

      {currentPhoto ? (
        <LocationPhotoMetadata
          variant="slideshow"
          section="details"
          photo={currentPhoto}
        />
      ) : null}
    </section>
  );
}
