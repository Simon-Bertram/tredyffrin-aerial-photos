/** Minimal projection for map/list routes. */
export const locationForMapProjection = /* groq */ `{
  _id,
  name,
  "slug": slug.current,
  coordinates,
  shortDescription,
  photos[]{
    _key,
    title,
    alt,
    photoDate,
    direction,
    photo,
    addToSelectedPhotosCollection,
    selectedCollection
  }
}`;

/** Full projection for detail pages. */
export const locationForDetailProjection = /* groq */ `{
  _id,
  name,
  "slug": slug.current,
  coordinates,
  shortDescription,
  fullDescription,
  photos[]{
    _key,
    title,
    alt,
    caption,
    photographer,
    ownership,
    photoDate,
    direction,
    comments,
    references,
    photo,
    addToSelectedPhotosCollection,
    selectedCollection
  }
}`;

export const locationsForMapQuery = /* groq */ `
 *[_type == "location" && defined(slug.current) && defined(coordinates)]
  | order(name asc)
  ${locationForMapProjection}
`;

/** Locations with theme-tagged photos (no coordinates requirement). */
export const locationsWithThemeTaggedPhotosQuery = /* groq */ `
  *[
    _type == "location" &&
    defined(slug.current) &&
    count(photos[defined(selectedCollection)]) > 0
  ]
  | order(name asc)
  ${locationForMapProjection}
`;

/** About page feature strip — same location set as map, minimal fields. */
export const locationForAboutFeatureProjection = /* groq */ `{
  _id,
  name,
  "slug": slug.current,
  photos[]{
    _key,
    title,
    alt,
    photoDate,
    photo
  }
}`;

export const locationsForAboutFeatureQuery = /* groq */ `
 *[_type == "location" && defined(slug.current) && defined(coordinates)]
  | order(name asc)
  ${locationForAboutFeatureProjection}
`;

export const locationBySlugQuery = /* groq */ `
  *[_type == "location" && slug.current == $slug][0]
  ${locationForDetailProjection}
`;

/** Slugs only — for sitemap and discovery endpoints. */
export const locationSlugsQuery = /* groq */ `
  *[_type == "location" && defined(slug.current)]
    | order(name asc) {"slug": slug.current}
`;

/** Studio “Other locations” sidebar — places outside Tredyffrin Easttown. */
export const otherLocationPlacesQuery = /* groq */ `
  *[
    _type == "location" &&
    placeCollection != $tredyffrinEasttown &&
    defined(slug.current)
  ]
  | order(name asc)
  {
    name,
    "slug": slug.current,
    "photoCount": count(photos[defined(photo.asset._ref)])
  }
`;

/** Locations with theme-tagged photos only (for theme index gallery). */
export const themeLocationsWithPhotosQuery = /* groq */ `
  *[
    _type == "location" &&
    defined(slug.current) &&
    count(photos[selectedCollection == $collection]) > 0
  ]
  | order(name asc)
  {
    _id,
    name,
    "slug": slug.current,
    coordinates,
    shortDescription,
    fullDescription,
    "photos": photos[selectedCollection == $collection]{
      _key,
      title,
      alt,
      caption,
      photographer,
      ownership,
      photoDate,
      direction,
      comments,
      references,
      photo,
      addToSelectedPhotosCollection,
      selectedCollection
    }
  }
`;

/** Places with at least one photo in a theme bucket. */
export const themePlacesQuery = /* groq */ `
  *[
    _type == "location" &&
    defined(slug.current) &&
    count(photos[selectedCollection == $collection]) > 0
  ]
  | order(name asc)
  {
    name,
    "slug": slug.current,
    "photoCount": count(photos[selectedCollection == $collection])
  }
`;

/** Total tagged photos per theme bucket (homepage theme labels). */
export const themeCollectionPhotoCountsQuery = /* groq */ `
  {
    "airfields": count(*[_type == "location"].photos[selectedCollection == "airfields"]),
    "bridges": count(*[_type == "location"].photos[selectedCollection == "bridges"]),
    "railroads": count(*[_type == "location"].photos[selectedCollection == "railroads"]),
    "philadelphia-art-museum": count(*[_type == "location"].photos[selectedCollection == "philadelphia-art-museum"])
  }
`;
