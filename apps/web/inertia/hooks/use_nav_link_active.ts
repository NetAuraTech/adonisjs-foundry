/**
 * Re-export of the design system's active-nav-link hook.
 *
 * The matching logic lives in `@foundry/design-system` (it is a presentation
 * concern, not app logic). This thin re-export keeps the app's existing
 * `~/hooks/use_nav_link_active` import path stable for the remaining
 * app-owned call sites.
 */
export { useNavLinkActive } from '@foundry/design-system/use-nav-link-active';
