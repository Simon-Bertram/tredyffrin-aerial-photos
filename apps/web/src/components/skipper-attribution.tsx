import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SkipperAttribution() {
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Info className="size-5" />
          </TooltipTrigger>
          <TooltipContent side="right">
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
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
