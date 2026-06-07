import { describe, it, expect } from 'vitest';
import { RichTextDocumentSchema, ContentPostSchema, validateLinkHref } from './content';

describe('RichTextDocumentSchema', () => {
  const stripMarks = (obj: unknown): unknown => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(stripMarks);
    const copy: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (k === 'marks' && Array.isArray(v) && v.length === 0) continue;
      copy[k] = stripMarks(v);
    }
    return copy;
  };

  it('accepts a valid doc with heading, paragraph, and text', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Hello' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This is ' },
            { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
          ],
        },
      ],
    };
    const parsed = RichTextDocumentSchema.parse(doc);
    expect(stripMarks(parsed)).toEqual(doc);
  });

  it('accepts bulletList and orderedList', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Lists' }] },
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] }] },
          ],
        },
        {
          type: 'orderedList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] }] },
          ],
        },
      ],
    };
    const parsed = RichTextDocumentSchema.parse(doc);
    expect(stripMarks(parsed)).toEqual(doc);
  });

  it('accepts blockquote, hardBreak, and image', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'blockquote',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Quote' }] }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Line 1' },
            { type: 'hardBreak' },
            { type: 'text', text: 'Line 2' },
          ],
        },
        {
          type: 'image',
          attrs: { src: '/uploads/image.jpg', alt: 'Photo' },
        },
      ],
    };
    const parsed = RichTextDocumentSchema.parse(doc);
    expect(stripMarks(parsed)).toEqual(doc);
  });

  it('accepts links with safe hrefs', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Click here',
              marks: [{ type: 'link', attrs: { href: 'https://example.com', target: '_blank' } }],
            },
          ],
        },
      ],
    };
    expect(RichTextDocumentSchema.parse(doc)).toBeTruthy();
  });

  it('rejects unknown node types', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'script', content: [{ type: 'text', text: 'alert(1)' }] }],
    };
    expect(() => RichTextDocumentSchema.parse(doc)).toThrow();
  });

  it('rejects non-doc root', () => {
    const nonDoc = {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Hi' }],
    };
    expect(() => RichTextDocumentSchema.parse(nonDoc)).toThrow();
  });
});

describe('validateLinkHref', () => {
  it('accepts https', () => expect(validateLinkHref('https://example.com')).toBe(true));
  it('accepts http', () => expect(validateLinkHref('http://example.com')).toBe(true));
  it('accepts mailto', () => expect(validateLinkHref('mailto:test@example.com')).toBe(true));
  it('accepts tel', () => expect(validateLinkHref('tel:+84123456789')).toBe(true));
  it('accepts relative paths', () => expect(validateLinkHref('/news/some-article')).toBe(true));
  it('rejects javascript protocol', () => expect(validateLinkHref('javascript:alert(1)')).toBe(false));
  it('rejects data protocol', () => expect(validateLinkHref('data:text/html,<script>alert(1)</script>')).toBe(false));
});

describe('ContentPostSchema', () => {
  it('accepts a valid content post', () => {
    const post = {
      title: 'Bài viết mới',
      slug: 'bai-viet-moi',
      excerpt: 'Mô tả ngắn về bài viết.',
      content: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nội dung' }] }],
      },
    };
    expect(ContentPostSchema.parse(post)).toBeTruthy();
  });

  it('rejects empty title', () => {
    expect(() =>
      ContentPostSchema.parse({
        title: '',
        slug: 'test',
        excerpt: 'desc',
        content: { type: 'doc', content: [] },
      }),
    ).toThrow();
  });

  it('rejects invalid slug format', () => {
    expect(() =>
      ContentPostSchema.parse({
        title: 'Test',
        slug: 'INVALID Slug!',
        excerpt: 'desc',
        content: { type: 'doc', content: [] },
      }),
    ).toThrow();
  });

  it('rejects empty excerpt', () => {
    expect(() =>
      ContentPostSchema.parse({
        title: 'Test',
        slug: 'test',
        excerpt: '',
        content: { type: 'doc', content: [] },
      }),
    ).toThrow();
  });

  it('rejects invalid content (non-doc root)', () => {
    expect(() =>
      ContentPostSchema.parse({
        title: 'Test',
        slug: 'test',
        excerpt: 'desc',
        content: { type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] },
      }),
    ).toThrow();
  });

  it('rejects negative sortOrder', () => {
    expect(() =>
      ContentPostSchema.parse({
        title: 'Test',
        slug: 'test',
        excerpt: 'desc',
        content: { type: 'doc', content: [] },
        sortOrder: -1,
      }),
    ).toThrow('sortOrder');
  });
});
