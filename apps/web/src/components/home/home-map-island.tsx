"use client";

import { lazy, Suspense } from "react";

import {
  ErrorBoundary,
  IslandErrorFallback,
} from "@/components/ui/error-boundary";
import type { MapLocationRecord } from "@/lib/locations";

const TredyffrinMap = lazy(async () => {
  const mod = await import("@/components/map/tredyffrinMap");
  return { default: mod.TredyffrinMap };
});

interface HomeMapIslandProps {
  locations: MapLocationRecord[];
}

export function HomeMapIsland({ locations }: HomeMapIslandProps) {
  return (
    <ErrorBoundary
      contextName="home-map-island"
      fallbackRender={({ reset }) => (
        <IslandErrorFallback
          title="The map could not finish loading."
          description="You can still browse the rest of the page while we keep your place."
          actionLabel="Reload map"
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
            className="flex min-h-[320px] h-[75vh] items-center justify-center"
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
        <TredyffrinMap locations={locations} />
      </Suspense>
    </ErrorBoundary>
  );
}
