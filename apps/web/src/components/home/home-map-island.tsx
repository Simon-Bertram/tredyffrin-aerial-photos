"use client";

import { TredyffrinMap } from "@/components/map/tredyffrinMap";
import {
  ErrorBoundary,
  IslandErrorFallback,
} from "@/components/ui/error-boundary";
import type { MapLocationRecord } from "@/lib/locations";

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
      <TredyffrinMap locations={locations} />
    </ErrorBoundary>
  );
}
