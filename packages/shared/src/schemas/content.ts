import { z } from 'zod';

/** Tiptap marks — only safe inline annotations */
const MarkSchema = z.object({
  type: z.enum(['bold', 'italic', 'link']),
  attrs: z.record(z.unknown()).optional(),
});

/** Tiptap node — recursive allowlist */
const TextSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  marks: z.array(MarkSchema).optional().default([]),
});

const HardBreakSchema = z.object({
  type: z.literal('hardBreak'),
});

const HeadingSchema = z.object({
  type: z.literal('heading'),
  attrs: z.object({ level: z.number().min(1).max(6) }).optional(),
  content: z.array(z.lazy((): z.ZodType => RichTextNodeSchema)).optional(),
});

const ParagraphSchema = z.object({
  type: z.literal('paragraph'),
  content: z.array(z.lazy((): z.ZodType => RichTextNodeSchema)).optional(),
});

const BulletListSchema = z.object({
  type: z.literal('bulletList'),
  content: z.array(
    z.object({
      type: z.literal('listItem'),
      content: z.array(z.lazy((): z.ZodType => RichTextNodeSchema)).optional(),
    }),
  ).optional(),
});

const OrderedListSchema = z.object({
  type: z.literal('orderedList'),
  attrs: z.object({ start: z.number().optional() }).optional(),
  content: z.array(
    z.object({
      type: z.literal('listItem'),
      content: z.array(z.lazy((): z.ZodType => RichTextNodeSchema)).optional(),
    }),
  ).optional(),
});

const BlockquoteSchema = z.object({
  type: z.literal('blockquote'),
  content: z.array(z.lazy((): z.ZodType => RichTextNodeSchema)).optional(),
});

const ImageSchema = z.object({
  type: z.literal('image'),
  attrs: z.object({
    src: z.string().min(1, 'Image src is required'),
    alt: z.string().optional(),
    title: z.string().optional(),
  }),
});

const ListItemSchema = z.object({
  type: z.literal('listItem'),
  content: z.array(z.lazy((): z.ZodType => RichTextNodeSchema)).optional(),
});

export const RichTextNodeSchema: z.ZodType = z.discriminatedUnion('type', [
  TextSchema,
  HardBreakSchema,
  HeadingSchema,
  ParagraphSchema,
  BulletListSchema,
  OrderedListSchema,
  BlockquoteSchema,
  ImageSchema,
  ListItemSchema,
]);

export const RichTextDocumentSchema = z.object({
  type: z.literal('doc'),
  content: z.array(RichTextNodeSchema).optional(),
});

/** Content type enum */
export const ContentTypeSchema = z.enum(['NEWS', 'POLICY']);
export type ContentType = z.infer<typeof ContentTypeSchema>;

/** Content status enum */
export const ContentStatusSchema = z.enum(['DRAFT', 'PUBLISHED']);
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

/** Full content post */
export const ContentPostSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống.').max(160, 'Tiêu đề quá dài.'),
  slug: z
    .string()
    .min(1, 'Slug không được để trống.')
    .max(200, 'Slug quá dài.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang.'),
  excerpt: z.string().min(1, 'Mô tả ngắn không được để trống.').max(500, 'Mô tả quá dài.'),
  coverImageUrl: z.string().url('URL ảnh không hợp lệ.').nullable().optional(),
  content: RichTextDocumentSchema,
  sortOrder: z.number().int().min(0, 'sortOrder không được âm.').default(0),
  publishedAt: z.string().datetime().nullable().optional(),
  status: ContentStatusSchema.optional(),
});

export type ContentPost = z.infer<typeof ContentPostSchema>;

/** Validate that links are safe */
export function validateLinkHref(href: string): boolean {
  return /^(https?:|mailto:|tel:|\/)/i.test(href);
}

/** Rich text link mark with validated href */
export const SafeLinkMarkSchema = MarkSchema.refine(
  (mark) => {
    if (mark.type !== 'link') return true;
    const href = mark.attrs?.href;
    return typeof href === 'string' && validateLinkHref(href);
  },
  { message: 'Liên kết không an toàn. Chỉ chấp nhận http, https, mailto, tel và đường dẫn tương đối.' },
);

/** Enhanced text node that validates links */
export const SafeTextSchema = TextSchema.extend({
  marks: z.array(SafeLinkMarkSchema).optional().default([]),
});
