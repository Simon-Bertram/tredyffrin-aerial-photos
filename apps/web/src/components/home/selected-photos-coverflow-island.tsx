"use client";

import { lazy, Suspense } from "react";
import {
  ErrorBoundary,
  IslandErrorFallback,
} from "@/components/ui/error-boundary";
import type { CoverflowIslandPhoto } from "@/lib/selected-photos-data";

const SelectedPhotosCoverflow = lazy(async () => {
  const mod = await import("@/components/selected-photos/selected-photos-coverflow");
  return { default: mod.SelectedPhotosCoverflow };
});

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
      <Suspense
        fallback={
          <div
            className="flex min-h-[min(360px,55vh)] items-center justify-center"
            aria-hidden
          >
            <div className="flex gap-1">
              <span className="bg-muted-foreground/60 size-1.5 animate-pulse rounded-full" />
              <span className="bg-muted-foreground/60 size-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
              <span className="bg-muted-foreground/60 size-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
            </div>
          </div>
        }
      >
        <SelectedPhotosCoverflow photos={photos} />
      </Suspense>
    </ErrorBoundary>
  );
}
