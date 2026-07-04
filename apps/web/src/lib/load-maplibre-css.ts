import maplibreCss from "maplibre-gl/dist/maplibre-gl.css?inline";

let loadPromise: Promise<void> | null = null;

export function loadMapLibreCss(): Promise<void> {
	if (typeof document === "undefined") return Promise.resolve();
	if (document.querySelector("[data-maplibre-css]")) return Promise.resolve();

	loadPromise ??= Promise.resolve().then(() => {
		const style = document.createElement("style");
		style.setAttribute("data-maplibre-css", "");
		style.textContent = maplibreCss;
		document.head.appendChild(style);
	});

	return loadPromise;
}
