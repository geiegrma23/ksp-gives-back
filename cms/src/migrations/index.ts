import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260930_192235_add_user_roles from './20260930_192235_add_user_roles';
import * as migration_20260930_195912_site_content_model from './20260930_195912_site_content_model';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260930_192235_add_user_roles.up,
    down: migration_20260930_192235_add_user_roles.down,
    name: '20260930_192235_add_user_roles',
  },
  {
    up: migration_20260930_195912_site_content_model.up,
    down: migration_20260930_195912_site_content_model.down,
    name: '20260930_195912_site_content_model'
  },
];
