"use client";

import { LocationPhotoGalleryLauncher } from "@/components/location/location-photo-gallery-launcher";
import {
  ErrorBoundary,
  IslandErrorFallback,
} from "@/components/ui/error-boundary";
import type { LocationPhoto } from "@/lib/locations";

interface LocationPhotoGalleryLauncherIslandProps {
  photos: LocationPhoto[];
  initialPhotoId?: string | null;
}

export function LocationPhotoGalleryLauncherIsland({
  photos,
  initialPhotoId,
}: LocationPhotoGalleryLauncherIslandProps) {
  return (
    <ErrorBoundary
      contextName="location-photo-gallery-launcher-island"
      fallbackRender={({ reset }) => (
        <IslandErrorFallback
          title="The photo gallery could not load."
          description="Location details are still available. You can try loading the gallery again."
          actionLabel="Reload gallery"
          onAction={() => {
            reset();
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
        />
      )}
    >
      <LocationPhotoGalleryLauncher
        photos={photos}
        initialPhotoId={initialPhotoId}
      />
    </ErrorBoundary>
  );
}
