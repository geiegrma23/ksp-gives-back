import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '../lib/access'
import { purgeSiteCache } from '../lib/siteCache'

// Every singleton text field the public site renders. Field names mirror the
// legacy site_content keys 1:1 so the site worker's mapping stays trivial.
const t = (name: string, opts: Record<string, unknown> = {}) => ({
  name,
  type: 'text' as const,
  ...opts,
})
const ta = (name: string, opts: Record<string, unknown> = {}) => ({
  name,
  type: 'textarea' as const,
  ...opts,
})

export const SiteContent: GlobalConfig = {
  slug: 'site-content',
  label: 'Site Content',
  admin: { group: 'Site' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [purgeSiteCache] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            t('hero_title'),
            t('hero_subtitle'),
            ta('hero_description'),
            t('hero_goals_heading'),
            t('hero_cta_text'),
            t('hero_cta_link', { admin: { description: 'e.g. mailto:info@mnquietvalor.com or a URL' } }),
            {
              name: 'hero_bg',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Hero background photo (preferred)' },
            },
            t('hero_bg_image', { admin: { description: 'Legacy media filename — used if no photo uploaded above' } }),
            ta('hero_video_embed', { admin: { description: 'Optional video embed HTML' } }),
          ],
        },
        {
          label: 'Donate',
          fields: [
            t('donate_text'),
            t('donate_url', { admin: { description: 'Donation link (Clover)' } }),
          ],
        },
        {
          label: 'Section Headings',
          fields: [
            t('mission_label'),
            t('mission_title'),
            t('values_label'),
            t('values_title'),
            t('goals_label'),
            t('goals_title'),
            t('financials_label'),
            t('financials_title'),
            ta('financials_intro'),
          ],
        },
        {
          label: 'Banner',
          fields: [t('banner_text'), t('banner_sub')],
        },
        {
          label: 'Contact',
          fields: [
            t('contact_label'),
            t('contact_title'),
            ta('contact_intro'),
            t('contact_address'),
            t('contact_phone'),
            t('contact_email'),
            t('contact_hours'),
            t('contact_cta_text'),
            t('contact_cta_link'),
          ],
        },
        {
          label: 'Footer',
          fields: [
            t('footer_copyright'),
            t('footer_parent_text'),
            t('footer_parent_name'),
            t('footer_parent_link'),
          ],
        },
        {
          label: 'About Page',
          fields: [
            t('about_label'),
            t('about_title'),
            ta('about_intro'),
            {
              name: 'about_img',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Optional About header image' },
            },
            t('about_image', { admin: { description: 'Legacy media filename' } }),
            t('about_mission_title'),
            ta('about_mission_text'),
            t('about_governance_title'),
            ta('about_governance_text'),
            t('about_commitment_title'),
            ta('about_commitment_text'),
          ],
        },
      ],
    },
  ],
}
