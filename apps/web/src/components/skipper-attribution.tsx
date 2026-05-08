import { Info } from "lucide-react";
import { useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SkipperAttribution() {
  const isServer = typeof window === "undefined";

  // #region agent log
  fetch("http://127.0.0.1:7782/ingest/2b0c5321-63a0-48fd-9d23-b9365f9aa9d7", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "994dba",
    },
    body: JSON.stringify({
      sessionId: "994dba",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "skipper-attribution.tsx:12",
      message: "SkipperAttribution render environment",
      data: { isServer },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7782/ingest/2b0c5321-63a0-48fd-9d23-b9365f9aa9d7", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "994dba",
      },
      body: JSON.stringify({
        sessionId: "994dba",
        runId: "pre-fix",
        hypothesisId: "H2",
        location: "skipper-attribution.tsx:30",
        message: "SkipperAttribution mounted on client",
        data: { hasWindow: typeof window !== "undefined" },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Show slideshow attribution"
              className="inline-flex items-center justify-center rounded-sm"
            >
              <Info className="size-5" />
            </button>
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
