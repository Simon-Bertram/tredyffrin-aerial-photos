"use client";

import {
  Carousel_001,
  type Carousel001Image,
} from "@/components/ui/skiper-ui/skiper47";
import type { LocationRecord } from "@/lib/locations";
import { buildSelectedPhotos } from "@/lib/selected-photos-data";

/** Perspective coverflow (Skiper UI); attribution: https://skiper-ui.com/v1/skiper47 */
interface SelectedPhotosCoverflowProps {
  locations: LocationRecord[];
}

export function SelectedPhotosCoverflow({
  locations,
}: SelectedPhotosCoverflowProps) {
  const photos = buildSelectedPhotos(locations);

  if (photos.length === 0) {
    return (
      <div className="w-full">
        <p className="font-display italic text-on-surface-variant">
          The plate drawers await their first photograph.
        </p>
      </div>
    );
  }

  const images: Carousel001Image[] = photos.map((p) => ({
    src: p.src,
    alt: p.alt,
    title: p.locationName,
    year: p.photoDate,
  }));

  const handleSlideClick = (realIndex: number) => {
    const selected = photos[realIndex];
    if (!selected) return;
    const base = `/locations/${encodeURIComponent(selected.locationSlug)}`;
    const url = `${base}?photo=${encodeURIComponent(selected.photoId)}`;
    window.location.assign(url);
  };

  return (
    <div className="w-full">
      <Carousel_001
        className="max-w-none"
        images={images}
        showPagination
        showNavigation
        loop
        autoplay
        autoplayDelay={6000}
        onSlideClick={handleSlideClick}
        spaceBetween={40}
      />
    </div>
  );
}
