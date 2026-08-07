/*
|--------------------------------------------------------------------------
| Feature flags
|--------------------------------------------------------------------------
|
| Runtime toggles to enable or disable route modules.
| All features are enabled by default — change a boolean to
| deactivate a module at runtime without touching routing code.
|
*/

export default {
  auth: true,
  settings: true,
  admin: true,
  adminApi: true,
  cms: true,
  maintenance: true,
} as const
