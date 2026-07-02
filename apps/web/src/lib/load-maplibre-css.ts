let loadPromise: Promise<void> | null = null;

export function loadMapLibreCss(): Promise<void> {
	if (typeof document === "undefined") return Promise.resolve();
	loadPromise ??= import("maplibre-gl/dist/maplibre-gl.css").then(() => {});
	return loadPromise;
}
