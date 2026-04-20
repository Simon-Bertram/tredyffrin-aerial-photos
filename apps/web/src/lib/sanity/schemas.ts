import { z } from "zod";

/** Raw geopoint from Sanity Content Lake. */
export const sanityGeopointSchema = z.object({
  _type: z.literal("geopoint").optional(),
  lat: z.number(),
  lng: z.number(),
});

/** Image field: require asset reference for CDN URLs. */
export const sanityImageForUrlSchema = z.looseObject({
  _type: z.literal("image").optional(),
  asset: z
    .looseObject({
      _ref: z.string().optional(),
      _type: z.string().optional(),
    })
    .refine((a) => typeof a._ref === "string" && a._ref.length > 0, {
      message: "image.asset._ref required",
    }),
});

export const sanityLocationPhotoRawSchema = z.object({
  _key: z.string().optional(),
  title: z.string().nullable().optional(),
  alt: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  photographer: z.string().nullable().optional(),
  photoDate: z.number().int().min(1000).max(9999).nullable().optional(),
  direction: z.string().nullable().optional(),
  comments: z.string().nullable().optional(),
  photo: z.unknown(),
  addToSelectedPhotosCollection: z.boolean().nullable().optional(),
  references: z.array(z.string()).nullable().optional(),
  ownership: z.string().nullable().optional(),
});

export const sanityLocationRawSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  coordinates: sanityGeopointSchema,
  shortDescription: z.string().nullable().optional(),
  fullDescription: z.string().nullable().optional(),
  photos: z.array(z.unknown()).nullable().optional(),
});

export type SanityLocationRaw = z.infer<typeof sanityLocationRawSchema>;
export type SanityLocationPhotoRaw = z.infer<
  typeof sanityLocationPhotoRawSchema
>;
