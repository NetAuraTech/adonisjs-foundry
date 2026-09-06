/*
|--------------------------------------------------------------------------
| Feature flags
|--------------------------------------------------------------------------
|
| Runtime toggles to enable or disable route modules.
| All features are enabled by default — change a boolean to
| deactivate a module at runtime without touching routing code.
|
| The `api` flavor prunes the entire Inertia/Vite view layer AND the
| CMS module (the CMS lives on `main` only): the session-rendered
| auth, settings and admin surfaces are `false`, `cms` is `false`, and
| only the non-CMS token-guarded REST layer (`adminApi`) stays on.
*/

export default {
	auth: false,
	settings: false,
	admin: false,
	adminApi: true,
	cms: false,
	maintenance: true,
} as const;
