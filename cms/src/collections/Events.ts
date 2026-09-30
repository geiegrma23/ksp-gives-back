import type { CollectionConfig } from 'payload'

import { contentAccess } from '../lib/access'
import { siteCacheHooks } from '../lib/siteCache'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'date', 'location', 'status'],
  },
  access: contentAccess,
  hooks: siteCacheHooks,
  defaultSort: '-date',
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'URL id, lowercase-with-dashes, e.g. spring-fundraiser' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: ['draft', 'published'],
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        { name: 'date', type: 'text', admin: { description: 'YYYY-MM-DD', width: '50%' } },
        { name: 'end_date', type: 'text', admin: { description: 'YYYY-MM-DD (optional)', width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'time_start', type: 'text', admin: { description: 'e.g. 6:00 PM', width: '50%' } },
        { name: 'time_end', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'location', type: 'text' },
    { name: 'description', type: 'textarea', admin: { description: 'Short summary shown on cards' } },
    { name: 'body', type: 'textarea', admin: { description: 'Full details shown on the event' } },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Event image (preferred)' },
    },
    {
      name: 'image_url',
      type: 'text',
      admin: { description: 'Legacy media filename — leave empty for new events' },
    },
  ],
}

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'role', 'featured', 'status'],
  },
  access: contentAccess,
  hooks: siteCacheHooks,
  defaultSort: 'sort_order',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', admin: { description: 'e.g. U.S. Army Veteran' } },
    { name: 'quote', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: ['draft', 'published'],
      admin: { position: 'sidebar' },
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Show on home page (first 3)' } },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'image_url', type: 'text', admin: { description: 'Legacy media filename' } },
    { name: 'sort_order', type: 'number', defaultValue: 0 },
  ],
}

export const FinancialReports: CollectionConfig = {
  slug: 'financial-reports',
  admin: { useAsTitle: 'title', group: 'Content', defaultColumns: ['title', 'period', 'status'] },
  access: contentAccess,
  hooks: siteCacheHooks,
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'period', type: 'text', admin: { description: 'e.g. FY 2026' } },
    { name: 'description', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: ['draft', 'published'],
      admin: { position: 'sidebar' },
    },
    { name: 'file', type: 'upload', relationTo: 'media', admin: { description: 'PDF report (preferred)' } },
    { name: 'file_url', type: 'text', admin: { description: 'Legacy file path' } },
  ],
}

export const FinancialHighlights: CollectionConfig = {
  slug: 'financial-highlights',
  admin: { useAsTitle: 'label', group: 'Content', defaultColumns: ['label', 'value', 'sort_order'] },
  access: contentAccess,
  hooks: siteCacheHooks,
  defaultSort: 'sort_order',
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'value', type: 'text', required: true, admin: { description: 'e.g. $25,000' } },
    { name: 'description', type: 'textarea' },
    { name: 'sort_order', type: 'number', required: true, defaultValue: 0 },
  ],
}
