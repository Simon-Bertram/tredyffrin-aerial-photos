import type { MapLocationRecord } from "@/lib/locations";

export const HOME_TITLE = "Tredyffrin Easttown Aerial Photos";

export const HOME_DESCRIPTION =
  "A collection of aerial photographs documenting the landscape of Tredyffrin Easttown Townships, Pennsylvania.";

export function getFirstPreviewPhoto(
  locations: MapLocationRecord[],
): MapLocationRecord["photos"][number] | undefined {
  return locations[0]?.photos[0];
}

export function buildHomeJsonLd(siteOrigin: string) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: HOME_TITLE,
      url: `${siteOrigin}/`,
      description: HOME_DESCRIPTION,
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Tredyffrin Easttown Historical Society",
    },
  ];
}
