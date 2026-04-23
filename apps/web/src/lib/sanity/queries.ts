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
    addToSelectedPhotosCollection
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
    addToSelectedPhotosCollection
  }
}`;

export const locationsForMapQuery = /* groq */ `
 *[_type == "location" && defined(slug.current) && defined(coordinates)]
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
