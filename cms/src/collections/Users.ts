import type { Access, CollectionConfig, FieldHook } from 'payload'

type UserWithRoles = { id: string | number; roles?: ('admin' | 'editor')[] | null }

const isAdmin: Access = ({ req: { user } }) =>
  Boolean((user as UserWithRoles | null)?.roles?.includes('admin'))

const isAdminOrSelf: Access = ({ req: { user }, id }) => {
  const u = user as UserWithRoles | null
  if (u?.roles?.includes('admin')) return true
  return Boolean(u && id && String(u.id) === String(id))
}

// The very first account created (the create-first-user screen) becomes an
// admin regardless of defaults, so the instance can never be born locked out.
const ensureFirstUserIsAdmin: FieldHook = async ({ operation, req, value }) => {
  if (operation === 'create') {
    const existing = await req.payload.find({ collection: 'users', limit: 0 })
    if (existing.totalDocs === 0) return ['admin']
  }
  return value
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['editor'],
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      saveToJWT: true,
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
      access: {
        // Only admins may grant or change roles
        create: ({ req: { user } }) =>
          Boolean((user as UserWithRoles | null)?.roles?.includes('admin')),
        update: ({ req: { user } }) =>
          Boolean((user as UserWithRoles | null)?.roles?.includes('admin')),
      },
    },
  ],
  versions: false,
}
