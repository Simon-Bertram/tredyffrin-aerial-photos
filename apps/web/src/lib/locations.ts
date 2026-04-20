export interface LocationPhoto {
	id: string
	title: string
	src: string
	alt: string
	caption?: string
	addToSelectedPhotosCollection?: boolean
	photographer?: string
	photoDate?: string
	direction?: string
	references?: string
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
