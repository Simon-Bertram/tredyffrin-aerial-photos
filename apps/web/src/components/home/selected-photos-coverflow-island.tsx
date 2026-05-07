"use client";

import { useEffect } from "react";
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
  // #region agent log
  fetch('http://127.0.0.1:7782/ingest/2b0c5321-63a0-48fd-9d23-b9365f9aa9d7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ee545a'},body:JSON.stringify({sessionId:'ee545a',runId:'initial',hypothesisId:'H1-H3',location:'selected-photos-coverflow-island.tsx:SelectedPhotosCoverflowIsland',message:'Island render entry',data:{photosCount:photos.length,hasWindow:typeof window!=='undefined'},timestamp:Date.now()})}).catch(()=>{})
  // #endregion
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7782/ingest/2b0c5321-63a0-48fd-9d23-b9365f9aa9d7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ee545a'},body:JSON.stringify({sessionId:'ee545a',runId:'initial',hypothesisId:'H6-H7',location:'selected-photos-coverflow-island.tsx:useEffect',message:'Attaching global import error listeners',data:{hasWindow:typeof window!=='undefined'},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
    const onError = (event: ErrorEvent) => {
      // #region agent log
      fetch('http://127.0.0.1:7782/ingest/2b0c5321-63a0-48fd-9d23-b9365f9aa9d7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ee545a'},body:JSON.stringify({sessionId:'ee545a',runId:'initial',hypothesisId:'H6-H8',location:'selected-photos-coverflow-island.tsx:window.onerror',message:'Global error event',data:{message:event.message,filename:event.filename,lineno:event.lineno,colno:event.colno},timestamp:Date.now()})}).catch(()=>{})
      // #endregion
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason =
        typeof event.reason === "string"
          ? event.reason
          : (event.reason?.message ?? String(event.reason));
      // #region agent log
      fetch('http://127.0.0.1:7782/ingest/2b0c5321-63a0-48fd-9d23-b9365f9aa9d7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ee545a'},body:JSON.stringify({sessionId:'ee545a',runId:'initial',hypothesisId:'H6-H8',location:'selected-photos-coverflow-island.tsx:window.unhandledrejection',message:'Global unhandled rejection',data:{reason},timestamp:Date.now()})}).catch(()=>{})
      // #endregion
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

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
