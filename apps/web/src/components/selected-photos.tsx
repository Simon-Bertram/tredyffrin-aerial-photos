"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { useHorizontalSnapScroller } from "@/hooks/use-horizontal-snap-scroller";
import type { LocationRecord } from "@/lib/locations";
import { buildSelectedPhotos, type SelectedPhoto } from "@/lib/selected-photos-data";
import { cn } from "@/lib/utils";

interface SelectedPhotosProps {
	locations: LocationRecord[];
}

/**
 * A horizontally scrolling row of curated aerial photographs,
 * paged by editorial nav arrows. Styled to "The Curated Manuscript."
 */
export function SelectedPhotos({ locations }: SelectedPhotosProps) {
	const photos = buildSelectedPhotos(locations);
	const {
		scrollerRef,
		canScrollPrev,
		canScrollNext,
		hasMeasuredScroll,
		activeIndex,
		handleScrollBy,
	} = useHorizontalSnapScroller();

	if (photos.length === 0) {
		return (
			<div className="md:col-span-8 md:col-start-5">
				<p className="font-display italic text-on-surface-variant">
					The plate drawers await their first photograph.
				</p>
			</div>
		);
	}

	const totalLabel = photos.length.toString().padStart(2, "0");
	const activeLabel = (activeIndex + 1).toString().padStart(2, "0");

	return (
		<div className="md:col-span-8 md:col-start-5">
			<div className="mb-6 flex items-end justify-between gap-6">
				<div className="flex items-baseline gap-3 font-sans text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
					<span>Photo</span>
					<span className="tabular-nums text-on-surface">
						{activeLabel}
					</span>
					<span aria-hidden className="opacity-50">
						—
					</span>
					<span className="tabular-nums">{totalLabel}</span>
				</div>
				<nav
					aria-label="Scroll selected photographs"
					className="flex items-center gap-2"
				>
					<ArrowButton
						direction="prev"
						disabled={!hasMeasuredScroll || !canScrollPrev}
						onClick={() => handleScrollBy(-1)}
					/>
					{/* Next stays enabled until measure so SSR (no disabled attr) matches hydration. */}
					<ArrowButton
						direction="next"
						disabled={
							hasMeasuredScroll ? !canScrollNext : false
						}
						onClick={() => handleScrollBy(1)}
					/>
				</nav>
			</div>

			<div
				ref={scrollerRef}
				className={cn(
					"no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto",
					"scroll-smooth pb-2",
					"mask-[linear-gradient(to_right,transparent,black_2%,black_98%,transparent)]",
				)}
				role="list"
				aria-label="Selected photographs"
			>
				{photos.map((photo, index) => (
					<SelectedPhotoCard
						key={photo.key}
						photo={photo}
						isActive={index === activeIndex}
					/>
				))}
			</div>
		</div>
	);
}

interface ArrowButtonProps {
	direction: "prev" | "next";
	disabled: boolean;
	onClick: () => void;
}

function ArrowButton({ direction, disabled, onClick }: ArrowButtonProps) {
	const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
	const label =
		direction === "prev" ? "Previous photographs" : "Next photographs";
	return (
		<button
			type="button"
			aria-label={label}
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"group relative flex size-10 items-center justify-center",
				"bg-surface-container-low text-on-surface",
				"rounded-none transition-colors duration-200",
				"hover:bg-primary hover:text-primary-foreground",
				"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
				"disabled:cursor-not-allowed disabled:bg-transparent",
				"disabled:text-on-surface-variant/40",
				"shadow-[0_12px_24px_color-mix(in_srgb,var(--on-surface)_4%,transparent)]",
			)}
		>
			<Icon className="size-4" strokeWidth={1.5} />
		</button>
	);
}

interface SelectedPhotoCardProps {
	photo: SelectedPhoto;
	isActive: boolean;
}

function SelectedPhotoCard({ photo, isActive }: SelectedPhotoCardProps) {
	return (
		<a
			role="listitem"
			href={`/locations/${photo.locationSlug}`}
			className={cn(
				"group relative block shrink-0 snap-start",
				"w-[16rem] md:w-[18rem]",
				"transition-opacity duration-300",
				isActive ? "opacity-100" : "opacity-70 hover:opacity-100",
			)}
		>
			<figure>
				<div
					className={cn(
						"relative overflow-hidden bg-surface-dim",
						"aspect-4/3",
						"shadow-[0_24px_40px_color-mix(in_srgb,var(--on-surface)_6%,transparent)]",
						"transition-[transform,box-shadow] duration-500 ease-out",
						"group-hover:-translate-y-1",
						"group-hover:shadow-[0_32px_48px_color-mix(in_srgb,var(--on-surface)_9%,transparent)]",
					)}
				>
					<img
						src={photo.src}
						alt={photo.alt}
						loading="lazy"
						className={cn(
							"h-full w-full object-cover",
							"transition-transform duration-900 ease-out",
							"group-hover:scale-[1.03]",
						)}
					/>
					<span
						aria-hidden
						className={cn(
							"absolute left-3 top-3",
							"bg-surface/85 text-on-surface backdrop-blur-sm",
							"px-2 py-1 font-sans text-[10px] uppercase tracking-[0.18em]",
						)}
					>
						Pl. {photo.plateNumber.toString().padStart(2, "0")}
					</span>
				</div>
				<figcaption className="mt-4 flex items-baseline justify-between gap-4">
					<div className="min-w-0">
						<p className="truncate font-display text-[1.05rem] leading-snug text-on-surface">
							{photo.locationName}
						</p>
						<p className="mt-1 truncate font-sans text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
							{photo.direction ?? "Direction unknown"}
						</p>
					</div>
					{photo.photoDate && (
						<span className="shrink-0 font-display text-sm italic text-on-surface-variant tabular-nums">
							{photo.photoDate}
						</span>
					)}
				</figcaption>
			</figure>
		</a>
	);
}
