export type SanityRepositoryQueryKind =
	| 'locationsForMap'
	| 'locationsWithThemeTaggedPhotos'
	| 'locationsForAboutFeature'
	| 'locationSlugs'
	| 'otherLocationPlaces'
	| 'themePlaces'
	| 'themeLocationsWithPhotos'
	| 'themeCollectionPhotoCounts'
	| 'locationBySlug'

export interface SanityRepositoryTelemetryEvent {
	eventName: 'skip' | 'unexpectedShape'
	context: string
	queryKind: SanityRepositoryQueryKind
	slugOrId: string
	reason: string
	detail?: unknown
}

export type SanityRepositoryTelemetryEmitter = (
	event: SanityRepositoryTelemetryEvent,
) => void

const defaultEmitter: SanityRepositoryTelemetryEmitter = (event) => {
	console.warn(
		`[sanity:${event.context}] ${event.slugOrId}: ${event.reason}`,
		event.detail ?? '',
	)
}

let emitter: SanityRepositoryTelemetryEmitter = defaultEmitter

export function setSanityRepositoryTelemetryEmitter(
	next: SanityRepositoryTelemetryEmitter,
) {
	emitter = next
}

export function resetSanityRepositoryTelemetryEmitter() {
	emitter = defaultEmitter
}

export function emitSanityRepositorySkip(
	context: string,
	queryKind: SanityRepositoryQueryKind,
	slugOrId: string,
	reason: string,
	detail?: unknown,
) {
	emitter({
		eventName: 'skip',
		context,
		queryKind,
		slugOrId,
		reason,
		detail,
	})
}

export function emitSanityRepositoryUnexpectedShape(
	context: string,
	queryKind: SanityRepositoryQueryKind,
	reason: string,
	detail?: unknown,
) {
	emitter({
		eventName: 'unexpectedShape',
		context,
		queryKind,
		slugOrId: 'unknown',
		reason,
		detail,
	})
}
