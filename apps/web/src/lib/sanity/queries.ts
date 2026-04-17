/** GROQ projection shared by list + detail fetches. */
export const locationProjection = /* groq */ `{
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
    photoDate,
    direction,
    comments,
    photo
  }
}`

export const locationsForMapQuery = /* groq */ `
 *[_type == "location" && defined(slug.current) && defined(coordinates)]
  | order(name asc)
  ${locationProjection}
`

export const locationBySlugQuery = /* groq */ `
  *[_type == "location" && slug.current == $slug][0]
  ${locationProjection}
`
