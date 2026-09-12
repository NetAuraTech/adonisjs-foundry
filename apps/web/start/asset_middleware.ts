/*
|--------------------------------------------------------------------------
| View-layer asset middleware composition
|--------------------------------------------------------------------------
|
| The `api` flavor drops the entire Inertia/Vite stack, so no asset
| middleware is registered. `start/kernel.ts` keeps its single
| unconditional reference and this array is simply empty.
|
*/

export const assetMiddleware = [];
