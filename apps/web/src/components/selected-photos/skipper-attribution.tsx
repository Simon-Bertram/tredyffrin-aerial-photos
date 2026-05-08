"use client";

import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function SkipperAttribution() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 480px)");

    const updateScreenSize = () => {
      setIsSmallScreen(mediaQuery.matches);
    };

    updateScreenSize();
    mediaQuery.addEventListener("change", updateScreenSize);

    return () => {
      mediaQuery.removeEventListener("change", updateScreenSize);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Show slideshow attribution"
            className="inline-flex items-center justify-center rounded-sm"
          >
            <Info className="size-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side={isSmallScreen ? "bottom" : "right"}
          align="start"
          className="w-fit max-w-xs"
        >
          <p className="text-sm">
            <a
              href="https://skiper-ui.com/v1/skiper47"
              target="_blank"
              rel="noopener noreferrer"
            >
              Slideshow attribution:{" "}
              <strong>Perspective Carousel (Skiper UI)</strong>
            </a>
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
