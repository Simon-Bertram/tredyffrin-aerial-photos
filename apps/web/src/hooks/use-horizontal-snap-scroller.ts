'use client'

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type RefObject,
} from 'react'

/** Pixels from edge to treat as "at" start/end for overflow buttons. */
const SCROLL_EDGE_EPSILON = 2
/** Matches Tailwind `gap-6` (1.5rem) on the scroller. */
const SCROLLER_GAP_PX = 24
const FALLBACK_SCROLL_STEP_FRACTION = 0.8
/** How many card widths to move per arrow press (pairs with gap). */
const SCROLL_BY_CARD_MULTIPLIER = 2

export interface UseHorizontalSnapScrollerResult {
	scrollerRef: RefObject<HTMLDivElement | null>
	canScrollPrev: boolean
	canScrollNext: boolean
	/** False until mount avoids SSR/client hydration mismatch on scroll metrics. */
	hasMeasuredScroll: boolean
	activeIndex: number
	handleScrollBy: (direction: 1 | -1) => void
}

/**
 * Tracks scroll overflow, viewport-centered "active" child index, and
 * programmatic paging for a horizontal snap scroller.
 */
export function useHorizontalSnapScroller(): UseHorizontalSnapScrollerResult {
	const scrollerRef = useRef<HTMLDivElement | null>(null)
	const [canScrollPrev, setCanScrollPrev] = useState(false)
	const [canScrollNext, setCanScrollNext] = useState(false)
	const [hasMeasuredScroll, setHasMeasuredScroll] = useState(false)
	const [activeIndex, setActiveIndex] = useState(0)

	const updateScrollState = useCallback(() => {
		const el = scrollerRef.current
		if (!el) return
		const max = el.scrollWidth - el.clientWidth
		setCanScrollPrev(el.scrollLeft > SCROLL_EDGE_EPSILON)
		setCanScrollNext(el.scrollLeft < max - SCROLL_EDGE_EPSILON)

		const children = Array.from(el.children) as HTMLElement[]
		if (children.length === 0) return
		const viewportMid = el.scrollLeft + el.clientWidth / 2
		let nearest = 0
		let nearestDelta = Number.POSITIVE_INFINITY
		children.forEach((child, idx) => {
			const childMid = child.offsetLeft + child.offsetWidth / 2
			const delta = Math.abs(childMid - viewportMid)
			if (delta < nearestDelta) {
				nearestDelta = delta
				nearest = idx
			}
		})
		setActiveIndex(nearest)
	}, [])

	useEffect(() => {
		const el = scrollerRef.current
		if (!el) return
		updateScrollState()
		setHasMeasuredScroll(true)
		el.addEventListener('scroll', updateScrollState, { passive: true })
		const resize = new ResizeObserver(updateScrollState)
		resize.observe(el)
		return () => {
			el.removeEventListener('scroll', updateScrollState)
			resize.disconnect()
		}
	}, [updateScrollState])

	const handleScrollBy = useCallback((direction: 1 | -1) => {
		const el = scrollerRef.current
		if (!el) return
		const firstChild = el.firstElementChild as HTMLElement | null
		const step = firstChild
			? firstChild.offsetWidth + SCROLLER_GAP_PX
			: el.clientWidth * FALLBACK_SCROLL_STEP_FRACTION
		el.scrollBy({
			left: step * direction * SCROLL_BY_CARD_MULTIPLIER,
			behavior: 'smooth',
		})
	}, [])

	return {
		scrollerRef,
		canScrollPrev,
		canScrollNext,
		hasMeasuredScroll,
		activeIndex,
		handleScrollBy,
	}
}
