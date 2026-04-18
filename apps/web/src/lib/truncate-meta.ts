export function truncateMeta(s: string, max: number): string {
	const t = s.trim().replace(/\s+/g, ' ')
	if (t.length <= max) return t
	const cut = t.slice(0, max - 1)
	const lastSpace = cut.lastIndexOf(' ')
	const base = lastSpace > 40 ? cut.slice(0, lastSpace) : cut
	return `${base.trimEnd()}…`
}
