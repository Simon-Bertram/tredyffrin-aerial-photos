import { z } from "zod";

import { SELECTED_PHOTO_COLLECTION_VALUES } from "@/lib/selected-photo-collections";

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

/** Plain strings or portable-text blocks from Sanity → string[]. */
export function normalizeSanityPhotoReferences(
  value: unknown,
): string[] | null | undefined {
  if (value == null) {
    return value;
  }
  if (!Array.isArray(value)) {
    return undefined;
  }
  const strings: string[] = [];
  for (const item of value) {
    if (typeof item === "string") {
      const trimmed = item.trim();
      if (trimmed.length > 0) {
        strings.push(trimmed);
      }
      continue;
    }
    if (item == null || typeof item !== "object") {
      continue;
    }
    const block = item as { _type?: string; children?: unknown[] };
    if (block._type !== "block" || !Array.isArray(block.children)) {
      continue;
    }
    const text = block.children
      .map((child) => {
        if (child == null || typeof child !== "object") {
          return "";
        }
        const span = child as { text?: unknown };
        return typeof span.text === "string" ? span.text : "";
      })
      .join("");
    const trimmed = text.trim();
    if (trimmed.length > 0) {
      strings.push(trimmed);
    }
  }
  return strings.length > 0 ? strings : null;
}

export const sanityLocationPhotoRawSchema = z.object({
  _key: z.string().optional(),
  /** Stable unique id across places; optional until backfilled. */
  imageIdentifier: z.string().nullable().optional(),
  /** ISO datetime when the photo was added in Studio. */
  addedAt: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  alt: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  photographer: z.string().nullable().optional(),
  photoDate: z.number().int().min(1000).max(9999).nullable().optional(),
  direction: z.string().nullable().optional(),
  comments: z.string().nullable().optional(),
  photo: z.unknown(),
  addToSelectedPhotosCollection: z.boolean().nullable().optional(),
  selectedCollection: z
    .enum(SELECTED_PHOTO_COLLECTION_VALUES)
    .nullable()
    .optional(),
  references: z.preprocess(
    normalizeSanityPhotoReferences,
    z.array(z.string()).nullable().optional(),
  ),
  ownership: z.string().nullable().optional(),
});

export const sanityLocationRawSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  coordinates: sanityGeopointSchema.nullish(),
  shortDescription: z.string().nullable().optional(),
  fullDescription: z.string().nullable().optional(),
  photos: z.array(z.unknown()).nullable().optional(),
});

/** Location row for about-page feature photos only (no map fields). */
export const sanityLocationAboutFeatureRawSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  photos: z.array(z.unknown()).nullable().optional(),
});

export const sanityLocationNavRawSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  placeCollection: z.string().nullable().optional(),
});

export type SanityLocationRaw = z.infer<typeof sanityLocationRawSchema>;
export type SanityLocationPhotoRaw = z.infer<
  typeof sanityLocationPhotoRawSchema
>;
export type SanityLocationNavRaw = z.infer<typeof sanityLocationNavRawSchema>;
