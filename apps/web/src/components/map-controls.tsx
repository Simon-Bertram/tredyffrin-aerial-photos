"use client";

import { MapStyleControls } from "@/components/map-style-controls";
import { MAP_STYLE_OPTIONS } from "@/components/map-style-config";
import type { MapVisualStyleId } from "@/components/map-types";

interface MapVisualStyleControlsProps {
  selectedStyle: MapVisualStyleId;
  onStyleChange: (nextStyle: MapVisualStyleId) => void;
}

export function MapVisualStyleControls({
  selectedStyle,
  onStyleChange,
}: MapVisualStyleControlsProps) {
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
