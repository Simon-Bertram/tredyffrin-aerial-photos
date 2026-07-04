/// <reference types="astro/client" />

type HeaderSanityData = import('@/lib/header-sanity-data').HeaderSanityData

declare namespace App {
	interface Locals {
		headerSanityData?: Promise<HeaderSanityData>
	}
}
