"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Carousel_001,
  type Carousel001Image,
} from "@/components/ui/skiper-ui/skiper47";
import type { CoverflowIslandPhoto } from "@/lib/selected-photos-data";
import { isSelectedPhotoCollectionValue } from "@/lib/selected-photo-collections";

import { SelectedPhotosAutoplayToggle } from "./selected-photos-autoplay-toggle";

/** Perspective coverflow (Skiper UI); attribution: https://skiper-ui.com/v1/skiper47 */
interface SelectedPhotosCoverflowProps {
  photos: CoverflowIslandPhoto[];
}

export function SelectedPhotosCoverflow({
  photos,
}: SelectedPhotosCoverflowProps) {
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(true);
  const [isUiEnhanced, setIsUiEnhanced] = useState(false);
  // Mirror the server-rendered collection select so this island can react to filtering.
  const [activeCollection, setActiveCollection] = useState("");

  useEffect(() => {
    // Enable enhanced controls after first paint to keep initial SSR/CSR output aligned.
    const rafId = window.requestAnimationFrame(() => {
      setIsUiEnhanced(true);
    });
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    // The collection picker lives outside this React island, so we subscribe imperatively.
    const select = document.getElementById("photo-collection");
    if (!(select instanceof HTMLSelectElement)) {
      return;
    }

    const applyCollectionValue = (value: string) => {
      if (!value) {
        setActiveCollection("");
        return;
      }
      if (!isSelectedPhotoCollectionValue(value)) {
        setActiveCollection("");
        return;
      }
      setActiveCollection(value);
    };

    applyCollectionValue(select.value);

    const handleChange = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) return;
      applyCollectionValue(target.value);
    };

    select.addEventListener("change", handleChange);
    return () => {
      select.removeEventListener("change", handleChange);
    };
  }, []);

  const visiblePhotos = useMemo(() => {
    // With no explicit collection selected, show the curated default set.
    if (!activeCollection) {
      return photos.filter((photo) => photo.inDefaultSet !== false);
    }
    return photos.filter((photo) => photo.selectedCollection === activeCollection);
  }, [activeCollection, photos]);

  const images: Carousel001Image[] = useMemo(
    () =>
      visiblePhotos.map((p) => ({
        src: p.src,
        alt: p.alt,
        title: p.locationName,
        year: p.photoDate,
      })),
    [visiblePhotos],
  );

  if (visiblePhotos.length === 0) {
    return (
      <div className="w-full">
        <p className="font-display italic text-on-surface-variant">
          The plate drawers await their first photograph.
        </p>
      </div>
    );
  }

  const handleSlideClick = (realIndex: number) => {
    const selected = visiblePhotos[realIndex];
    if (!selected) return;
    const base = `/locations/${encodeURIComponent(selected.locationSlug)}`;
    const url = `${base}?photo=${encodeURIComponent(selected.photoId)}`;
    window.location.assign(url);
  };

  return (
    <div className="w-full">
      <Carousel_001
        // Reset carousel position when the active collection changes.
        key={activeCollection || "all"}
        className="max-w-none"
        images={images}
        showPagination={isUiEnhanced}
        showNavigation={isUiEnhanced}
        loop
        autoplay={isAutoplayEnabled}
        autoplayDelay={6000}
        onSlideClick={handleSlideClick}
        spaceBetween={40}
      />
      <div className="my-4 text-sm flex justify-center">
        <SelectedPhotosAutoplayToggle
          isAutoplayEnabled={isAutoplayEnabled}
          onToggle={() => setIsAutoplayEnabled((prev) => !prev)}
        />
      </div>
    </div>
  );
}
