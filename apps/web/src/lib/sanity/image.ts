import {
	createImageUrlBuilder,
	type ImageUrlBuilder,
	type SanityImageSource,
} from '@sanity/image-url'

export function createSanityImageBuilder(
	projectId: string,
	dataset: string,
): ImageUrlBuilder {
	return createImageUrlBuilder({ projectId, dataset })
}

export function buildImageUrl(
	builder: ImageUrlBuilder,
	source: SanityImageSource,
	width: number,
): string | undefined {
	try {
		return builder.image(source).width(width).auto('format').url()
	} catch {
		return undefined
	}
}
