import * as React from "react";

import { LocationPhotoMetadata } from "@/components/location/location-photo-metadata";
import { cn } from "@/lib/utils";
import type { LocationPhoto } from "@/lib/locations";

export interface LocationPhotoCardProps {
	photo: LocationPhoto;
	className?: string;
	layout?: "grid" | "slideshow";
	/**
	 * Grid layout only: render only figure + body so the outer focusable element
	 * (e.g. a `<button class="card">`) supplies the card chrome.
	 */
	embedInCardChrome?: boolean;
}

export function LocationPhotoCard({
	photo,
	className,
	layout = "grid",
	embedInCardChrome = false,
}: LocationPhotoCardProps) {
	if (layout === "slideshow") {
		return (
			<figure
				className={cn(
					"overflow-hidden rounded-lg border bg-card",
					className,
				)}
			>
				<LocationPhotoMetadata
					variant="slideshow"
					section="slide-title"
					photo={photo}
				/>
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
		);
	}

	const inner = (
		<>
			<figure className="aspect-4/3 w-full overflow-hidden">
				<img
					src={photo.src}
					alt={photo.alt}
					className="h-full w-full object-cover"
					loading="lazy"
					decoding="async"
				/>
			</figure>
			<div className="card-body">
				<LocationPhotoMetadata variant="gallery" photo={photo} />
			</div>
		</>
	);

	if (embedInCardChrome) {
		return <>{inner}</>;
	}

	return (
		<article
			className={cn(
				"card border border-border bg-card shadow-sm",
				className,
			)}
		>
			{inner}
		</article>
	);
}
