'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	type CarouselApi,
} from '@/components/ui/carousel'
import { useCarouselSlideState } from '@/hooks/use-carousel-slide-state'
import type { LocationPhoto } from '@/lib/locations'

export interface LocationPhotoCarouselProps {
	photos: LocationPhoto[]
}

/** Non-empty metadata rows for definition list (label + value). */
interface MetadataRow {
	label: string
	value: string
}

function getMetadataRows(photo: LocationPhoto): MetadataRow[] {
	const rows: MetadataRow[] = []
	if (photo.photographer) {
		rows.push({ label: 'Photographer', value: photo.photographer })
	}
	if (photo.photoDate) {
		rows.push({ label: 'Year', value: photo.photoDate })
	}
	if (photo.direction) {
		rows.push({ label: 'Direction', value: photo.direction })
	}
	if (photo.comments) {
		rows.push({ label: 'Comments', value: photo.comments })
	}
	return rows
}

function PhotoCarouselSlide({ photo }: { photo: LocationPhoto }) {
	return (
		<figure className="overflow-hidden rounded-lg border bg-card">
			{photo.title ? (
				<figcaption className="border-b bg-muted/50 px-4 py-2 text-sm font-medium text-card-foreground">
					{photo.title}
				</figcaption>
			) : null}
			<div className="flex max-h-[70vh] items-center justify-center bg-muted/40">
				<img
					src={photo.src}
					alt={photo.alt}
					width={2400}
					height={1800}
					loading="lazy"
					decoding="async"
					className="max-h-[70vh] w-full object-contain"
				/>
			</div>
		</figure>
	)
}

function PhotoCarouselMetadata({ photo }: { photo: LocationPhoto }) {
	const rows = getMetadataRows(photo)

	return (
		<div
			aria-live="polite"
			aria-atomic="true"
			className="space-y-2 text-sm"
		>
			{photo.caption ? (
				<p className="text-card-foreground">{photo.caption}</p>
			) : null}
			{rows.length > 0 ? (
				<dl className="grid gap-1 text-muted-foreground sm:grid-cols-[auto_1fr] sm:gap-x-4">
					{rows.map((row) => (
						<React.Fragment key={row.label}>
							<dt className="font-medium text-card-foreground">
								{row.label}
							</dt>
							<dd>{row.value}</dd>
						</React.Fragment>
					))}
				</dl>
			) : !photo.caption ? (
				<p className="text-muted-foreground">
					No photo metadata available.
				</p>
			) : null}
		</div>
	)
}

/** Prev/next stay outside `<Carousel>` so `useCarousel` context is unavailable; state comes from {@link useCarouselSlideState}. */
const carouselNavButtonClassName =
	'h-10 w-10 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40 [&_svg]:size-5!'

export function LocationPhotoCarousel({ photos }: LocationPhotoCarouselProps) {
	const [api, setApi] = React.useState<CarouselApi | undefined>()
	const { canScrollPrev, canScrollNext, selectedIndex } =
		useCarouselSlideState(api)

	if (photos.length === 0) return null

	const total = photos.length
	const hasMultiple = total > 1
	const currentPhoto = photos[selectedIndex] ?? photos[0]

	return (
		<section
			className="space-y-4"
			aria-label={`Aerial photographs (${total})`}
		>
			<Carousel
				setApi={setApi}
				opts={{ loop: hasMultiple }}
				className="w-full"
			>
				<CarouselContent>
					{photos.map((photo) => (
						<CarouselItem key={photo.id}>
							<PhotoCarouselSlide photo={photo} />
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>

			{hasMultiple ? (
				<div className="flex items-center justify-center gap-3">
					<Button
						type="button"
						variant="outline"
						size="icon"
						onClick={() => api?.scrollPrev()}
						disabled={!canScrollPrev}
						aria-label="Previous photo"
						className={carouselNavButtonClassName}
					>
						<ChevronLeft />
					</Button>
					<p
						className="min-w-12 text-center text-sm tabular-nums text-muted-foreground"
						aria-live="polite"
						aria-atomic="true"
					>
						{selectedIndex + 1} / {total}
					</p>
					<Button
						type="button"
						variant="outline"
						size="icon"
						onClick={() => api?.scrollNext()}
						disabled={!canScrollNext}
						aria-label="Next photo"
						className={carouselNavButtonClassName}
					>
						<ChevronRight />
					</Button>
				</div>
			) : null}

			{currentPhoto ? <PhotoCarouselMetadata photo={currentPhoto} /> : null}
		</section>
	)
}
