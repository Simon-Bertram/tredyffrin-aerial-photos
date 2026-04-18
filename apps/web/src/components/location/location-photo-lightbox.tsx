import * as React from "react";

import type { LocationPhoto } from "@/lib/locations";

/** Conservative floor so opening on a short-caption slide still reserves
 *  enough space for the tallest metadata block in this gallery (avoids
 *  dialog re-centering when navigating). */
function estimateMetaFooterMinHeightPx(photos: LocationPhoto[]): number {
  if (photos.length === 0) return 0;

  const captionCharsPerLine = 42;
  const lineHeightPx = 21;
  const titleBlockPx = 26;
  const metaDlBlockPx = 72;
  const emptyFallbackPx = 22;
  const paddingTopPx = 12;
  const gapPx = 8;

  let setMax = 0;
  for (const p of photos) {
    let h = paddingTopPx;
    let segments = 0;
    const bump = (px: number) => {
      h += px;
      segments += 1;
    };
    if (p.title) bump(titleBlockPx);
    if (p.caption) {
      const lines = Math.max(
        1,
        Math.ceil(p.caption.length / captionCharsPerLine),
      );
      bump(lines * lineHeightPx);
    }
    if (p.photoDate || p.photographer) bump(metaDlBlockPx);
    if (
      !p.title &&
      !p.caption &&
      !p.photoDate &&
      !p.photographer
    ) {
      bump(emptyFallbackPx);
    }
    if (segments > 1) h += (segments - 1) * gapPx;
    setMax = Math.max(setMax, h);
  }
  return setMax + 10;
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

/** Matches site header / back-to-map link light blue surface. */
const carouselNavButtonClassName = cn(
  "border-outline-variant/40 bg-[color-mix(in_srgb,var(--secondary-container)_55%,var(--surface))] text-on-surface-variant",
  "hover:bg-[color-mix(in_srgb,var(--secondary-container)_70%,var(--surface))] hover:text-on-surface",
  "dark:border-outline-variant/40 dark:bg-[color-mix(in_srgb,var(--secondary-fixed)_50%,var(--surface))]",
  "dark:hover:bg-[color-mix(in_srgb,var(--secondary-fixed)_62%,var(--surface))] dark:hover:text-on-surface",
  "lg:size-11 lg:[&_svg]:!size-6",
);

const lightboxCloseButtonClassName = cn(
  "size-10 [&_svg]:!size-5",
  "lg:size-14 lg:top-3 lg:right-3 lg:rounded-xl lg:[&_svg]:!size-8",
);

const imageStageMinMaxClassName =
  "min-h-[min(65vh,calc(100dvh-14rem))] max-h-[min(65vh,calc(100dvh-14rem))]";
const imageMaxHeightClassName = "max-h-[min(65vh,calc(100dvh-14rem))]";

export interface LocationPhotoLightboxProps {
  photos: LocationPhoto[];
  open: boolean;
  initialIndex: number;
  onOpenChange: (open: boolean) => void;
}

export default function LocationPhotoLightbox({
  photos,
  open,
  initialIndex,
  onOpenChange,
}: LocationPhotoLightboxProps) {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi | null>(
    null,
  );
  const [selectedIndex, setSelectedIndex] = React.useState(initialIndex);
  const carouselHostRef = React.useRef<HTMLDivElement>(null);
  const metaFooterRef = React.useRef<HTMLDivElement>(null);
  const maxFooterSeenPxRef = React.useRef(0);

  const currentPhoto = photos[selectedIndex];

  const metaFooterHeightFloorPx = React.useMemo(
    () => estimateMetaFooterMinHeightPx(photos),
    [photos],
  );

  React.useLayoutEffect(() => {
    if (!open) {
      maxFooterSeenPxRef.current = 0;
      const el = metaFooterRef.current;
      if (el) el.style.minHeight = "";
      return;
    }
    const el = metaFooterRef.current;
    if (!el) return;
    const h = el.offsetHeight;
    maxFooterSeenPxRef.current = Math.max(
      metaFooterHeightFloorPx,
      maxFooterSeenPxRef.current,
      h,
    );
    el.style.minHeight = `${maxFooterSeenPxRef.current}px`;
  }, [open, selectedIndex, currentPhoto, metaFooterHeightFloorPx]);

  React.useEffect(() => {
    if (!open) return;
    const host = carouselHostRef.current;
    if (!host) return;
    const logLayout = () => {
      const carouselEl = host.querySelector(
        '[data-slot="carousel"]',
      ) as HTMLElement | null;
      const prevBtn = host.querySelector(
        '[data-slot="carousel-previous"]',
      ) as HTMLElement | null;
      const dialogContent = host.closest(
        '[data-slot="dialog-content"]',
      ) as HTMLElement | null;
      const hostRect = host.getBoundingClientRect();
      const carouselRect = carouselEl?.getBoundingClientRect();
      const prevRect = prevBtn?.getBoundingClientRect();
      const footerEl = metaFooterRef.current;
      const footerRect = footerEl?.getBoundingClientRect();
      const dialogRect = dialogContent?.getBoundingClientRect();
      // #region agent log
      fetch(
        "http://127.0.0.1:7782/ingest/2b0c5321-63a0-48fd-9d23-b9365f9aa9d7",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "5541dd",
          },
          body: JSON.stringify({
            sessionId: "5541dd",
            runId: "post-fix-2",
            hypothesisId: "A_B_D",
            location: "location-photo-lightbox.tsx:layout-effect",
            message: "lightbox layout on selectedIndex",
            data: {
              selectedIndex,
              hostH: Math.round(hostRect.height * 10) / 10,
              carouselH: carouselRect
                ? Math.round(carouselRect.height * 10) / 10
                : null,
              prevCenterY: prevRect
                ? Math.round((prevRect.top + prevRect.height / 2) * 10) / 10
                : null,
              footerH: footerRect
                ? Math.round(footerRect.height * 10) / 10
                : null,
              footerMinPxApplied: maxFooterSeenPxRef.current || null,
              footerFloorPx: metaFooterHeightFloorPx,
              dialogClientW: dialogContent?.clientWidth ?? null,
              dialogScrollH: dialogContent?.scrollHeight ?? null,
              dialogClientH: dialogContent?.clientHeight ?? null,
              dialogOffsetTop: dialogRect
                ? Math.round(dialogRect.top * 10) / 10
                : null,
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
    };
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(logLayout),
    );
    return () => cancelAnimationFrame(id);
   }, [open, selectedIndex, metaFooterHeightFloorPx]);

  React.useEffect(() => {
    if (!carouselApi) return;
    setSelectedIndex(carouselApi.selectedScrollSnap());
    const onSelect = () => setSelectedIndex(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  React.useEffect(() => {
    if (!open || !carouselApi) return;
    carouselApi.scrollTo(initialIndex, true);
    setSelectedIndex(initialIndex);
  }, [open, initialIndex, carouselApi]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        closeButtonClassName={lightboxCloseButtonClassName}
        className="flex max-h-[min(90vh,calc(100dvh-2rem))] w-[min(100vw-2rem,1400px)] max-w-none flex-col gap-0 overflow-y-auto overflow-x-hidden p-3 sm:max-w-none sm:p-4"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Location photos</DialogTitle>
          <DialogDescription>
            Enlarged view. Use the previous and next controls, dots, or arrow
            keys to move between photos.
          </DialogDescription>
        </DialogHeader>
        <div
          ref={carouselHostRef}
          className="relative min-h-0 flex-1 px-14 sm:px-16 lg:px-24"
        >
          <Carousel
            setApi={setCarouselApi}
            opts={{ loop: photos.length > 1 }}
            className="h-full"
          >
            <CarouselContent className="ml-0">
              {photos.map((photo) => (
                <CarouselItem key={photo.id} className="pl-0">
                  <div
                    className={cn(
                      "flex items-center justify-center",
                      imageStageMinMaxClassName,
                    )}
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      width={2400}
                      height={1800}
                      decoding="async"
                      className={cn(
                        "w-full object-contain",
                        imageMaxHeightClassName,
                      )}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {photos.length > 1 ? (
              <>
                <CarouselPrevious
                  type="button"
                  className={cn(
                    "top-1/2 left-0 z-10 -translate-y-1/2",
                    carouselNavButtonClassName,
                  )}
                />
                <CarouselNext
                  type="button"
                  className={cn(
                    "top-1/2 right-0 z-10 -translate-y-1/2",
                    carouselNavButtonClassName,
                  )}
                />
              </>
            ) : null}
          </Carousel>
        </div>

        {currentPhoto ? (
          <div
            ref={metaFooterRef}
            className="shrink-0 space-y-2 border-t border-border pt-3 text-sm"
            aria-live="polite"
            aria-atomic="true"
          >
            {currentPhoto.title ? (
              <h2 className="text-center text-base font-semibold text-card-foreground sm:text-left">
                {currentPhoto.title}
              </h2>
            ) : null}
            {currentPhoto.caption ? (
              <p className="text-center text-muted-foreground sm:text-left">
                {currentPhoto.caption}
              </p>
            ) : null}
            {currentPhoto.photoDate || currentPhoto.photographer ? (
              <dl className="grid gap-1 text-muted-foreground sm:grid-cols-[auto_1fr] sm:gap-x-4">
                {currentPhoto.photoDate ? (
                  <>
                    <dt className="font-medium text-card-foreground">Year</dt>
                    <dd>{currentPhoto.photoDate}</dd>
                  </>
                ) : null}
                {currentPhoto.photographer ? (
                  <>
                    <dt className="font-medium text-card-foreground">
                      Photographer
                    </dt>
                    <dd>{currentPhoto.photographer}</dd>
                  </>
                ) : null}
              </dl>
            ) : null}
            {!currentPhoto.title &&
            !currentPhoto.caption &&
            !currentPhoto.photoDate &&
            !currentPhoto.photographer ? (
              <p className="text-center text-muted-foreground sm:text-left">
                No title or description for this photo.
              </p>
            ) : null}
          </div>
        ) : null}

        {photos.length > 1 ? (
          <nav
            className="flex shrink-0 flex-wrap justify-center gap-4 px-1 py-3"
            aria-label="Choose a photo"
          >
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                aria-label={`Photo ${index + 1} of ${photos.length}${
                  photo.title ? `: ${photo.title}` : ""
                }`}
                aria-current={selectedIndex === index ? "true" : undefined}
                className={cn(
                  "inline-flex size-11 shrink-0 touch-manipulation items-center justify-center rounded-full",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  "transition-colors hover:bg-muted/60 active:bg-muted",
                )}
                onClick={() => carouselApi?.scrollTo(index)}
              >
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none size-2.5 rounded-full border border-border transition-colors",
                    selectedIndex === index
                      ? "bg-primary"
                      : "bg-muted hover:bg-muted-foreground/40",
                  )}
                />
              </button>
            ))}
          </nav>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
