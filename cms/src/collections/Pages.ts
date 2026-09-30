import type { Block, CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

import { contentAccess } from '../lib/access'
import { siteCacheHooks } from '../lib/siteCache'

// ── Page builder blocks — editors stack and drag-reorder these ──

const HeadingBlock: Block = {
  slug: 'heading',
  labels: { singular: 'Heading', plural: 'Headings' },
  fields: [
    { name: 'text', type: 'text', required: true },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'large',
      options: [
        { label: 'Large', value: 'large' },
        { label: 'Small', value: 'small' },
      ],
    },
  ],
}

const TextBlock: Block = {
  slug: 'text',
  labels: { singular: 'Text', plural: 'Text' },
  fields: [{ name: 'content', type: 'richText', required: true }],
}

const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: 'Photo', plural: 'Photos' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'text' },
  ],
}

const ButtonBlock: Block = {
  slug: 'button',
  labels: { singular: 'Button', plural: 'Buttons' },
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'url', type: 'text', required: true, admin: { description: 'Link, e.g. https://… or mailto:…' } },
  ],
}

const DividerBlock: Block = {
  slug: 'divider',
  labels: { singular: 'Divider (star line)', plural: 'Dividers' },
  fields: [],
}

// ── Save-time HTML rendering so the site worker serves plain HTML ──

const esc = (s: string) =>
  (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const renderHtml: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!data) return data
  const parts: string[] = []
  for (const block of data.layout || []) {
    try {
      switch (block.blockType) {
        case 'heading':
          parts.push(
            block.size === 'small'
              ? `<h3 style="font-family:'Oswald',sans-serif;text-transform:uppercase;letter-spacing:0.04em;color:var(--white);margin:2rem 0 0.8rem;">${esc(block.text)}</h3>`
              : `<h2 class="about-block__title" style="margin:2.5rem 0 1rem;">${esc(block.text)}</h2>`,
          )
          break
        case 'text':
          if (block.content) parts.push(convertLexicalToHTML({ data: block.content }))
          break
        case 'image': {
          // In beforeChange the upload field holds an id — resolve the filename
          const id = typeof block.image === 'object' ? block.image?.id : block.image
          if (id) {
            const media = await req.payload.findByID({ collection: 'media', id })
            if (media?.filename) {
              parts.push(
                `<figure style="margin:2rem 0;"><img src="/media/${esc(media.filename)}" alt="${esc(block.caption || media.alt || '')}" style="width:100%;border-radius:10px;display:block;">${
                  block.caption ? `<figcaption style="color:var(--steel);font-size:0.9rem;margin-top:0.5rem;text-align:center;">${esc(block.caption)}</figcaption>` : ''
                }</figure>`,
              )
            }
          }
          break
        }
        case 'button':
          parts.push(
            `<div style="text-align:center;margin:2.5rem 0;"><a href="${esc(block.url)}" class="donate-cta" target="_blank" rel="noopener">${esc(block.label)}</a></div>`,
          )
          break
        case 'divider':
          parts.push(`<div class="divider divider--center" style="margin:2.5rem auto;"></div>`)
          break
      }
    } catch {
      // A bad block shouldn't prevent saving the page
    }
  }
  data.html = parts.join('\n')
  return data
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'slug', 'status'],
    preview: (doc) => (doc?.slug ? `https://mnquietvalor.com/${doc.slug}/?preview=1` : null),
  },
  access: contentAccess,
  hooks: { ...siteCacheHooks, beforeChange: [renderHtml] },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description:
          'URL path, lowercase-with-dashes. Page serves at mnquietvalor.com/<slug>/. Reserved: about, events, testimonials, financials, gallery, admin',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: ['draft', 'published'],
      admin: { position: 'sidebar', description: 'Use Preview (top right) to see a draft on the real site' },
    },
    { name: 'subtitle', type: 'text' },
    { name: 'hero_image', type: 'upload', relationTo: 'media', admin: { description: 'Optional banner image' } },
    { name: 'image_url', type: 'text', admin: { description: 'Legacy media filename', hidden: true } },
    {
      name: 'layout',
      type: 'blocks',
      required: true,
      admin: { description: 'Build the page from sections — drag to reorder' },
      blocks: [HeadingBlock, TextBlock, ImageBlock, ButtonBlock, DividerBlock],
    },
    { name: 'html', type: 'textarea', admin: { hidden: true } },
  ],
}
