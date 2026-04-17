export interface LocationPhoto {
	id: string
	title: string
	src: string
	alt: string
	caption?: string
	photographer?: string
	photoDate?: string
	direction?: string
	comments?: string
}

export interface LocationRecord {
	slug: string
	name: string
	coordinates: {
		longitude: number
		latitude: number
	}
	shortDescription: string
	fullDescription: string
	photos: LocationPhoto[]
}
