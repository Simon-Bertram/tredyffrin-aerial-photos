"use client";

import * as React from "react";

import { LocationPhotoCard } from "@/components/location/location-photo-card";
import { LocationPhotoGallerySession } from "@/components/location/location-photo-gallery-session";
import type { LocationPhoto } from "@/lib/locations";

interface LocationPhotoGalleryLauncherProps {
	photos: LocationPhoto[];
	/** When set (e.g. `?photo=` on the location URL), open the carousel on that slide. */
	initialPhotoId?: string | null;
}

export function LocationPhotoGalleryLauncher({
	photos,
	initialPhotoId,
}: LocationPhotoGalleryLauncherProps) {
	const [isCarouselOpen, setIsCarouselOpen] = React.useState(() => {
		if (!initialPhotoId?.trim()) return false;
		const idx = photos.findIndex((p) => p.id === initialPhotoId);
		return idx >= 0;
	});
	const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState(() => {
		if (!initialPhotoId?.trim()) return 0;
		const idx = photos.findIndex((p) => p.id === initialPhotoId);
		return idx >= 0 ? idx : 0;
	});

	if (photos.length === 0) return null;

	const handleOpenCarousel = (index: number) => {
		setSelectedPhotoIndex(index);
		setIsCarouselOpen(true);
	};

	const handleCloseCarousel = () => {
		setIsCarouselOpen(false);
	};

	if (isCarouselOpen) {
		return (
			<LocationPhotoGallerySession
				key={`${initialPhotoId ?? "open"}-${selectedPhotoIndex}`}
				photos={photos}
				initialPhotoIndex={selectedPhotoIndex}
				onClose={handleCloseCarousel}
			/>
		);
	}

	return (
		<section
			className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8"
			aria-label={`Photo gallery (${photos.length})`}
		>
			{photos.map((photo, index) => (
				<button
					key={photo.id}
					type="button"
					onClick={() => handleOpenCarousel(index)}
					className="card overflow-hidden border border-border bg-card text-left shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					aria-label={`Open photo ${index + 1}: ${photo.title || photo.alt}`}
				>
					<LocationPhotoCard
						photo={photo}
						layout="grid"
						embedInCardChrome
					/>
				</button>
			))}
		</section>
	);
}
