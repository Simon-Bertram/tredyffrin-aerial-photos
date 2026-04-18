import * as React from "react"

import type { LocationPhoto } from "@/lib/locations"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

export interface LocationPhotoLightboxProps {
  photos: LocationPhoto[]
  open: boolean
  initialIndex: number
  onOpenChange: (open: boolean) => void
}

export default function LocationPhotoLightbox({
  photos,
  open,
  initialIndex,
  onOpenChange,
}: LocationPhotoLightboxProps) {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi | null>(
    null
  )

  React.useEffect(() => {
    if (!open || !carouselApi) return
    carouselApi.scrollTo(initialIndex, true)
  }, [open, initialIndex, carouselApi])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(90vh,calc(100dvh-2rem))] w-[min(100vw-2rem,1200px)] max-w-none sm:max-w-none flex-col gap-3 overflow-hidden p-3 sm:p-4"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Location photos</DialogTitle>
          <DialogDescription>
            Enlarged view. Use the previous and next controls or arrow keys to
            move between photos.
          </DialogDescription>
        </DialogHeader>
        <div className="relative min-h-0 flex-1 px-10">
          <Carousel
            setApi={setCarouselApi}
            opts={{ loop: photos.length > 1 }}
            className="h-full"
          >
            <CarouselContent className="ml-0">
              {photos.map((photo) => (
                <CarouselItem key={photo.id} className="pl-0">
                  <div className="flex max-h-[min(80vh,calc(100dvh-8rem))] items-center justify-center">
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      width={2400}
                      height={1800}
                      decoding="async"
                      className="max-h-[min(80vh,calc(100dvh-8rem))] w-full object-contain"
                    />
                  </div>
                  {photo.caption ? (
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      {photo.caption}
                    </p>
                  ) : null}
                </CarouselItem>
              ))}
            </CarouselContent>
            {photos.length > 1 ? (
              <>
                <CarouselPrevious
                  type="button"
                  className="top-1/2 left-0 z-10 -translate-y-1/2"
                />
                <CarouselNext
                  type="button"
                  className="top-1/2 right-0 z-10 -translate-y-1/2"
                />
              </>
            ) : null}
          </Carousel>
        </div>
      </DialogContent>
    </Dialog>
  )
}
