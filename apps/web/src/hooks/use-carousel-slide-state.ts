'use client'

import { useEffect, useState } from 'react'

import type { CarouselApi } from '@/components/ui/carousel'

export interface UseCarouselSlideStateResult {
	canScrollPrev: boolean
	canScrollNext: boolean
	selectedIndex: number
}

/**
 * Subscribes to Embla carousel API for scroll bounds and selected slide index.
 * Use when controls cannot sit under CarouselProvider (e.g. siblings outside
 * `<Carousel>`), so `useCarousel` context is unavailable.
 */
export function useCarouselSlideState(
	api: CarouselApi | undefined,
): UseCarouselSlideStateResult {
	const [canScrollPrev, setCanScrollPrev] = useState(false)
	const [canScrollNext, setCanScrollNext] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(0)

	useEffect(() => {
		if (!api) return
		const sync = () => {
			setCanScrollPrev(api.canScrollPrev())
			setCanScrollNext(api.canScrollNext())
			setSelectedIndex(api.selectedScrollSnap())
		}
		sync()
		api.on('select', sync)
		api.on('reInit', sync)
		return () => {
			api.off('select', sync)
			api.off('reInit', sync)
		}
	}, [api])

	return { canScrollPrev, canScrollNext, selectedIndex }
}
