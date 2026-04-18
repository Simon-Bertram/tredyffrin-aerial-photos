"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { LocationRecord } from "@/lib/locations";
import { cn } from "@/lib/utils";

interface SelectedPhotosProps {
	locations: LocationRecord[];
}

interface Folio {
	key: string;
	plateNumber: number;
	locationName: string;
	locationSlug: string;
	src: string;
	alt: string;
	photoDate?: string;
	direction?: string;
}

/**
 * A horizontally scrolling row of curated aerial photographs,
 * paged by editorial nav arrows. Styled to "The Curated Manuscript."
 */
export function SelectedPhotos({ locations }: SelectedPhotosProps) {
	const folios = buildFolios(locations);
	const scrollerRef = useRef<HTMLDivElement | null>(null);
	const [canScrollPrev, setCanScrollPrev] = useState(false);
	const [canScrollNext, setCanScrollNext] = useState(false);
	/** Avoid SSR/client hydration mismatch: scroll metrics exist only after mount. */
	const [hasMeasuredScroll, setHasMeasuredScroll] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);

	const updateScrollState = useCallback(() => {
		const el = scrollerRef.current;
		if (!el) return;
		const max = el.scrollWidth - el.clientWidth;
		setCanScrollPrev(el.scrollLeft > 2);
		setCanScrollNext(el.scrollLeft < max - 2);

		const children = Array.from(el.children) as HTMLElement[];
		if (children.length === 0) return;
		const viewportMid = el.scrollLeft + el.clientWidth / 2;
		let nearest = 0;
		let nearestDelta = Number.POSITIVE_INFINITY;
		children.forEach((child, idx) => {
			const childMid = child.offsetLeft + child.offsetWidth / 2;
			const delta = Math.abs(childMid - viewportMid)
			if (delta < nearestDelta) {
				nearestDelta = delta;
				nearest = idx;
			}
		});
		setActiveIndex(nearest);
	}, []);

	useEffect(() => {
		const el = scrollerRef.current;
		if (!el) return;
		updateScrollState();
		setHasMeasuredScroll(true);
		el.addEventListener("scroll", updateScrollState, { passive: true });
		const resize = new ResizeObserver(updateScrollState);
		resize.observe(el);
		return () => {
			el.removeEventListener("scroll", updateScrollState);
			resize.disconnect();
		};
	}, [updateScrollState]);

	const handleScrollBy = useCallback((direction: 1 | -1) => {
		const el = scrollerRef.current;
		if (!el) return;
		const firstChild = el.firstElementChild as HTMLElement | null;
		const step = firstChild
			? firstChild.offsetWidth + 24
			: el.clientWidth * 0.8;
		el.scrollBy({ left: step * direction * 2, behavior: "smooth" });
	}, []);

	if (folios.length === 0) {
		return (
			<div className="md:col-span-8 md:col-start-5">
				<p className="font-display italic text-on-surface-variant">
					The plate drawers await their first folio.
				</p>
			</div>
		);
	}

	const totalLabel = folios.length.toString().padStart(2, "0");
	const activeLabel = (activeIndex + 1).toString().padStart(2, "0");

	return (
		<div className="md:col-span-8 md:col-start-5">
			<div className="mb-6 flex items-end justify-between gap-6">
				<div className="flex items-baseline gap-3 font-sans text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
					<span>Folio</span>
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
				aria-label="Selected photograph folios"
			>
				{folios.map((folio, index) => (
					<FolioThumb
						key={folio.key}
						folio={folio}
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
	const label = direction === "prev" ? "Previous folios" : "Next folios";
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

interface FolioThumbProps {
	folio: Folio;
	isActive: boolean;
}

function FolioThumb({ folio, isActive }: FolioThumbProps) {
	return (
		<a
			role="listitem"
			href={`/locations/${folio.locationSlug}`}
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
						src={folio.src}
						alt={folio.alt}
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
						Pl. {folio.plateNumber.toString().padStart(2, "0")}
					</span>
				</div>
				<figcaption className="mt-4 flex items-baseline justify-between gap-4">
					<div className="min-w-0">
						<p className="truncate font-display text-[1.05rem] leading-snug text-on-surface">
							{folio.locationName}
						</p>
						<p className="mt-1 truncate font-sans text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
							{folio.direction ?? "Direction unknown"}
						</p>
					</div>
					{folio.photoDate && (
						<span className="shrink-0 font-display text-sm italic text-on-surface-variant tabular-nums">
							{folio.photoDate}
						</span>
					)}
				</figcaption>
			</figure>
		</a>
	);
}

function buildFolios(locations: LocationRecord[]): Folio[] {
	const folios: Folio[] = [];
	let plateNumber = 0;
	for (const location of locations) {
		for (const photo of location.photos) {
			plateNumber += 1;
			folios.push({
				key: `${location.slug}-${photo.id}`,
				plateNumber,
				locationName: location.name,
				locationSlug: location.slug,
				src: photo.src,
				alt: photo.alt,
				photoDate: photo.photoDate,
				direction: photo.direction,
			});
		}
	}
	return folios;
}
