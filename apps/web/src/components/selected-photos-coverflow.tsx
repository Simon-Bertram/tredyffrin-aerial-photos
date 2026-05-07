"use client";

import {
  Carousel_001,
  type Carousel001Image,
} from "@/components/ui/skiper-ui/skiper47";
import type { CoverflowIslandPhoto } from "@/lib/selected-photos-data";

/** Perspective coverflow (Skiper UI); attribution: https://skiper-ui.com/v1/skiper47 */
interface SelectedPhotosCoverflowProps {
  photos: CoverflowIslandPhoto[];
}

export function SelectedPhotosCoverflow({
  photos,
}: SelectedPhotosCoverflowProps) {
  // #region agent log
  fetch('http://127.0.0.1:7782/ingest/2b0c5321-63a0-48fd-9d23-b9365f9aa9d7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ee545a'},body:JSON.stringify({sessionId:'ee545a',runId:'initial',hypothesisId:'H1-H5',location:'selected-photos-coverflow.tsx:SelectedPhotosCoverflow',message:'Coverflow render entry',data:{photosCount:photos.length,hasWindow:typeof window!=='undefined'},timestamp:Date.now()})}).catch(()=>{})
  // #endregion
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
