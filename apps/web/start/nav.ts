/*
|--------------------------------------------------------------------------
| Admin navigation composition
|--------------------------------------------------------------------------
|
| Registers the admin navigation entries of every domain existing in this
| flavor of the application, in sidebar order. This file is part of the
| composition set that flavor manifests may rewrite: remove a domain's
| registration and its entries disappear from the admin sidebar.
|
*/

import app from '@adonisjs/core/services/app';
import { fileNavEntries } from '#app/file/nav';
import { identityNavEntries } from '#app/identity/nav';
import { loggingNavEntries } from '#app/log/nav';
import { pageNavEntries } from '#cms/domain/services/page/page_nav';
import { templateNavEntries } from '#cms/domain/services/template/template_nav';
import { coreNavEntries } from '#services/core/core_nav';
import { NavRegistry } from '#services/core/nav_registry';
import { maintenanceNavEntries } from '#services/maintenance/maintenance_nav';

app.container.singleton(NavRegistry, () => new NavRegistry());

const registry = await app.container.make(NavRegistry);

registry.register('core', coreNavEntries);
registry.register('page', pageNavEntries);
registry.register('template', templateNavEntries);
registry.register('file', fileNavEntries);
registry.register('identity', identityNavEntries);
registry.register('maintenance', maintenanceNavEntries);
registry.register('logging', loggingNavEntries);
