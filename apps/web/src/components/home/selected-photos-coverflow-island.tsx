"use client";

import { SelectedPhotosCoverflow } from "@/components/selected-photos-coverflow";
import {
  ErrorBoundary,
  IslandErrorFallback,
} from "@/components/ui/error-boundary";
import type { CoverflowIslandPhoto } from "@/lib/selected-photos-data";

interface SelectedPhotosCoverflowIslandProps {
  photos: CoverflowIslandPhoto[];
}

export function SelectedPhotosCoverflowIsland({
  photos,
}: SelectedPhotosCoverflowIslandProps) {
  return (
    <ErrorBoundary
      contextName="selected-photos-coverflow-island"
      fallbackRender={({ reset }) => (
        <IslandErrorFallback
          title="Selected photographs could not load."
          description="You can keep exploring the site and try loading this gallery again."
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
      <SelectedPhotosCoverflow photos={photos} />
    </ErrorBoundary>
  );
}
