import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// #region agent log
fetch('http://127.0.0.1:7782/ingest/2b0c5321-63a0-48fd-9d23-b9365f9aa9d7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ee545a'},body:JSON.stringify({sessionId:'ee545a',runId:'initial',hypothesisId:'H6-H7',location:'skipper-attribution.tsx:module',message:'Module evaluated',data:{hasWindow:typeof window!=='undefined'},timestamp:Date.now()})}).catch(()=>{})
// #endregion

export function SkipperAttribution() {
  // #region agent log
  fetch('http://127.0.0.1:7782/ingest/2b0c5321-63a0-48fd-9d23-b9365f9aa9d7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ee545a'},body:JSON.stringify({sessionId:'ee545a',runId:'initial',hypothesisId:'H2-H4',location:'skipper-attribution.tsx:SkipperAttribution',message:'Skipper attribution render entry',data:{hasWindow:typeof window!=='undefined'},timestamp:Date.now()})}).catch(()=>{})
  // #endregion
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
