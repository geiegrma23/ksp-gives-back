import type { Access } from 'payload'

// Public site content: anyone can read via REST, any logged-in user
// (admin or editor) can write. User management is locked down in Users.ts.
export const anyone: Access = () => true
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

export const contentAccess = {
  read: anyone,
  create: authenticated,
  update: authenticated,
  delete: authenticated,
}
