import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

import { contentAccess } from '../lib/access'
import { siteCacheHooks } from '../lib/siteCache'

// The public site worker serves pages as plain HTML; render the Lexical
// rich text to HTML at save time so the site never has to understand Lexical.
const renderHtml: CollectionBeforeChangeHook = ({ data }) => {
  if (data && data.content) {
    try {
      data.html = convertLexicalToHTML({ data: data.content })
    } catch {
      data.html = ''
    }
  }
  return data
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title', group: 'Content', defaultColumns: ['title', 'slug', 'status'] },
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
      admin: { position: 'sidebar' },
    },
    { name: 'subtitle', type: 'text' },
    { name: 'hero_image', type: 'upload', relationTo: 'media', admin: { description: 'Optional banner image' } },
    { name: 'image_url', type: 'text', admin: { description: 'Legacy media filename', hidden: true } },
    { name: 'content', type: 'richText', required: true },
    { name: 'html', type: 'textarea', admin: { hidden: true }, access: { update: () => true } },
  ],
}
