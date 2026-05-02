"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { LocationPhotoCarousel } from "@/components/location/location-photo-carousel";
import type { LocationPhoto } from "@/lib/locations";

export interface LocationPhotoGallerySessionProps {
	photos: LocationPhoto[];
	initialPhotoIndex: number;
	onClose: () => void;
	/** Defaults to &quot;Back to photo gallery&quot; (location page). */
	closeLabel?: string;
}

/**
 * Open-state UI shared by {@link LocationPhotoGalleryLauncher} and the
 * homepage selected-photos coverflow: back control + {@link LocationPhotoCarousel}.
 */
export function LocationPhotoGallerySession({
	photos,
	initialPhotoIndex,
	onClose,
	closeLabel = "Back to photo gallery",
}: LocationPhotoGallerySessionProps) {
	return (
		<section className="space-y-4">
			<div className="flex justify-end">
				<Button
					className="bg-[color-mix(in_srgb,var(--secondary-container)_55%,var(--surface))] dark:bg-[color-mix(in_srgb,var(--secondary-fixed)_50%,var(--surface))]"
					type="button"
					variant="outline"
					onClick={onClose}
					aria-label={closeLabel}
				>
					{closeLabel}
				</Button>
			</div>
			<LocationPhotoCarousel
				photos={photos}
				initialPhotoIndex={initialPhotoIndex}
			/>
		</section>
	);
}
