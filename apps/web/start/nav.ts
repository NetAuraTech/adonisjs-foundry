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
import { cmsNavEntries } from '#app/cms/nav';
import { coreNavEntries, maintenanceNavEntries } from '#app/core/nav';
import { fileNavEntries } from '#app/file/nav';
import { identityNavEntries } from '#app/identity/nav';
import { loggingNavEntries } from '#app/log/nav';
import { NavRegistry } from '#core/services/nav_registry';

app.container.singleton(NavRegistry, () => new NavRegistry());

const registry = await app.container.make(NavRegistry);

registry.register('core', coreNavEntries);
registry.register('cms', cmsNavEntries);
registry.register('file', fileNavEntries);
registry.register('identity', identityNavEntries);
registry.register('maintenance', maintenanceNavEntries);
registry.register('logging', loggingNavEntries);
