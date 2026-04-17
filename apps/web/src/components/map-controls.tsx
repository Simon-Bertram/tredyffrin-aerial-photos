"use client";

import { MapStyleControls } from "@/components/map-style-controls";
import { MAP_STYLE_OPTIONS } from "@/components/map-style-config";
import type { MapVisualStyleId } from "@/components/map-types";

interface MapControlsProps {
  selectedStyle: MapVisualStyleId;
  onStyleChange: (nextStyle: MapVisualStyleId) => void;
}

export function MapControls({
  selectedStyle,
  onStyleChange,
}: MapControlsProps) {
  return (
    <>
      <MapStyleControls
        options={MAP_STYLE_OPTIONS}
        selectedStyle={selectedStyle}
        onStyleChange={onStyleChange}
      />
    </>
  );
}
