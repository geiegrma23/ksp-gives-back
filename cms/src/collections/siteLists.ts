import type { CollectionConfig } from 'payload'

import { contentAccess } from '../lib/access'
import { siteCacheHooks } from '../lib/siteCache'

// Field names intentionally mirror the legacy site database columns so the
// public site worker's mapping layer stays trivial.

const sortOrder = {
  name: 'sort_order',
  type: 'number' as const,
  required: true,
  defaultValue: 0,
  admin: { description: 'Lower numbers appear first' },
}

export const MissionCards: CollectionConfig = {
  slug: 'mission-cards',
  labels: { singular: 'Mission Card', plural: 'Mission / Purpose / Vision' },
  admin: { useAsTitle: 'title', group: 'Home Page', defaultColumns: ['title', 'sort_order'] },
  access: contentAccess,
  hooks: siteCacheHooks,
  defaultSort: 'sort_order',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'body', type: 'textarea', required: true },
    sortOrder,
  ],
}

export const ValuesItems: CollectionConfig = {
  slug: 'values-items',
  labels: { singular: 'Value', plural: 'Values' },
  admin: { useAsTitle: 'title', group: 'Home Page', defaultColumns: ['title', 'sort_order'] },
  access: contentAccess,
  hooks: siteCacheHooks,
  defaultSort: 'sort_order',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    sortOrder,
  ],
}

export const Goals: CollectionConfig = {
  slug: 'goals',
  labels: { singular: 'Goal', plural: 'Goals' },
  admin: { useAsTitle: 'title', group: 'Home Page', defaultColumns: ['number', 'title', 'sort_order'] },
  access: contentAccess,
  hooks: siteCacheHooks,
  defaultSort: 'sort_order',
  fields: [
    { name: 'number', type: 'text', required: true, admin: { description: 'Display number, e.g. 01' } },
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    sortOrder,
  ],
}

export const HeroGoals: CollectionConfig = {
  slug: 'hero-goals',
  labels: { singular: 'Hero Goal', plural: 'Hero Goals (bullets)' },
  admin: { useAsTitle: 'text', group: 'Home Page', defaultColumns: ['text', 'sort_order'] },
  access: contentAccess,
  hooks: siteCacheHooks,
  defaultSort: 'sort_order',
  fields: [{ name: 'text', type: 'text', required: true }, sortOrder],
}

export const NavItems: CollectionConfig = {
  slug: 'nav-items',
  labels: { singular: 'Nav Item', plural: 'Navigation' },
  admin: { useAsTitle: 'label', group: 'Site', defaultColumns: ['label', 'url', 'visible', 'sort_order'] },
  access: contentAccess,
  hooks: siteCacheHooks,
  defaultSort: 'sort_order',
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'url', type: 'text', required: true, admin: { description: 'e.g. /about/ or /#contact' } },
    { name: 'visible', type: 'checkbox', defaultValue: true },
    sortOrder,
  ],
}
